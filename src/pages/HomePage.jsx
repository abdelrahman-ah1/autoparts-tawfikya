import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useVehicle } from '../context/VehicleContext'
import { useLanguage } from '../context/LanguageContext'
import { VinScannerModal } from '../components/VinScannerModal'

export function HomePage() {
  const { vehicle, setVehicle } = useVehicle()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [selectedYear, setSelectedYear] = useState(vehicle.year || '2018')
  const [selectedMake, setSelectedMake] = useState(vehicle.make || 'Toyota')
  const [selectedModel, setSelectedModel] = useState(vehicle.model || 'Corolla')
  const [selectedEngine, setSelectedEngine] = useState('1.8L-L4')
  const [vinScannerOpen, setVinScannerOpen] = useState(false)

  const handleSearchVehicle = (e) => {
    e.preventDefault()
    setVehicle({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel,
      trim: selectedEngine === '1.8L-L4' ? '1.8L L4 LE' : '2.0L Dynamic Force',
      engine: selectedEngine,
      vin: selectedMake === 'Toyota' ? 'JT2BF28K9J0189421' : '1FTFW1ED4MFA19823',
    })
    navigate('/catalog')
  }

  const categories = [
    {
      title: t('catBrakesTitle'),
      subtitle: t('catBrakesSub'),
      icon: 'disc_full',
      count: '1,420+ ' + t('partsAvailable'),
      category: 'Brakes',
    },
    {
      title: t('catEngineTitle'),
      subtitle: t('catEngineSub'),
      icon: 'valve',
      count: '3,890+ ' + t('partsAvailable'),
      category: 'Engine',
    },
    {
      title: t('catSuspensionTitle'),
      subtitle: t('catSuspensionSub'),
      icon: 'minor_crash',
      count: '940+ ' + t('partsAvailable'),
      category: 'Suspension',
    },
    {
      title: t('catElectricalTitle'),
      subtitle: t('catElectricalSub'),
      icon: 'electric_bolt',
      count: '2,110+ ' + t('partsAvailable'),
      category: 'Electrical',
    },
  ]

  return (
    <div className="flex flex-col w-full pt-16 bg-surface">
      {/* Hero & Vehicle Picker Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 pb-8 sm:pb-12 text-center relative z-10 w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm mb-4">
          <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
          <span>OEM Tolerance Fitment Engine v4.2 Active</span>
        </div>

        <h1 className="font-display-lg text-display-lg-mobile sm:text-display-lg text-on-surface max-w-4xl mx-auto tracking-tight font-extrabold">
          {t('heroTitlePrefix')} <span className="text-primary-container">{t('heroTitleHighlight')}</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-3 mb-8">
          {t('heroSubtitle')}
        </p>

        {/* Selector Card Container */}
        <div className="max-w-3xl mx-auto bg-surface-container-lowest shadow-xs rounded-2xl p-4 sm:p-8 text-start border border-outline-variant/30">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="font-title-md text-title-md text-on-surface font-semibold">{t('activeVehicle')}</span>
            </div>
            <button
              onClick={() => setVinScannerOpen(true)}
              className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              <span>{t('quickVinScan')}</span>
            </button>
          </div>

          <form onSubmit={handleSearchVehicle}>
            {/* 4 Step Inline Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Year */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">{t('step1')}</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full h-11 bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl px-3.5 pr-8 appearance-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all cursor-pointer border border-transparent focus:border-primary-container"
                  >
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                    <option value="2017">2017</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Make */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">{t('step2')}</label>
                <div className="relative">
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full h-11 bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl px-3.5 pr-8 appearance-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all cursor-pointer border border-transparent focus:border-primary-container"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Ford">Ford</option>
                    <option value="Honda">Honda</option>
                    <option value="BMW">BMW</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">{t('step3')}</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full h-11 bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl px-3.5 pr-8 appearance-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all cursor-pointer border border-transparent focus:border-primary-container"
                  >
                    {selectedMake === 'Toyota' ? (
                      <>
                        <option value="Corolla">Corolla</option>
                        <option value="Camry">Camry</option>
                        <option value="RAV4">RAV4</option>
                      </>
                    ) : selectedMake === 'Ford' ? (
                      <>
                        <option value="F-150">F-150</option>
                        <option value="Mustang">Mustang</option>
                        <option value="Explorer">Explorer</option>
                      </>
                    ) : (
                      <>
                        <option value="Civic">Civic</option>
                        <option value="Accord">Accord</option>
                        <option value="CR-V">CR-V</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Engine */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">{t('step4')}</label>
                <div className="relative">
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full h-11 bg-surface-container-low text-on-surface font-title-md text-title-md rounded-xl px-3.5 pr-8 appearance-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all cursor-pointer border border-transparent focus:border-primary-container truncate"
                  >
                    <option value="1.8L-L4">1.8L L4 Gas</option>
                    <option value="2.0L-L4">2.0L L4 Dual VVT</option>
                    <option value="1.8L-Hybrid">1.8L Hybrid</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5">
              <button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-title-md text-title-md flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">search_check</span>
                <span>{t('findFittingParts')}</span>
                <span className="font-data-mono-sm text-data-mono-sm bg-on-primary/20 px-2 py-0.5 rounded text-on-primary font-normal">
                  1,420 {t('partsAvailable')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">{t('shopByCategory')}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {t('shopByCategorySub')}
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 font-title-md text-title-md text-primary hover:text-primary-container transition-colors font-semibold"
          >
            <span>{t('viewAllSystems')}</span>
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={`/catalog?category=${cat.category}`}
              className="group bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-outline-variant/30"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container group-hover:bg-primary-fixed text-primary transition-colors flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors font-bold">
                  {cat.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{cat.subtitle}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">{cat.count}</span>
                <span className="font-label-md text-label-md text-primary flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform font-semibold">
                  <span>{t('browse')}</span>
                  <span className="material-symbols-outlined text-[14px] rtl:rotate-180">chevron_right</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">{t('trustFitmentTitle')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustFitmentDesc')}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">{t('trustDispatchTitle')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustDispatchDesc')}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">{t('trustSupportTitle')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustSupportDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <VinScannerModal isOpen={vinScannerOpen} onClose={() => setVinScannerOpen(false)} />
    </div>
  )
}
