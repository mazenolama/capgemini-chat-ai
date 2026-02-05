from __future__ import annotations

import json
import os
from typing import Any, AsyncGenerator, Dict, List, Literal, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()

# -----------------------------
# Config
# -----------------------------
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")

# You can set CHAT_BACKEND=ollama or dummy
CHAT_BACKEND = os.getenv("CHAT_BACKEND", "ollama").lower()

# Allow your frontend dev server(s)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Streaming Chat Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)
    # Optional knobs you can pass from frontend
    temperature: Optional[float] = None
    top_p: Optional[float] = None

# -----------------------------
# Helpers
# -----------------------------
def to_ndjson(obj: Dict[str, Any]) -> str:
    return json.dumps(obj, ensure_ascii=False) + "\n"

def messages_to_prompt(messages: List[ChatMessage]) -> str:
    """
    Convert chat history to a single prompt for /api/generate.
    Keep it simple & stable.
    """
    system_parts: List[str] = []
    convo_parts: List[str] = []

    for m in messages:
        if m.role == "system":
            system_parts.append(m.content.strip())
        elif m.role == "user":
            convo_parts.append(f"User: {m.content.strip()}")
        else:
            convo_parts.append(f"Assistant: {m.content.strip()}")

    system_block = ""
    if system_parts:
        system_block = "System:\n" + "\n".join(system_parts).strip() + "\n\n"

    convo_block = "\n".join(convo_parts).strip()
    if convo_block:
        convo_block += "\n"

    # End with assistant cue
    return f"{system_block}{convo_block}Assistant:"

# -----------------------------
# Streaming backends
# -----------------------------
async def stream_dummy(messages: List[ChatMessage]) -> AsyncGenerator[str, None]:
    q = messages[-1].content if messages else ""
    answer = (
        "Here’s a *streaming* markdown reply.\n\n"
        "**You asked:**\n\n"
        f"> {q}\n\n"
        "**Example code:**\n\n"
        "```ts\n"
        "type Hello = { msg: string }\n"
        "const x: Hello = { msg: 'hi' }\n"
        "```\n\n"
        "- Supports **GFM** (tables, lists, code blocks)\n"
        "- Streams as NDJSON chunks\n"
    )

    # Stream token-ish chunks
    for token in answer.split(" "):
        yield to_ndjson({"delta": token + " "})
    yield to_ndjson({"done": True})

async def stream_ollama_generate(
    messages: List[ChatMessage],
    temperature: Optional[float] = None,
    top_p: Optional[float] = None,
) -> AsyncGenerator[str, None]:
    """
    Stream tokens from Ollama /api/generate and convert them to NDJSON {delta}.
    Ollama returns JSON per line:
      { "response": "...", "done": false, ... }
      ...
      { "done": true, ... }
    """
    url = f"{OLLAMA_BASE_URL}/api/generate"
    prompt = messages_to_prompt(messages)

    payload: Dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
    }

    # Optional generation options
    options: Dict[str, Any] = {}
    if temperature is not None:
        options["temperature"] = temperature
    if top_p is not None:
        options["top_p"] = top_p
    if options:
        payload["options"] = options

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            async with client.stream("POST", url, json=payload) as r:
                if r.status_code >= 400:
                    # include body for debugging
                    body = await r.aread()
                    raise HTTPException(
                        status_code=502,
                        detail=f"Upstream error: {r.status_code} {r.reason_phrase} for url '{url}'. Body: {body[:500]!r}",
                    )

                async for line in r.aiter_lines():
                    if not line:
                        continue

                    try:
                        obj = json.loads(line)
                    except json.JSONDecodeError:
                        # If something unexpected comes from upstream, skip
                        continue

                    # token chunk
                    chunk = obj.get("response", "")
                    if chunk:
                        yield to_ndjson({"delta": chunk})

                    # done
                    if obj.get("done") is True:
                        yield to_ndjson({"done": True})
                        break

        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Upstream connection error to Ollama: {e}") from e

# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
def health():
    return {
        "ok": True,
        "backend": CHAT_BACKEND,
        "ollama_base_url": OLLAMA_BASE_URL,
        "ollama_model": OLLAMA_MODEL,
    }

@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages[] is required")

    async def generator() -> AsyncGenerator[str, None]:
        if CHAT_BACKEND == "dummy":
            async for chunk in stream_dummy(req.messages):
                yield chunk
        else:
            # default: ollama
            async for chunk in stream_ollama_generate(req.messages, req.temperature, req.top_p):
                yield chunk

    return StreamingResponse(generator(), media_type="application/x-ndjson")
