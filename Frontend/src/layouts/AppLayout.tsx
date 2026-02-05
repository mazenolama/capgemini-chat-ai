import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Menu, MenuButton } from '@headlessui/react'
import { MessageSquareText, PlusCircle, Settings } from 'lucide-react'

import { useChatStore } from '@/state/chatStore'

type NavItem = { name: string; to: string; icon: (props: any) => React.ReactNode }

const primaryNav: NavItem[] = [
  { name: 'Chat', to: '/chat', icon: MessageSquareText },
  { name: 'Settings', to: '/settings', icon: Settings },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function AppLayout(_: PropsWithChildren) {
  const [sidebarCollapsed] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { conversations, newConversation, deleteConversation, activeId } = useChatStore()

  const convoItems = useMemo(() => {
    return conversations
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 30)
  }, [conversations])


  return (
    <div className="min-h-dvh">
      <div
        className={cx(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col bg-white dark:bg-zinc-950 transition-all duration-300 rounded-md',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-70'
        )}
      >
        <div className="flex grow flex-col overflow-y-auto rounded-xl border-r border-black/20 outline-0 px-6 shadow shadow-black/10">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2 mt-6.5">
              {/* <img
                alt="M.ai Logo"
                src="./assets/img/MainLogo.png"
                className="mx-auto h-12.5 w-auto "
              /> */}
              <h4 className="text-5xl font-semibold text-purple-950">M.ai</h4>
            </div>
          </div>

          <nav className="flex flex-1 flex-col mt-10">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <button
                  onClick={() => {
                    const id = newConversation('You are a helpful assistant. Reply in markdown when useful.')
                    navigate(`/chat/${id}`)
                  }}
                  className="w-full -mx-2 inline-flex justify-center gap-2 rounded-xl bg-purple-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-950"
                >
                  <PlusCircle className="size-5" /> New chat
                </button>

                <ul role="list" className="-mx-2 mt-3 space-y-1">
                  {primaryNav.map((item) => {
                    const active = pathname === item.to || pathname.startsWith(item.to + '/')
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          className=//"text-gray-600 hover:bg-purple-950/5 dark:text-gray-300 dark:bg-stone-700/10 dark:hover:bg-purple-950/20 dark:hover:text-white font-medium font-semibold group flex gap-x-3 rounded-md p-2 text-sm" 
                          {cx(
                            active
                              ? 'bg-purple-700/10 text-purple-950 font-semibold'
                              : 'text-gray-600 hover:bg-purple-950/5 dark:text-gray-300 dark:bg-stone-700/10 dark:hover:bg-purple-950/20 dark:hover:text-white font-medium',
                            'group flex gap-x-3 rounded-md p-2 text-sm'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="text-gray-500" //{cx(active ? 'text-purple-900' : 'text-gray-500', 'size-5 shrink-0')}
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>

              <li>
                <div className="-mx-2">
                  <div className="px-2 text-xs font-semibold tracking-wide text-zinc-500">Recent</div>
                  <ul role="list" className="mt-2 space-y-1">
                    {convoItems.length === 0 ? (
                      <li className="px-2 py-2 text-sm text-zinc-500">No chats yet.</li>
                    ) : (
                      convoItems.map((c) => {
                        const active = pathname === `/chat/${c.id}` || activeId === c.id
                        return (
                          <li key={c.id} className="group flex items-center gap-2">
                            <NavLink
                              to={`/chat/${c.id}`}
                              className={cx(
                                active
                                  ? 'bg-purple-700/5 text-purple-900 font-semibold'
                                  : 'text-gray-600 hover:bg-purple-950/5 dark:text-gray-300 dark:hover:bg-purple-950/20 dark:hover:text-white font-medium',
                                'flex-1 truncate rounded-md px-2 py-2 text-sm'
                              )}
                              title={c.title}
                            >
                              {c.title}
                            </NavLink>
                            <button
                              onClick={() => deleteConversation(c.id)}
                              className="cursor-pointer invisible rounded-lg px-2 py-2 text-xs text-zinc-500 hover:bg-zinc-100/20 group-hover:visible dark:hover:bg-zinc-900"
                              title="Delete"
                            >
                              ×
                            </button>
                          </li>
                        )
                      })
                    )}
                  </ul>
                </div>
              </li>

              <li className="-mx-6 mt-auto">
                <Menu as="div" className="relative inline-block border-t border-stone-300">
                  <MenuButton className="flex text-left gap-x-4 w-66 px-2 py-3 rounded text-sm font-semibold text-black dark:text-white hover:bg-white cursor-pointer">
                    <div className="relative inline-flex items-center justify-center w-10 h-10 mr-2 rounded-full overflow-hidden bg-black/10 dark:bg-gray-100">
                      <span className="font-medium text-base text-black">
                       MO
                      </span>
                    </div>
                    <div>
                      <p aria-hidden="true">Mazen Olama</p>
                      <p aria-hidden="true">mazen.olama00@gmail.com</p>
                    </div>
                  </MenuButton>

                </Menu>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <main className="py-4 lg:pl-66">
        <div className="px-4 sm:px-6 lg:px-8"><Outlet /></div>
      </main>
    </div>
  )
}
