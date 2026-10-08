import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCTS, checkFitment } from '../data/products'
import { useVehicle } from '../context/VehicleContext'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { ProductExplodedView } from '../components/ProductExplodedView'
import { MechanicShareModal } from '../components/MechanicShareModal'

export function ProductDetailPage() {
  const { vehicle, openVehicleModal } = useVehicle()
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const product = PRODUCTS[0] // QuietCast Ceramic Front Brake Pads
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('specs')
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const fitment = checkFitment(product, vehicle)

  const handleBuyNow = () => {
    addToCart(product, qty)
    navigate('/checkout')
  }

  return (
    <div className="w-full pt-16 sm:pt-20 bg-surface">
      {/* Topline Breadcrumb & Vehicle Fitment Alert */}
      <div className="w-full bg-surface-container-low py-3 px-4 sm:px-6 lg:px-12 border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant flex-wrap">
            <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span>Brake Systems</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="font-data-mono-sm text-data-mono-sm bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-semibold">
              SKU: {product.sku}
            </span>
          </nav>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
            <span>VIN Target: <strong className="text-on-surface font-data-mono-sm">{vehicle.vin}</strong></span>
            <span className="text-outline">|</span>
            <span className="text-on-surface font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visuals & Technical Specs */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            {/* Interactive Exploded View Component */}
            <ProductExplodedView product={product} />

            {/* Technical Specifications Tabs */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30">
              <div className="flex items-center gap-2 pb-3 overflow-x-auto [scrollbar-width:none] border-b border-outline-variant/20">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'specs'
                      ? 'bg-primary-container text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('techSpecs')}
                </button>
                <button
                  onClick={() => setActiveTab('compatibility')}
                  className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'compatibility'
                      ? 'bg-primary-container text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('verifiedVehicles')}
                </button>
              </div>

              {activeTab === 'specs' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 font-body-sm text-body-sm">
                  {Object.entries(product.specs).map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                      <span className="text-on-surface-variant">{label}</span>
                      <span className="font-semibold text-on-surface text-right font-data-mono-sm">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left font-body-sm text-body-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                        <th className="p-3 rounded-l-xl">Model & Platform</th>
                        <th className="p-3">Model Years</th>
                        <th className="p-3">Engine Trim</th>
                        <th className="p-3 rounded-r-xl">Fit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      <tr className={vehicle.make === 'Toyota' && vehicle.model === 'Corolla' ? 'bg-primary-fixed/20' : ''}>
                        <td className="p-3 font-semibold text-on-surface">Toyota Corolla (E170 / E210)</td>
                        <td className="p-3 font-data-mono-sm text-data-mono-sm">2014 – 2024</td>
                        <td className="p-3">1.8L L4 / 2.0L Dynamic Force</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-tertiary font-bold font-label-sm text-label-sm bg-tertiary-fixed/30 px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">check</span> EXACT FIT
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-on-surface">Toyota Matrix</td>
                        <td className="p-3 font-data-mono-sm text-data-mono-sm">2009 – 2014</td>
                        <td className="p-3">1.8L L4 Gas Base</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-tertiary font-semibold font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-[14px]">check</span> Direct Fit
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-on-surface">Toyota Prius V</td>
                        <td className="p-3 font-data-mono-sm text-data-mono-sm">2012 – 2017</td>
                        <td className="p-3">1.8L Hybrid Full Caliper</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-tertiary font-semibold font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-[14px]">check</span> Direct Fit
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Buy Box */}
          <div className="order-first lg:order-none lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4 sm:space-y-5">
              {/* Header tags */}
              <div className="flex items-center justify-between">
                <span className="font-data-mono-sm text-data-mono-sm bg-surface-container px-2.5 py-1 rounded-lg text-on-surface font-semibold tracking-wide">
                  PART # {product.sku}
                </span>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold bg-secondary-container px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[15px]">shield</span> TIER-1 OEM CERTIFIED
                </span>
              </div>

              {/* Title & Brand */}
              <div>
                <h1 className="font-headline-lg text-headline-md sm:text-headline-lg font-bold text-on-surface leading-tight">
                  {product.title}
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Live Vehicle Compatibility Callout */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  fitment.status === 'exact'
                    ? 'bg-tertiary-fixed/20 border-tertiary/30'
                    : 'bg-error-container/40 border-error/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    fitment.status === 'exact'
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-error text-on-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {fitment.status === 'exact' ? 'verified' : 'warning'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-label-md text-label-md font-bold uppercase ${
                        fitment.status === 'exact' ? 'text-tertiary' : 'text-error'
                      }`}
                    >
                      {fitment.label}
                    </span>
                    <button
                      onClick={openVehicleModal}
                      className="text-primary hover:underline font-label-sm text-label-sm font-semibold"
                    >
                      Change Vehicle
                    </button>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface mt-0.5">
                    {fitment.reason}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="p-4 bg-surface-container-low rounded-xl flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display-lg text-headline-xl sm:text-display-lg font-extrabold text-on-surface">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="font-body-sm text-body-sm line-through text-outline">
                      ${product.msrp.toFixed(2)} MSRP
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">savings</span>
                    Save ${(product.msrp - product.price).toFixed(2)} (24% Off)
                  </span>
                </div>
                <div className="w-full sm:w-auto flex sm:block items-center gap-2 sm:text-right">
                  <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold px-2.5 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span> In Stock
                  </span>
                  <span className="sm:block font-data-mono-sm text-data-mono-sm text-on-surface-variant sm:mt-1">
                    {product.stockCount} sets in {product.warehouse}
                  </span>
                </div>
              </div>

              {/* Featured Vendor Box */}
              <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <div>
                    <span className="font-title-md text-title-md font-bold text-on-surface block leading-tight">
                      {product.vendor}
                    </span>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                      <span
                        className="material-symbols-outlined text-[14px] text-amber-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <strong className="text-on-surface">{product.vendorRating}</strong>
                      <span>({product.vendorOrders} orders fulfilled)</span>
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline font-data-mono-sm text-data-mono-sm text-tertiary font-bold bg-surface-container-lowest px-2 py-1 rounded-md shrink-0">
                  FASTEST SHIP
                </span>
              </div>

              {/* Quantity Stepper & Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-surface-container-low rounded-xl p-1 border border-outline-variant/30">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-data-mono-md text-data-mono-md font-bold text-on-surface">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart(product, qty)}
                    className="flex-1 py-3 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-150"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    <span>{t('addToCart')}</span>
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-title-md text-title-md font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 duration-150"
                >
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>{t('instantCheckout')} (${(product.price * qty).toFixed(2)})</span>
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[17px] text-tertiary">send</span>
                  <span>{t('shareMechanic')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MechanicShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
      />
    </div>
  )
}
