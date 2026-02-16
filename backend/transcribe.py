import argparse
import json
import time
from pathlib import Path

import whisper


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transcribe media files with Whisper")
    parser.add_argument("--input", required=True, dest="input_path")
    parser.add_argument("--output", required=True, dest="output_path")
    parser.add_argument("--model", default="base")
    parser.add_argument("--task", default="transcribe", choices=["transcribe", "translate"])
    parser.add_argument("--language", default="auto")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    input_path = Path(args.input_path)
    output_path = Path(args.output_path)

    if not input_path.exists():
      raise SystemExit(f"Input file does not exist: {input_path}")

    start = time.time()
    model = whisper.load_model(args.model)

    options = {"task": args.task, "fp16": False}
    language = args.language.strip()
    if language and language.lower() != "auto":
        options["language"] = language

    result = model.transcribe(str(input_path), **options)
    text = result.get("text", "").strip()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text + "\n", encoding="utf-8")

    elapsed = round(time.time() - start, 2)
    print(json.dumps({"text": text, "output": str(output_path), "elapsed_seconds": elapsed}))


if __name__ == "__main__":
    main()
