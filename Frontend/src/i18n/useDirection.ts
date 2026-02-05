import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language || 'en'
    const dir = lang.startsWith('ar') ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [i18n.language])
}
