import type { ChatMessage } from '@/state/chatStore'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE ??
  'http://localhost:8000'

export type StreamChunk = { delta?: string; done?: boolean; error?: string }

export async function streamChatCompletion(args: {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
  signal?: AbortSignal
  onDelta: (delta: string) => void
  onDone?: () => void
  onError?: (msg: string) => void
}) {
  const res = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: args.messages }),
    signal: args.signal,
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx + 1)
      if (!line) continue
      let obj: StreamChunk
      try {
        obj = JSON.parse(line)
      } catch {
        continue
      }
      if (obj.error) args.onError?.(obj.error)
      if (obj.delta) args.onDelta(obj.delta)
      if (obj.done) {
        args.onDone?.()
        return
      }
    }
  }
  args.onDone?.()
}
