import { useMemo, useState } from "react";

const MODELS = ["tiny", "base", "small", "medium", "large"];

function App() {
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [model, setModel] = useState("base");
  const [task, setTask] = useState("transcribe");
  const [language, setLanguage] = useState("auto");
  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);

  const canRun = useMemo(() => inputPath && outputPath && !busy, [inputPath, outputPath, busy]);

  const chooseInput = async () => {
    const selected = await window.desktopAPI.pickInput();
    if (!selected) {
      return;
    }

    setInputPath(selected);
    if (!outputPath) {
      setOutputPath(selected.replace(/\.[^.]+$/, ".txt"));
    }
  };

  const chooseOutput = async () => {
    const selected = await window.desktopAPI.pickOutput(outputPath || "transcript.txt");
    if (selected) {
      setOutputPath(selected);
    }
  };

  const runTranscription = async () => {
    if (!canRun) {
      return;
    }

    setBusy(true);
    setStatus("Transcribing with Whisper...");

    const result = await window.desktopAPI.transcribe({
      inputPath,
      outputPath,
      model,
      task,
      language,
    });

    if (!result.ok) {
      setStatus(`Failed: ${result.error}`);
      setBusy(false);
      return;
    }

    try {
      const payload = JSON.parse(result.data);
      setTranscript(payload.text || "");
      setStatus(`Done in ${payload.elapsed_seconds}s. Saved to ${payload.output}`);
    } catch (error) {
      setStatus(`Done, but failed to parse response: ${String(error)}`);
    }

    setBusy(false);
  };

  return (
    <main className="app">
      <h1>Whisper Desktop (React + Electron)</h1>
      <p className="muted">Transcribe local audio/video files on your PC using OpenAI Whisper.</p>

      <div className="form-grid">
        <label>Input file</label>
        <input value={inputPath} readOnly placeholder="Select audio/video file" />
        <button onClick={chooseInput}>Browse</button>

        <label>Output file</label>
        <input value={outputPath} readOnly placeholder="Select .txt output path" />
        <button onClick={chooseOutput}>Save As</button>

        <label>Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {MODELS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>

        <label>Task</label>
        <select value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="transcribe">transcribe</option>
          <option value="translate">translate</option>
        </select>

        <label>Language</label>
        <input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="auto, en, fr, ..."
        />
      </div>

      <div className="actions">
        <button disabled={!canRun} onClick={runTranscription}>
          {busy ? "Working..." : "Transcribe"}
        </button>
        <button
          onClick={() => {
            setTranscript("");
            setStatus("Ready");
          }}
        >
          Clear
        </button>
      </div>

      <p className="status">{status}</p>

      <textarea value={transcript} readOnly placeholder="Transcript appears here" rows={16} />
    </main>
  );
}

export default App;
