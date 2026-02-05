import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'xshift-theme'

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

/** Run once on app load so even login page respects saved theme */
export function initThemeOnLoad() {
  const stored = getStoredTheme()
  const theme = stored ?? getSystemTheme()
  applyTheme(theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // SSR-safe default
    if (typeof window === 'undefined') return 'dark'
    return getStoredTheme() ?? getSystemTheme()
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }
}
