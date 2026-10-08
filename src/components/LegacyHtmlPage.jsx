import { useEffect } from 'react'
import { useLegacyPageContent } from '../hooks/useLegacyPageContent'
import { useLanguage } from '../context/LanguageContext'
import { translateDom } from '../i18n/domTranslate'

export function LegacyHtmlPage({ html, className = 'w-full pt-16 sm:pt-20 bg-surface' }) {
  const containerRef = useLegacyPageContent(html)
  const { lang } = useLanguage()

  useEffect(() => {
    translateDom(containerRef.current, lang)
  }, [lang, html, containerRef])

  return (
    <main className={className}>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
