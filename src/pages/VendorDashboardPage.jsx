import { LegacyHtmlPage } from '../components/LegacyHtmlPage'
import vendorDashboardHtml from '../content/vendorDashboard.html?raw'

export function VendorDashboardPage() {
  return <LegacyHtmlPage html={vendorDashboardHtml} />
}
