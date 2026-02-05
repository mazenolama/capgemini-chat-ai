import { Trash2 } from 'lucide-react'
import { useChatStore } from '@/state/chatStore'

export default function Settings() {
  const { clearAll, conversations } = useChatStore()

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Local-only settings for this demo UI.</p>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Clear local chat history</div>
            <div className="text-sm text-zinc-500">Deletes {conversations.length} conversation(s) stored in your browser.</div>
          </div>
          <button
            onClick={clearAll}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <Trash2 className="size-4" /> Clear
          </button>
        </div>
      </div>
    </div>
  )
}
