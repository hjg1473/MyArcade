import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type TranslationKey } from '../data/translations'
import type { Language } from '../types'

interface LanguageValue { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string }
const LanguageContext = createContext<LanguageValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('arcade-language') === 'en' ? 'en' : 'ko')
  useEffect(() => { localStorage.setItem('arcade-language', language); document.documentElement.lang = language }, [language])
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => translations[language][key] }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
