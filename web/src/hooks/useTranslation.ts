import { useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export function useTranslation() {
  const { t, language, changeLanguage } = useLanguage()
  
  return useMemo(() => ({
    t,
    i18n: { language, changeLanguage }
  }), [t, language, changeLanguage])
}
