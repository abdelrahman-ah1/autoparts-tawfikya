// Arabic text-node/attribute translator for legacy HTML fragments (vendor / admin pages).
const EXACT = new Map(Object.entries({
  // Vendor portal
  'Apex Auto Supply Portal': 'بوابة أبكس لتوريد قطع السيارات',
  'Tier-1 Partner': 'شريك من الفئة الأولى',
  'Portland West DC (WH-04) • Live Feed Active': 'مركز بورتلاند الغربي (WH-04) • البث المباشر نشط',
  'Add Listing': 'إضافة منتج',
  'Sales (MTD)': 'المبيعات (منذ بداية الشهر)',
  'vs last month': 'مقارنة بالشهر الماضي',
  '714 orders': '714 طلباً',
  '$39.84 AOV': '$39.84 متوسط قيمة الطلب',
  'To Dispatch': 'بانتظار الشحن',
  'Pending': 'قيد الانتظار',
  '3 Priority Orders': '3 طلبات ذات أولوية',
  'Next Carrier Pickup: 14:00 PT': 'موعد استلام شركة الشحن القادم: 14:00 PT',
  'Pending Shipments & Dispatch Queue': 'الشحنات المعلّقة وقائمة الإرسال',
  '7 orders awaiting carrier handover': '7 طلبات بانتظار التسليم لشركة الشحن',
  'ALL ACTIVE': 'كل النشطة',
  'Batch Print': 'طباعة جماعية',
  'Order ID': 'رقم الطلب',
  'Customer & Destination': 'العميل والوجهة',
  'Items & Part SKU': 'الأصناف ورقم القطعة',
  'Shipping Method': 'طريقة الشحن',
  'Action': 'الإجراء',
  'Today, 09:14 AM': 'اليوم، 09:14 ص',
  'Today, 08:32 AM': 'اليوم، 08:32 ص',
  'Precision Autocare LLC': 'شركة بريسيجن لصيانة السيارات',
  'Seattle, WA (Zone 2)': 'سياتل، واشنطن (المنطقة 2)',
  'Boise, ID (Zone 3)': 'بويس، أيداهو (المنطقة 3)',
  'Bosch QuietCast Ceramic Pads': 'تيل فرامل سيراميك بوش كوايت كاست',
  'Bilstein B6 Performance Strut (F-LH)': 'مساعد بيلشتاين B6 عالي الأداء (أمامي أيسر)',
  'Priority Overnight': 'أولوية - توصيل ليلي',
  'Ground Standard': 'شحن بري عادي',
  'FedEx Priority': 'فيديكس - أولوية',
  'UPS Ground Freight': 'يو بي إس - شحن بري',
  'Print Label': 'طباعة الملصق',
  'Mark Dispatched': 'تحديد كمُرسل',
  'Showing 2 pending shipments': 'عرض شحنتين معلّقتين',
  // Admin catalog
  'ACES / PIES v4.2 Compliance': 'توافق ACES / PIES الإصدار 4.2',
  'Sync Active': 'المزامنة نشطة',
  'Vehicle Fitment Matrix & Catalog Engine': 'مصفوفة توافق المركبات ومحرك الكتالوج',
  'Manage SKU fitment and catalog bindings.': 'إدارة توافق القطع وروابط الكتالوج.',
  'OEM Mappings': 'ربط أرقام OEM',
  'Fitment Precision': 'دقة التوافق',
  'Fitment Tree Parameter Drilldown': 'تفصيل معاملات شجرة التوافق',
  'ACTIVE VEHICLE:': 'المركبة الحالية:',
  'Corolla L4 1.8L (E210 Platform)': 'كورولا L4 1.8 لتر (منصة E210)',
  '1. Model Year': '1. سنة الصنع',
  '2. Make': '2. الشركة المصنعة',
  '3. Model Family': '3. عائلة الموديل',
  '4. Engine Code & Displacement': '4. كود المحرك والسعة',
  'BMW Group': 'مجموعة BMW',
  'Corolla (Saloon / Touring)': 'كورولا (سيدان / تورينج)',
  '1.8L L4 Gas DOHC (2ZR-FE)': '1.8 لتر L4 بنزين DOHC (2ZR-FE)',
  '2.0L L4 Dual VVT-i (M20A-FKS)': '2.0 لتر L4 Dual VVT-i (M20A-FKS)',
  '1.8L Hybrid Atkinson (2ZR-FXE)': '1.8 لتر هايبرد أتكينسون (2ZR-FXE)',
  'All Engine Configurations': 'كل تكوينات المحرك',
  'SKU Interchange & Fitment Ledger': 'سجل تبادل القطع والتوافق',
  '4 Matched': '4 مطابقة',
  'Filter SKU, OEM...': 'تصفية برقم القطعة أو OEM...',
  'Column Visibility': 'إظهار الأعمدة',
  'Audit Log': 'سجل التدقيق',
  'Master SKU': 'رقم القطعة الرئيسي',
  'OEM Interchange #': 'رقم OEM البديل',
  'Sub-System': 'النظام الفرعي',
  'Vehicle Cohorts': 'المركبات المتوافقة',
  'Active Offers': 'العروض النشطة',
  'Tolerance': 'التفاوت',
  'Actions': 'الإجراءات',
  'Ceramic Disc Pad Set': 'طقم تيل فرامل سيراميك',
  'Iridium Long-Life Plug': 'شمعة إريديوم طويلة العمر',
  'Brake Systems': 'أنظمة الفرامل',
  'Engine & Ignition': 'المحرك والإشعال',
  '2014-2019 Toyota Corolla': 'تويوتا كورولا 2014-2019',
  '2018-2022 Toyota Corolla': 'تويوتا كورولا 2018-2022',
  'Front Axle Pair • Caliper Spec Akebono': 'زوج المحور الأمامي • مواصفات كليبر أكيبونو',
  'Also Verified: 2019 Ford F-150 3.3L': 'متوافق أيضاً: فورد F-150 2019 بمحرك 3.3 لتر',
  '3 Active Sellers': '3 بائعين نشطين',
  '2 Active Sellers': 'بائعان نشطان',
  'Stock: 480 units @ Central': 'المخزون: 480 وحدة @ المركزي',
  'Pack of 4 • 1,220 sets in stock': 'عبوة 4 قطع • 1,220 طقماً متوفراً',
  'Caliper Pad Spec: 12.4mm': 'مواصفة تيل الكليبر: 12.4 مم',
  'Thread: M12 x 1.25, 26.5mm': 'القلاووظ: M12 x 1.25، 26.5 مم',
  'Edit Matrix': 'تعديل المصفوفة',
  'Showing 1 to 4 of 2,840,119 verified catalog nodes': 'عرض 1 إلى 4 من 2,840,119 عنصراً موثقاً في الكتالوج',
  'Previous': 'السابق',
  'Next': 'التالي',
  'Toyota': 'تويوتا', 'Ford': 'فورد', 'Honda': 'هوندا', 'Chevrolet': 'شيفروليه',
  'Camry': 'كامري', 'RAV4': 'راف 4', 'Highlander': 'هايلاندر', 'Tacoma': 'تاكوما',
  'Click to copy': 'انقر للنسخ',
}))

const RE = [
  [/^Passed ±([\d.]+)mm$/, (m) => `اجتاز ±${m[1]} مم`],
  [/^SKU:$/, () => 'رقم القطعة:'],
  [/^•\s*Qty:\s*(\d+) Sets?$/, (m) => `• الكمية: ${m[1]} طقم`],
  [/^•\s*Qty:\s*(\d+) Units?$/, (m) => `• الكمية: ${m[1]} وحدة`],
]

const textRec = new WeakMap()
const attrRec = new WeakMap()

function trStr(s) {
  const t = s.replace(/\s+/g, ' ').trim()
  if (!t) return s
  let r = EXACT.get(t)
  if (r === undefined) {
    for (const [re, fn] of RE) {
      const m = t.match(re)
      if (m) {
        r = fn(m)
        break
      }
    }
  }
  if (r === undefined) return s
  const lead = s.match(/^\s*/)[0]
  const trail = s.match(/\s*$/)[0]
  return lead + r + trail
}

function processText(node, lang) {
  const v = node.nodeValue
  const rec = textRec.get(node)
  if (rec && v === rec.tr) {
    if (lang === 'ar') return
    node.nodeValue = rec.orig
    textRec.delete(node)
    return
  }
  if (rec) textRec.delete(node)
  if (lang !== 'ar') return
  const tr = trStr(v)
  if (tr === v) return
  textRec.set(node, { orig: v, tr })
  node.nodeValue = tr
}

function processAttrs(el, lang) {
  for (const a of ['placeholder', 'title', 'aria-label']) {
    if (!el.hasAttribute(a)) continue
    const v = el.getAttribute(a)
    const rec = attrRec.get(el) || {}
    const r = rec[a]
    if (r && v === r.tr) {
      if (lang === 'ar') continue
      el.setAttribute(a, r.orig)
      delete rec[a]
      continue
    }
    if (r) delete rec[a]
    if (lang !== 'ar') continue
    const tr = trStr(v)
    if (tr !== v) {
      rec[a] = { orig: v, tr }
      attrRec.set(el, rec)
      el.setAttribute(a, tr)
    }
  }
}

export function translateDom(root, lang) {
  if (!root) return
  processAttrs(root, lang)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    if (n.nodeType === 3) processText(n, lang)
    else processAttrs(n, lang)
  }
}
