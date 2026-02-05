# m.ai – Backend

Streaming AI backend built with **FastAPI** and **Ollama**.
Provides NDJSON streaming compatible with Chat AI M.ai.

---

## Prerequisites

- Python 3.10+
- Ollama installed
- Local Ollama model (example: gemma2:2b)

---

## Start Ollama

```bash
ollama serve
```

Check models:
```bash
ollama list
```

Pull model if needed:
```bash
ollama pull gemma2:2b
```

---

## Setup Virtual Environment

From the `backend/` directory:

### Windows (CMD)
```bat
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Windows (PowerShell)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Environment Variables

Set before running:

- CHAT_BACKEND=ollama
- OLLAMA_BASE_URL=http://127.0.0.1:11434
- OLLAMA_MODEL=gemma2:2b

---

## Run Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend available at:
http://localhost:8000

---

## Health Check

```text
http://localhost:8000/health
```

---

## Streaming Endpoint

POST:
```text
/api/chat/stream
```

Example:
```bash
curl -N http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Say hi in 3 words\"}]}"
```

Expected output:
```json
{"delta":"Hi there friend"}
{"done":true}
```

---

## Notes

- Uses Ollama `/api/generate`
- Model name must exactly match `ollama list`
- CORS enabled for local frontend
