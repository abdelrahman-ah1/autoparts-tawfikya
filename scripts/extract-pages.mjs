import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const legacyDir = path.join(root, 'legacy')

const PAGES = [
  { name: 'home', file: 'index.html' },
  { name: 'partsSearch', file: 'parts_search.html' },
  { name: 'productDetail', file: 'product_detail.html' },
  { name: 'checkout', file: 'checkout.html' },
  { name: 'orderStatus', file: 'order_status.html' },
  { name: 'vendorDashboard', file: 'dashboard_supply.html' },
  { name: 'adminCatalog', file: 'dashboard.html' },
]

const LINK_REPLACEMENTS = [
  [/href="index\.html"/gi, 'href="/"'],
  [/href="parts_search\.html"/gi, 'href="/catalog"'],
  [/href="product_detail\.html"/gi, 'href="/product"'],
  [/href="checkout\.html"/gi, 'href="/checkout"'],
  [/href="order_status\.html"/gi, 'href="/orders"'],
  [/href="dashboard_supply\.html"/gi, 'href="/vendor"'],
  [/href="dashboard\.html"/gi, 'href="/admin"'],
]

const outDir = path.join(root, 'src', 'content')
fs.mkdirSync(outDir, { recursive: true })

for (const { name, file } of PAGES) {
  const srcPath = path.join(legacyDir, file)
  if (!fs.existsSync(srcPath)) {
    console.warn(`Skip missing: ${file}`)
    continue
  }
  let html = fs.readFileSync(srcPath, 'utf8')
  const mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/i)
  if (!mainMatch) {
    console.warn(`No <main> in ${file}`)
    continue
  }
  let content = mainMatch[1]
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '')
  for (const [re, repl] of LINK_REPLACEMENTS) {
    content = content.replace(re, repl)
  }
  fs.writeFileSync(path.join(outDir, `${name}.html`), content.trim(), 'utf8')
  console.log(`Wrote ${name}.html (${content.length} chars)`)
}
