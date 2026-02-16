const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("pick-input", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      {
        name: "Media",
        extensions: ["mp3", "wav", "m4a", "mp4", "mov", "mkv", "flac", "aac"],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("pick-output", async (_, defaultPath) => {
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: [
      { name: "Text", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
});

ipcMain.handle("transcribe", async (_, payload) => {
  const pythonExec = process.env.WHISPER_PYTHON || "python";
  const scriptPath = path.join(__dirname, "../backend/transcribe.py");

  const args = [
    scriptPath,
    "--input",
    payload.inputPath,
    "--output",
    payload.outputPath,
    "--model",
    payload.model,
    "--task",
    payload.task,
    "--language",
    payload.language || "auto",
  ];

  const result = await runCommand(pythonExec, args);
  return result;
});

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({ ok: false, error: String(error) });
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true, data: stdout.trim() });
        return;
      }

      resolve({
        ok: false,
        error: stderr.trim() || stdout.trim() || `Process exited with code ${code}`,
      });
    });
  });
}
