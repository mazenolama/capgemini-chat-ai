# m.ai – Frontend

M.ai web UI built with **React**, **TypeScript**, **Vite**, **TailwindCSS**, and **Zustand**.
Supports streaming AI responses and GitHub-style Markdown rendering.

---

## Prerequisites

- Node.js (recommended: latest LTS)
- npm

---

## Install

From the `frontend/` directory:

```bash
npm install
```

---

## Run (Development)

```bash
npm run dev
```

App will be available at:
http://localhost:5173

---

## Build (Production)

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

## Lint

```bash
npm run lint
```

---

## Environment Variables

Create a `.env` file in the `frontend/` root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the dev server after changing `.env`.

---

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS
- Zustand
- React Router
- react-markdown + remark-gfm + rehype-highlight
- Lucide Icons

---

## Notes

- Expects NDJSON streaming from backend:
  ```json
  { "delta": "text" }
  { "done": true }
  ```
