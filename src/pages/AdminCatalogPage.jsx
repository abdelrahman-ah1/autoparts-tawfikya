import { LegacyHtmlPage } from '../components/LegacyHtmlPage'
import adminCatalogHtml from '../content/adminCatalog.html?raw'

export function AdminCatalogPage() {
  return <LegacyHtmlPage html={adminCatalogHtml} />
}
