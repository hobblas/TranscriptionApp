const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  pickInput: () => ipcRenderer.invoke("pick-input"),
  pickOutput: (defaultPath) => ipcRenderer.invoke("pick-output", defaultPath),
  transcribe: (payload) => ipcRenderer.invoke("transcribe", payload),
});
