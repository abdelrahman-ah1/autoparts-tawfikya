import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('autoparts_lang')
      if (saved === 'ar' || saved === 'en') return saved
    } catch (e) {}
    return 'ar' // default to Arabic for bilingual rollout
  })

  useEffect(() => {
    try {
      localStorage.setItem('autoparts_lang', lang)
    } catch (e) {}

    const html = document.documentElement
    html.lang = lang
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))
  }

  const t = (key) => {
    const table = translations[lang] || translations.ar
    return table[key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, isRTL: lang === 'ar', setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
