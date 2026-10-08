import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrder } from '../context/OrderContext'
import { useVehicle } from '../context/VehicleContext'
import { useLanguage } from '../context/LanguageContext'

export function CheckoutPage() {
  const { items, removeFromCart, updateQuantity, subtotal, taxTotal } = useCart()
  const { placeOrder } = useOrder()
  const { vehicle } = useVehicle()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [shippingMethod, setShippingMethod] = useState('standard') // standard | priority | courier
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shippingCost = shippingMethod === 'standard' ? 0 : shippingMethod === 'priority' ? 14.99 : 24.99
  const grandTotal = subtotal + shippingCost + taxTotal

  const handlePlaceOrder = () => {
    if (items.length === 0) return
    setIsSubmitting(true)

    setTimeout(() => {
      placeOrder({
        items,
        vehicle,
        subtotal,
        shipping: shippingCost,
        tax: taxTotal,
        total: grandTotal,
      })
      navigate('/orders')
    }, 600)
  }

  if (items.length === 0) {
    return (
      <div className="w-full pt-28 pb-20 bg-surface min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-4xl">shopping_cart</span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{t('cartEmptyTitle')}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 mb-6">
            {t('cartEmptyDesc')}
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md font-bold hover:bg-primary transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>{t('browseCatalog')}</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pt-16 sm:pt-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-5 sm:space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
          <div>
            <h1 className="font-headline-lg text-headline-lg sm:text-headline-xl text-on-surface font-extrabold tracking-tight">
              {t('checkoutTitle')}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {t('checkoutSub')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-tertiary text-[16px]">lock</span>
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* Fitment Target Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-tertiary-fixed/20 border border-tertiary/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">
              Target Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
            <span className="hidden sm:inline-block font-data-mono-sm text-data-mono-sm bg-surface-container-lowest px-2 py-0.5 rounded text-on-surface-variant">
              VIN: {vehicle.vin}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary font-bold bg-tertiary-fixed/40 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            100% FIT GUARANTEE ACTIVE
          </span>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Form (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Delivery Destination */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">local_shipping</span>
                  <h2 className="font-headline-md text-title-lg sm:text-headline-md text-on-surface font-bold">1. Delivery Destination</h2>
                </div>
                <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-md font-semibold whitespace-nowrap shrink-0">
                  Commercial Garage
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-title-md text-title-md font-bold text-on-surface">Precision Auto Care (Alex Mercer)</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    742 Evergreen Terrace, Bay 3, Springfield, OR 97477
                  </p>
                </div>
                <div className="font-data-mono-sm text-data-mono-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">call</span> +1 (555) 019-2834
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Delivery notes or dock instructions (optional)..."
                  className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Consignments & Items */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
                  <h2 className="font-headline-md text-title-lg sm:text-headline-md text-on-surface font-bold">2. Consignment Review</h2>
                </div>
                <span className="font-data-mono-sm text-data-mono-sm bg-surface-container px-2.5 py-1 rounded-lg text-on-surface font-semibold whitespace-nowrap shrink-0">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-14 h-14 rounded-lg object-cover bg-surface-container shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-title-md text-title-md font-semibold text-on-surface line-clamp-2 sm:line-clamp-1">
                          {product.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                          <span className="font-data-mono-sm">{product.sku}</span>
                          <span>•</span>
                          <span className="truncate">{product.vendor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-data-mono-sm text-data-mono-sm font-bold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded text-sm font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface block">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="font-label-sm text-label-sm text-error hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Service Tier */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
                <h2 className="font-headline-md text-title-lg sm:text-headline-md text-on-surface font-bold">3. Shipping Speed</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingMethod === 'standard'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs ring-1 ring-primary'
                      : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-title-md text-title-md font-bold text-on-surface">Standard Ground</span>
                    <span className="font-data-mono-sm text-data-mono-sm text-tertiary font-bold">FREE</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Est. 2-3 business days</p>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('priority')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingMethod === 'priority'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs ring-1 ring-primary'
                      : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-title-md text-title-md font-bold text-on-surface">Priority Air</span>
                    <span className="font-data-mono-sm text-data-mono-sm font-bold text-on-surface">$14.99</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Next-day guaranteed</p>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('courier')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingMethod === 'courier'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs ring-1 ring-primary'
                      : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-title-md text-title-md font-bold text-on-surface">Hotshot Courier</span>
                    <span className="font-data-mono-sm text-data-mono-sm font-bold text-on-surface">$24.99</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">4-Hour local dispatch</p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">credit_card</span>
                <h2 className="font-headline-md text-title-lg sm:text-headline-md text-on-surface font-bold">4. Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary font-bold'
                      : 'border-outline-variant/40 bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                  <span className="font-label-md text-label-md text-on-surface">Credit Card (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('net30')}
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'net30'
                      ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary font-bold'
                      : 'border-outline-variant/40 bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-secondary">receipt_long</span>
                  <span className="font-label-md text-label-md text-on-surface">Net 30 Commercial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('fleet')}
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'fleet'
                      ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary font-bold'
                      : 'border-outline-variant/40 bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-tertiary">local_shipping</span>
                  <span className="font-label-md text-label-md text-on-surface">Fleet Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Summary (4 Columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pb-3 border-b border-outline-variant/20">
                {t('orderSummary')}
              </h3>

              <div className="space-y-3 font-body-sm text-body-sm">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>{t('subtotal')}</span>
                  <span className="font-data-mono-sm text-on-surface font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>{t('shippingFee')}</span>
                  <span className="font-data-mono-sm text-on-surface font-semibold">
                    {shippingCost === 0 ? t('freeShipping') : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>{t('estimatedTax')}</span>
                  <span className="font-data-mono-sm text-on-surface font-semibold">${taxTotal.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-baseline justify-between">
                  <span className="font-title-md text-title-md font-bold text-on-surface">{t('totalDue')}</span>
                  <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-150 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('processing')}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>{t('placeOrder')}</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-surface-container-low rounded-xl text-center font-label-sm text-label-sm text-on-surface-variant">
                <span>{t('securityGuarantee')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
