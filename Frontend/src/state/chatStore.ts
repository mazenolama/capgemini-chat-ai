import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

type ChatState = {
  conversations: Conversation[]
  activeId: string | null
  setActive: (id: string) => void
  newConversation: (seedPrompt?: string) => string
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addMessage: (conversationId: string, msg: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => void
  appendToLastAssistant: (conversationId: string, delta: string) => void
  clearAll: () => void
}

function now() {
  return Date.now()
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function autoTitle(messages: { role: ChatRole; content: string }[]) {
  const firstUser = messages.find((m) => m.role === 'user')?.content?.trim()
  if (!firstUser) return 'New chat'
  const t = firstUser.replace(/\s+/g, ' ')
  return t.length > 40 ? `${t.slice(0, 40)}…` : t
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,

      setActive: (id) => set({ activeId: id }),

      newConversation: (seedPrompt) => {
        const id = makeId()
        const createdAt = now()
        const messages: ChatMessage[] = seedPrompt
          ? [{ id: makeId(), role: 'system', content: seedPrompt, createdAt }]
          : []

        const convo: Conversation = {
          id,
          title: 'New chat',
          createdAt,
          updatedAt: createdAt,
          messages,
        }
        set((s) => ({ conversations: [convo, ...s.conversations], activeId: id }))
        return id
      },

      deleteConversation: (id) => {
        set((s) => {
          const next = s.conversations.filter((c) => c.id !== id)
          const activeId = s.activeId === id ? (next[0]?.id ?? null) : s.activeId
          return { conversations: next, activeId }
        })
      },

      renameConversation: (id, title) => {
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, title, updatedAt: now() } : c)),
        }))
      },

      addMessage: (conversationId, msg) => {
        const id = msg.id ?? makeId()
        const createdAt = msg.createdAt ?? now()
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c
            const messages = [...c.messages, { id, createdAt, role: msg.role, content: msg.content }]
            const title = c.title === 'New chat' ? autoTitle(messages) : c.title
            return { ...c, messages, title, updatedAt: now() }
          }),
        }))
      },

      appendToLastAssistant: (conversationId, delta) => {
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c
            const messages = [...c.messages]
            const last = messages[messages.length - 1]
            if (!last || last.role !== 'assistant') {
              messages.push({ id: makeId(), role: 'assistant', content: delta, createdAt: now() })
            } else {
              messages[messages.length - 1] = { ...last, content: last.content + delta }
            }
            return { ...c, messages, updatedAt: now() }
          }),
        }))
      },

      clearAll: () => set({ conversations: [], activeId: null }),
    }),
    {
      name: 'm_chat_v1',
      version: 1,
      partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId }),
    }
  )
)
