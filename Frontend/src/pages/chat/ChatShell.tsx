import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowUp, Square, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { Bot } from 'lucide-react'

import MarkdownMessage from '@/components/chat/MarkdownMessage'
import { streamChatCompletion } from '@/lib/api'
import { useChatStore } from '@/state/chatStore'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function ChatShell() {
  const navigate = useNavigate()
  const params = useParams()
  const convoId = params.id ?? null

  const { conversations, activeId, setActive, newConversation, addMessage, appendToLastAssistant } = useChatStore()
  const conversation = useMemo(
    () => conversations.find((c) => c.id === (convoId ?? activeId ?? '')),
    [conversations, convoId, activeId]
  )

  const [prompt, setPrompt] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Ensure we always have an active conversation and a URL.
  useEffect(() => {
    if (!conversation) {
      const id = newConversation(
        'You are a helpful assistant. Reply in GitHub-flavored markdown when useful.'
      )
      navigate(`/chat/${id}`, { replace: true })
      return
    }
    if (activeId !== conversation.id) setActive(conversation.id)
    if (!convoId) navigate(`/chat/${conversation.id}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, convoId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length, isStreaming])

  const stop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }

  const onSend = async () => {
    if (!conversation) return
    const text = prompt.trim()
    if (!text) return

    setPrompt('')
    addMessage(conversation.id, { role: 'user', content: text })
    // Start assistant message immediately, then stream into it.
    appendToLastAssistant(conversation.id, '')

    const ac = new AbortController()
    abortRef.current = ac
    setIsStreaming(true)

    try {
      const messages = conversation.messages
        .filter((m) => m.role !== 'assistant' || m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user' as const, content: text }])

      await streamChatCompletion({
        messages,
        signal: ac.signal,
        onDelta: (delta) => appendToLastAssistant(conversation.id, delta),
        onError: (msg) => toast.error(msg),
      })
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        toast.error(e?.message ?? 'Request failed')
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void onSend()
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  if (!conversation) {
    return <div className="p-8">Loading…</div>
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-2rem)] max-w-4xl flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-black/10 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex size-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-800">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{conversation.title}</div>
            </div>
          </div>
          {isStreaming ? (
            <button
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <Square className="size-4" /> Stop
            </button>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-1 py-6">
        <div className="space-y-6">
          {conversation.messages
            .filter((m) => m.role !== 'system')
            .map((m) => (
              <div
                key={m.id}
                className={cx(
                  'flex gap-3',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {m.role !== 'user' ? (
                  <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-900 text-white">
                    <Bot className="size-5" />
                  </div>
                ) : null}

                <div
                  className={cx(
                    'max-w-[min(48rem,90%)] rounded-2xl px-4 py-3 shadow-sm',
                    m.role === 'user'
                      ? 'bg-purple-900 text-white'
                      : 'border border-black/10 bg-white text-zinc-900 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100'
                  )}
                >
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm leading-6">{m.content}</div>
                  ) : (
                    <MarkdownMessage content={m.content || (isStreaming ? '…' : '')} />
                  )}
                </div>
              </div>
            ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 -mx-4 border-t border-black/10 bg-background/80 px-4 py-4 backdrop-blur">
        <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950">

          <textarea
            value={prompt}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder="Message… (Enter to send, Shift+Enter for new line)"
            className="min-h-[52px] max-h-40 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-zinc-400 overflow-y-auto"
            disabled={isStreaming}
            rows={1}
          />

          <button
            onClick={() => void onSend()}
            disabled={isStreaming || !prompt.trim()}
            className={cx(
              'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition',
              isStreaming || !prompt.trim()
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                : 'bg-purple-900 text-white hover:bg-purple-700'
            )}
          >
            <ArrowUp className="size-4" />
          </button>

        </div>
      </div>

    </div>
  )
}
