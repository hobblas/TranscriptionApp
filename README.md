# Whisper Desktop App (React + Electron)

This project is now implemented as a **desktop app with React UI** (running in Electron) and a Python backend that uses **OpenAI Whisper** for transcription.

## Stack

- React + Vite (renderer UI)
- Electron (desktop shell for Windows/macOS/Linux)
- Python `openai-whisper` (actual transcription engine)

## Requirements

- Node.js 18+
- Python 3.10+
- `ffmpeg` in your PATH
- PyTorch installed for your CPU/GPU: https://pytorch.org/get-started/locally/

## Install

1. Python dependencies:

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

2. Node dependencies:

```bash
npm install
```

## Run in development

```bash
npm run dev
```

## Run packaged UI without dev server

```bash
npm run build
npm start
```

## Usage

1. Click **Browse** and choose an audio/video file.
2. Click **Save As** and choose where transcript text should be written.
3. Choose model/task/language.
4. Click **Transcribe**.

## Notes

- On first use of a given model, Whisper downloads weights (can take time).
- Larger models are slower but can improve quality.
- If Python is not on PATH, set `WHISPER_PYTHON` env var before running:

```bash
# Example
WHISPER_PYTHON=/full/path/to/python npm run dev
```
