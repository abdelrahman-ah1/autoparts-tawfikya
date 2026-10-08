import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useVehicle } from '../context/VehicleContext'
import { useLanguage } from '../context/LanguageContext'

export function MechanicShareModal({ isOpen, onClose, product, cartItems }) {
  const { vehicle } = useVehicle()
  const { lang } = useLanguage()
  const ar = lang === 'ar'
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const items = product
    ? [{ title: product.title, oem: product.oem, sku: product.sku, price: product.price }]
    : cartItems?.map((i) => ({
        title: i.product.title,
        oem: i.product.oem,
        sku: i.product.sku,
        price: i.product.price
      })) || []

  const itemsText = items
    .map((item, idx) => `${idx + 1}. ${item.title}\n   OEM: ${item.oem} | ${ar ? 'الكود' : 'SKU'}: ${item.sku} | $${item.price.toFixed(2)}`)
    .join('\n\n')
  const quoteText = ar
    ? `🔧 عرض فني - أوتوبارتس\nالمركبة: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.engine})\nرقم الشاسيه: ${vehicle.vin}\n\nالمكونات المعتمدة:\n${itemsText}\n\nالتوافق: مرجع متقاطع ISO-9001 (ضمان استرجاع 100%)`
    : `🔧 AutoParts Marketplace Technical Quote\nVehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.engine})\nVIN: ${vehicle.vin}\n\nComponents Verified:\n${itemsText}\n\nFitment: ISO-9001 Cross-Referenced (100% Return Guarantee)`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quoteText).then(() => {
      setCopied(true)
      showToast(ar ? 'تم نسخ ورقة المواصفات!' : 'Build sheet copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(quoteText)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[9995] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/40 max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">build</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{ar ? 'ورقة تحقق الميكانيكي' : 'Mechanic Verification Sheet'}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{ar ? 'تصدير أكواد OEM المعتمدة ومواصفات العزم' : 'Export verified OEM codes & torque specs'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low font-data-mono-sm text-data-mono-sm text-on-surface whitespace-pre-wrap border border-outline-variant/30 max-h-56 overflow-y-auto">
            {quoteText}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={copyToClipboard}
              className="py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2 border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'done' : 'content_copy'}
              </span>
              <span>{copied ? (ar ? 'تم النسخ!' : 'Copied!') : (ar ? 'نسخ الملخص' : 'Copy Summary')}</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{ar ? 'مشاركة عبر واتساب' : 'Share WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
