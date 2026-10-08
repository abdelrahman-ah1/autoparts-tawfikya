import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCTS, checkFitment } from '../data/products'
import { useVehicle } from '../context/VehicleContext'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export function PartsSearchPage() {
  const { vehicle, openVehicleModal } = useVehicle()
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [sortBy, setSortBy] = useState('recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + selectedBrands.length

  const categories = ['All', 'Brake Systems', 'Engine & Performance', 'Suspension & Steering']
  const brands = ['Bosch Auto Parts', 'Denso Aftermarket', 'Bilstein Shocks']

  const toggleBrand = (b) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    )
  }

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.oem.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      return 0
    })
  }, [selectedCategory, selectedBrands, searchQuery, sortBy])

  return (
    <div className="w-full pt-16 sm:pt-20 bg-surface">
      {/* Dynamic Vehicle Match Bar */}
      <div className="w-full bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-body-sm">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-bold shadow-xs">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>{t('calibratedForGarage')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.engine}
              </span>
              <span className="text-outline hidden sm:inline">•</span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                {t('vinTarget')}: {vehicle.vin}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={openVehicleModal}
            className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant font-semibold transition-colors self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>{t('changeVehicle')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Sidebar Filters */}
          <aside
            className={`${filtersOpen ? 'flex' : 'hidden'} lg:flex order-2 lg:order-none lg:col-span-3 w-full flex-col gap-5 lg:sticky lg:top-24`}
          >
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
              {/* Category Hierarchy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Sub-Systems
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm text-outline">
                    {categories.length} CATEGORIES
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm transition-colors text-left ${
                        selectedCategory === cat
                          ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="font-data-mono-sm text-data-mono-sm opacity-80">
                        {cat === 'All'
                          ? PRODUCTS.length
                          : PRODUCTS.filter((p) => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier-1 Brands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    OEM Manufacturer
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  {brands.map((b) => (
                    <label key={b} className="flex items-center justify-between cursor-pointer group select-none">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="w-4 h-4 rounded text-primary-container accent-primary-container cursor-pointer"
                        />
                        <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">
                          {b}
                        </span>
                      </div>
                      <span className="font-data-mono-sm text-data-mono-sm text-outline bg-surface-container-low px-1.5 py-0.5 rounded">
                        {PRODUCTS.filter((p) => p.brand === b).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset action */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedBrands([])
                  setSearchQuery('')
                }}
                className="w-full py-2 px-3 bg-surface-container text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Filters</span>
              </button>
            </div>
          </aside>

          {/* Main Results */}
          <section className="contents lg:flex lg:col-span-9 w-full flex-col gap-6">
            {/* Search toolbar */}
            <div className="order-1 lg:order-none bg-surface-container-lowest rounded-2xl p-3 sm:p-5 shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 w-full sm:w-auto relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by part, OEM number or keyword..."
                  className="w-full h-10 pl-9 pr-3.5 bg-surface-container-low rounded-xl text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container border border-transparent"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                  className={`lg:hidden h-9 px-3 rounded-xl border font-label-md text-label-md flex items-center gap-1.5 shrink-0 transition-colors ${
                    filtersOpen || activeFilterCount > 0
                      ? 'bg-primary-container text-on-primary border-primary-container'
                      : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                </button>
                <div className="flex-1 sm:flex-none min-w-0 flex items-center gap-2 bg-surface-container-low px-3 h-9 rounded-xl border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended / Exact Fit</option>
                    <option value="price-low">Price: Lowest to Highest</option>
                    <option value="price-high">Price: Highest to Lowest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Matrix */}
            <div className="order-3 lg:order-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((p) => {
                const fitment = checkFitment(p, vehicle)
                return (
                  <article
                    key={p.id}
                    className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs hover:shadow-md transition-all border border-outline-variant/30 flex flex-col justify-between group"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Fitment Status Badge */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-data-mono-sm text-data-mono-sm text-primary font-semibold bg-surface-container-low px-2 py-0.5 rounded">
                          OEM #{p.oem}
                        </span>
                        {fitment.status === 'exact' ? (
                          <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> {t('guaranteedFit')}
                          </span>
                        ) : fitment.status === 'warning' ? (
                          <span className="font-label-sm text-label-sm text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> {t('warningFitment')}
                          </span>
                        ) : (
                          <span className="font-label-sm text-label-sm text-error bg-error-container/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> {t('doesNotFit')}
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <Link
                        to="/product"
                        className="w-full h-44 rounded-xl bg-surface-container-low overflow-hidden flex items-center justify-center p-4 my-1"
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Title & Brand */}
                      <div>
                        <div className="text-[11px] font-label-sm uppercase text-outline font-semibold">
                          {p.brand}
                        </div>
                        <Link
                          to="/product"
                          className="block font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-0.5"
                        >
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="material-symbols-outlined text-[16px] text-amber-500"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-data-mono-sm text-data-mono-sm text-on-surface font-semibold">
                            {p.rating}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">({p.reviews})</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="font-label-sm text-label-sm bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-4 pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-headline-md text-headline-md text-on-surface font-extrabold">
                            ${p.price.toFixed(2)}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline line-through">
                            ${p.msrp.toFixed(2)}
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-tertiary font-bold">{t('inStock')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(p, 1)}
                        className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-2.5 px-4 rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2 shadow-sm font-semibold cursor-pointer active:scale-95 duration-150"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        <span>{t('addToCart')}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
