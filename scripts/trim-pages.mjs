/**
 * Removes redundant / decorative blocks from page HTML fragments.
 * Run: node scripts/trim-pages.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const contentDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')

function read(name) {
  return fs.readFileSync(path.join(contentDir, name), 'utf8')
}

function write(name, html) {
  fs.writeFileSync(path.join(contentDir, name), html, 'utf8')
  console.log(`${name}: ${html.length} chars`)
}

function removeBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker)
  if (start === -1) return html
  const end = html.indexOf(endMarker, start + startMarker.length)
  if (end === -1) return html
  return html.slice(0, start) + html.slice(end)
}

function removeArticleFrom(html, cardComment) {
  const start = html.indexOf(cardComment)
  if (start === -1) return html
  const nextCard = html.indexOf('<!-- CARD ', start + cardComment.length)
  const nextSection = html.indexOf('<!-- Pagination', start)
  let end = html.length
  if (nextCard !== -1) end = Math.min(end, nextCard)
  if (nextSection !== -1) end = Math.min(end, nextSection)
  return html.slice(0, start) + html.slice(end)
}

function removeTableRowFrom(html, rowComment) {
  const start = html.indexOf(rowComment)
  if (start === -1) return html
  const next = html.indexOf('<!-- Row ', start + rowComment.length)
  const nextBlock = html.indexOf('<!-- Pagination', start)
  let end = html.length
  if (next !== -1) end = Math.min(end, next)
  if (nextBlock !== -1) end = Math.min(end, nextBlock)
  return html.slice(0, start) + html.slice(end)
}

// --- home ---
let home = read('home.html')
home = removeBetween(home, '<!-- Subtle Architectural Grid Background Decorator -->', '<!-- Hero Section -->')
home = home.replace(
  /<!-- Hero Section -->[\s\S]*?<section class="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-12/,
  '<section class="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-10',
)
home = removeBetween(home, '<!-- Card 5: Transmission', '<!-- Card 6: Body')
home = removeBetween(home, '<!-- Card 6: Body', '<!-- Featured OEM')
home = removeBetween(home, '<!-- Featured OEM & Tier-1 Brand Bar -->', '<!-- Clean Value Pillars -->')
// Compact category cards: drop hero images
home = home.replace(
  /<div class="w-full h-44 rounded-lg overflow-hidden mb-5 bg-surface-container-low relative">[\s\S]*?<\/div>\n/g,
  '',
)
write('home.html', home)

// --- partsSearch ---
let parts = read('partsSearch.html')
parts = removeBetween(
  parts,
  '<!-- Active Vehicle Context Banner & Breadcrumb Tracker -->',
  '<!-- Main Canvas: Two-Column Responsive Grid -->',
)
parts =
  '<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">\n<nav aria-label="Breadcrumb" class="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">\n<a class="hover:text-primary transition-colors" href="/">Home</a>\n<span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>\n<span class="text-on-surface font-medium">Brake Systems</span>\n</nav>\n</div>\n' +
  parts.slice(parts.indexOf('<!-- Main Canvas'))
parts = removeBetween(parts, '<button class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container-low transition-colors text-left group">\n<span class="flex items-center gap-2">\n<span class="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">electric_meter</span>', '<!-- Price Range Filter -->')
parts = removeBetween(parts, '<label class="flex items-center justify-between cursor-pointer group select-none">\n<div class="flex items-center gap-2.5">\n<input class="w-4 h-4 rounded text-primary-container bg-surface-container-lowest focus:ring-0 focus:outline-none accent-primary-container cursor-pointer" type="checkbox"/>\n<span class="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">Brembo Brake Systems</span>', '<!-- Filter Reset Action -->')
parts = parts.replace(
  /<option>Price: Highest to Lowest<\/option>\n<option>Customer Rating \(High to Low\)<\/option>\n<option>Fastest Fulfillment Speed<\/option>/,
  '',
)
parts = parts.replace(
  /<!-- View Layout Toggle -->[\s\S]*?<\/div>\n<\/div>\n<\/div>\n<!-- 3-Column/,
  '</div>\n</div>\n<!-- 3-Column',
)
parts = removeArticleFrom(parts, '<!-- CARD 4: Bilstein')
parts = removeArticleFrom(parts, '<!-- CARD 5: Brembo')
parts = removeArticleFrom(parts, '<!-- CARD 6: Continental')
parts = removeArticleFrom(parts, '<!-- CARD 7: NGK')
parts = removeArticleFrom(parts, '<!-- CARD 8: Denso Direct')
parts = removeArticleFrom(parts, '<!-- CARD 9: Bosch QuietCast Brake Master')
write('partsSearch.html', parts)

// --- productDetail ---
let product = read('productDetail.html')
product = removeBetween(
  product,
  '<!-- Vehicle Confirmation Ribbon / Breadcrumb Topline -->',
  '<!-- Main 60/40 Split Content Grid -->',
)
product =
  '<div class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">\n<nav class="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant flex-wrap">\n<a class="hover:text-primary" href="/catalog">Catalog</a><span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span><span class="text-on-surface font-medium">Brake Pads</span>\n</nav>\n</div>\n' +
  product.slice(product.indexOf('<!-- Main 60/40'))
product = product.replace(
  /<!-- Visualizer Header -->[\s\S]*?<!-- Main Viewport Canvas -->/,
  '<!-- Main Viewport Canvas -->',
)
product = product.replace(/h-\[380px\]/, 'h-[280px]')
product = removeBetween(product, '<button class="gallery-thumb p-1 bg-surface-container-low rounded-lg transition-all hover:bg-surface-container" data-img-index="2">', '<button class="gallery-thumb p-1 bg-surface-container-low rounded-lg transition-all hover:bg-surface-container" data-img-index="3">')
product = removeBetween(product, '<button class="gallery-thumb p-1 bg-surface-container-low rounded-lg transition-all hover:bg-surface-container" data-img-index="3">', '</div>\n</div>\n<!-- Tabbed Technical')
product = product.replace(
  /<button class="tab-button[^"]*" id="tabBtn3">[\s\S]*?<\/button>/,
  '',
)
product = removeBetween(product, '<!-- Tab 3: OEM Interchange Matrix -->', '<!-- RIGHT COLUMN:')
product = product.replace(/<tr>\s*<td class="p-2.5 font-semibold text-on-surface">Toyota Matrix[\s\S]*?<\/tr>\s*/g, '')
product = product.replace(/<tr>\s*<td class="p-2.5 font-semibold text-on-surface">Toyota Prius V[\s\S]*?<\/tr>\s*/g, '')
product = product.replace(/<tr>\s*<td class="p-2.5 font-semibold text-on-surface">Scion xD[\s\S]*?<\/tr>\s*/g, '')
product = product.replace(
  /<div class="flex items-center justify-between p-2.5 rounded bg-surface-container-low">\s*<span class="text-on-surface-variant">Operating Heat Range[\s\S]*?<\/div>\s*/g,
  '',
)
product = product.replace(
  /<div class="flex items-center justify-between p-2.5 rounded bg-surface-container-low">\s*<span class="text-on-surface-variant">Torque Specification[\s\S]*?<\/div>\s*/g,
  '',
)
product = product.replace(
  /<button class="w-full py-3 px-space-md rounded-lg bg-on-surface[\s\S]*?Express 1-Click Checkout[\s\S]*?<\/button>/,
  '',
)
write('productDetail.html', product)

// --- checkout ---
let checkout = read('checkout.html')
checkout = checkout.replace(
  /<li class="flex items-center gap-2 text-on-surface-variant\/60">[\s\S]*?Confirmation[\s\S]*?<\/li>/,
  '',
)
checkout = checkout.replace(
  /<div class="flex flex-wrap items-center justify-between gap-3 p-space-sm px-space-md rounded-xl bg-tertiary-fixed[\s\S]*?100% Fit Guaranteed[\s\S]*?<\/div>/,
  '<div class="flex items-center gap-2 p-3 rounded-lg bg-tertiary-fixed/20 border border-tertiary/20 text-body-sm"><span class="material-symbols-outlined text-tertiary text-[18px]">verified</span><span data-bind-vehicle-name>Vehicle</span></div>',
)
checkout = removeBetween(checkout, '<!-- Package 2 of 2: Midwest Fleet Logistics -->', '<!-- 4. Payment Gateway Selection -->')
checkout = checkout.replace(/3 verified items dispatched across 2 fulfillment hubs\./, '2 items from Apex Auto Supply.')
checkout = checkout.replace(
  /<div class="hidden p-space-md[\s\S]*?id="tabContentPaypal"[\s\S]*?<\/div>\s*<\/div>/,
  '',
)
write('checkout.html', checkout)

// --- orderStatus ---
let orders = read('orderStatus.html')
orders = orders.replace(
  /<button class="bg-surface-container-low hover:bg-surface-container[\s\S]*?Invoice[\s\S]*?<\/button>\s*/,
  '',
)
orders = removeBetween(orders, '<!-- Package 2 Card -->', '</div>\n</div>')
orders = orders.replace('2 Packages', '1 Package')
orders = orders.replace(
  /<span class="inline-flex items-center gap-1.5">\s*<span class="material-symbols-outlined text-\[16px\] text-outline">credit_card[\s\S]*?<\/span>\s*/,
  '',
)
write('orderStatus.html', orders)

// --- adminCatalog ---
let admin = read('adminCatalog.html')
admin = admin.replace(
  /<p class="font-body-sm text-body-sm text-on-surface-variant">Global automotive ontology[\s\S]*?<\/p>/,
  '<p class="font-body-sm text-body-sm text-on-surface-variant">Manage SKU fitment and catalog bindings.</p>',
)
admin = admin.replace(
  /<div class="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant\/30">\s*<div class="w-8 h-8 rounded-lg bg-secondary-container[\s\S]*?Active Hubs[\s\S]*?<\/div>\s*<\/div>\s*/,
  '',
)
admin = removeBetween(admin, '<!-- Action Bar & Protocol Commands -->', '<!-- Fitment Tree Drilldown')
admin = removeBetween(admin, '<!-- Quick Sub-Category Badges -->', '<!-- Master SKU Fitment Data Table Section -->')
admin = removeTableRowFrom(admin, '<!-- Row 3: Shock Absorber')
admin = removeTableRowFrom(admin, '<!-- Row 4: Rear Brake Shoes')
const auditStart = admin.indexOf('<!-- Asymmetric Dual Panel: Fitment Verification Audit Log')
if (auditStart !== -1) {
  admin = admin.slice(0, auditStart).trimEnd() + '\n</div>\n</div>\n'
}
write('adminCatalog.html', admin)

// --- vendorDashboard ---
let vendor = read('vendorDashboard.html')
vendor = vendor.replace(
  /<button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container[\s\S]*?Bulk Sync[\s\S]*?<\/button>/,
  '',
)
vendor = removeBetween(vendor, '<!-- KPI 3 -->', '<!-- KPI 4 -->')
vendor = removeBetween(vendor, '<!-- KPI 4 -->', '<!-- Main Grid:')
vendor = removeTableRowFrom(vendor, '<!-- Row 3 -->')
vendor = removeTableRowFrom(vendor, '<!-- Row 4 -->')
vendor = removeBetween(vendor, '<!-- Right Column: Inventory Health', '<!-- Warehouse Dispatch Transit Speed SLA -->')
vendor = removeBetween(vendor, '<!-- Warehouse Dispatch Transit Speed SLA -->', '</div>\n</div>\n</div>')
write('vendorDashboard.html', vendor)

console.log('Trim complete.')
