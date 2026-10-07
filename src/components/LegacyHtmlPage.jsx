import { useLegacyPageContent } from '../hooks/useLegacyPageContent'

export function LegacyHtmlPage({ html, className = 'w-full pt-16 sm:pt-20 bg-surface' }) {
  const containerRef = useLegacyPageContent(html)

  return (
    <main className={className}>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
