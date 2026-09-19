import sys
import json
import os
import whisper

def run_transcription():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(json.dumps({"error": f"File not found: {audio_path}"}))
        sys.exit(1)

    try:
        # Load small multilingual model (English, Hindi, Tamil, etc.)
        model = whisper.load_model("small")
        result = model.transcribe(audio_path, fp16=False)
        
        transcript = result.get("text", "").strip()
        language = result.get("language", "en")

        output = {
            "success": True,
            "transcript": transcript,
            "language": language
        }
        print(json.dumps(output, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        output = {
            "error": str(e)
        }
        print(json.dumps(output, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    run_transcription()
