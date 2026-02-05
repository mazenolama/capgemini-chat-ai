# Capgemini Chat AI

A full-stack, Chat.ai-style AI chat application built as part of a technical assessment.  
The project demonstrates **streaming AI responses**, **modern React architecture**, and **a Python backend integrated with a local LLM (Ollama)**.

The focus of this implementation is on:
- real-time streaming UX
- clean frontend state management
- backend-to-frontend NDJSON streaming
- production-ready structure and clarity

---
## 🎥 Project Demo

The following demo shows the full user flow, including message input, real-time
streaming responses, and Markdown rendering.

https://github.com/mazenolama/capgemini-chat-ai/demo.mp4


## ✨ Key Features

- **Chat.ai-like UI**
  - Modern chat layout with user / assistant messages
  - Auto-expanding input textarea
  - Markdown rendering (GitHub-style: code blocks, lists, tables)
  - Streaming responses with live updates

- **Real-Time Streaming**
  - Backend streams tokens as NDJSON
  - Frontend consumes and renders the stream incrementally
  - No polling, no artificial delays

- **Frontend (React + TypeScript)**
  - Vite + React 19
  - TailwindCSS for styling
  - Zustand for lightweight state management
  - React Router for routing
  - Clean, component-based architecture

- **Backend (Python + FastAPI)**
  - FastAPI with async streaming endpoints
  - Integrated with **Ollama** local LLMs
  - Uses `/api/generate` for maximum compatibility
  - Simple, extensible prompt construction

---

## 🧠 AI Model

The backend is designed to work with **local LLMs via Ollama**.  
Model can be changed using environment variables.

Example:
```env
OLLAMA_MODEL=gemma2:2b


