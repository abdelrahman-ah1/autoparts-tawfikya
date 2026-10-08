import { useState } from 'react'
import { useVehicle } from '../context/VehicleContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

export function VinScannerModal({ isOpen, onClose }) {
  const { setVehicle } = useVehicle()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [vinInput, setVinInput] = useState('1FTFW1ED4NFC92014')
  const [scanning, setScanning] = useState(false)
  const [step, setStep] = useState(0)

  if (!isOpen) return null

  const sampleVins = [
    { label: '2022 Ford F-150 (V6 EcoBoost)', vin: '1FTFW1ED4NFC92014', year: '2022', make: 'Ford', model: 'F-150', engine: '3.5L EcoBoost V6' },
    { label: '2018 Toyota Corolla (1.8L L4)', vin: 'JT2BURHE9JC284910', year: '2018', make: 'Toyota', model: 'Corolla', engine: '1.8L L4 Gas DOHC' },
    { label: '2021 BMW 330i (2.0L Turbo)', vin: 'WBA5R7C58MFL19204', year: '2021', make: 'BMW', model: '330i', engine: '2.0L Turbo B48' }
  ]

  const runScan = (targetVinObj) => {
    setScanning(true)
    setStep(1) // connecting

    setTimeout(() => {
      setStep(2) // querying NHTSA
    }, 600)

    setTimeout(() => {
      setStep(3) // decoding build-sheet
    }, 1300)

    setTimeout(() => {
      setScanning(false)
      const selected = targetVinObj || sampleVins[0]
      setVehicle({
        year: selected.year,
        make: selected.make,
        model: selected.model,
        engine: selected.engine,
        vin: selected.vin
      })
      showToast(`VIN Verified: ${selected.year} ${selected.make} ${selected.model}`)
      onClose()
      setStep(0)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-[9995] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/40 max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{t('vinScannerModalTitle')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('vinScannerModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={scanning}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {scanning ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-[48px] animate-spin">sync</span>
                <span className="material-symbols-outlined text-primary text-[24px] absolute">directions_car</span>
              </div>
              <div className="space-y-1">
                <div className="font-title-md text-title-md text-on-surface font-semibold">
                  {step === 1 && 'Querying Federal VIN Database...'}
                  {step === 2 && 'Ingesting Factory Build Sheet & Trim Code...'}
                  {step === 3 && 'Calibrating Brake & Rotor Tolerances (±0.02mm)...'}
                </div>
                <div className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  {vinInput.toUpperCase()}
                </div>
              </div>
              <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden max-w-xs">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: step === 1 ? '30%' : step === 2 ? '70%' : '100%' }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  {t('fastVinDecode')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={17}
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 1FTFW1ED4NFC92014"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-data-mono-md text-data-mono-md uppercase outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <button
                    onClick={() => runScan(sampleVins.find(v => v.vin === vinInput) || { ...sampleVins[0], vin: vinInput })}
                    className="px-5 h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{t('scan')}</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">{t('orLoadDemoChassis')}</span>
                <div className="grid grid-cols-1 gap-2">
                  {sampleVins.map((s) => (
                    <button
                      key={s.vin}
                      onClick={() => {
                        setVinInput(s.vin)
                        runScan(s)
                      }}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-left flex items-center justify-between border border-outline-variant/30 group"
                    >
                      <div>
                        <div className="font-title-md text-body-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {s.label}
                        </div>
                        <div className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                          VIN: {s.vin}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
