import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

export function OrderStatusPage() {
  const { activeOrder, updateOrderStatus } = useOrder()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const steps = [
    { step: 1, label: t('orderConfirmed'), icon: 'check' },
    { step: 2, label: t('orderInTransit'), icon: 'local_shipping' },
    { step: 3, label: t('orderDelivered'), icon: 'home_pin' },
  ]

  const currentStep = Math.min(activeOrder.statusStep || 1, 3)
  const items = activeOrder.items || []
  const total = Number(activeOrder.total) || 0

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(activeOrder.trackingNumber)
    setCopied(true)
    showToast(t('copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full pt-16 sm:pt-20 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-4 sm:space-y-6">
        {/* Order Header */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-7 shadow-xs border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-data-mono-lg text-headline-md text-primary font-bold tracking-tight">
                #{activeOrder.id}
              </span>
              <span className="bg-tertiary-fixed/70 text-on-tertiary-fixed px-2.5 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1 font-semibold max-w-full">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span className="truncate">{activeOrder.vehicleName}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                {activeOrder.date}
              </span>
              <span className="text-on-surface font-semibold">Total: ${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>{t('packingSlip')}</span>
          </button>
        </div>

        {/* Demo status switcher */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]">motion_photos_on</span>
            {t('simulateProgression')}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {steps.map(({ step, label }) => (
              <button
                key={step}
                onClick={() => updateOrderStatus(step)}
                className={`px-3 py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all whitespace-nowrap ${
                  currentStep === step
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Package Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-data-mono-md text-data-mono-md font-bold shrink-0">
                01
              </div>
              <div className="min-w-0">
                <div className="font-title-md text-title-md text-on-surface font-semibold truncate">
                  {activeOrder.carrier}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">Hub: {activeOrder.hub}</div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                onClick={handleCopyTracking}
                className="font-data-mono-sm text-data-mono-sm text-on-surface hover:text-primary transition-colors flex items-center gap-1 min-w-0"
                title="Copy tracking number"
              >
                <span className="truncate">{activeOrder.trackingNumber}</span>
                <span className="material-symbols-outlined text-[14px] shrink-0">{copied ? 'check' : 'content_copy'}</span>
              </button>
              <a
                className="text-primary font-label-md text-label-md p-1.5 rounded-lg hover:bg-surface-container-low transition-colors inline-flex items-center gap-1 shrink-0"
                href={`https://www.ups.com/track?tracknum=${activeOrder.trackingNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{t('track')}</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Milestones */}
            <div className="rounded-xl p-4 border border-outline-variant/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-1 text-body-sm">
                <span className="font-label-md text-label-md text-on-surface-variant">{t('deliveryStatus')}</span>
                <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  {currentStep === 3 ? t('orderDelivered') : `${t('estimatedDelivery')}: ${activeOrder.estimatedDelivery}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 relative">
                <div className="absolute top-3.5 left-[16%] right-[16%] h-0.5 bg-surface-container-high">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  ></div>
                </div>
                {steps.map(({ step, label, icon }) => (
                  <div key={step} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        currentStep >= step
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-high text-outline'
                      } ${currentStep === step ? 'ring-4 ring-primary-fixed/50' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{icon}</span>
                    </div>
                    <span
                      className={`font-label-md text-label-md mt-1.5 ${
                        currentStep >= step ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                {t('packageContents')} ({items.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-3 border border-outline-variant/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="font-body-md text-body-md text-on-surface font-medium truncate">{item.title}</div>
                        <div className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                          {item.sku} • Qty {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-data-mono-md text-data-mono-md text-on-surface font-semibold shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0">verified_user</span>
                <div>
                  <h4 className="font-title-md text-title-md font-bold text-on-surface">{t('guaranteeTitle')}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {t('guaranteeDesc')}
                  </p>
                </div>
              </div>
              <Link
                to="/catalog"
                className="px-4 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors shrink-0 text-center"
              >
                {t('orderMoreParts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
