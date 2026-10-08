import { useEffect, useState } from 'react'
import {
  YEARS,
  MAKES,
  getEnginesForMakeModel,
  getModelsForMake,
} from '../lib/vehicleCatalog'
import { useToast } from '../context/ToastContext'
import { useVehicle } from '../context/VehicleContext'
import { useLanguage } from '../context/LanguageContext'

export function VehicleModal() {
  const { vehicle, setVehicle, modalOpen, closeVehicleModal } = useVehicle()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [draft, setDraft] = useState(vehicle)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (modalOpen) {
      setDraft(vehicle)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [modalOpen, vehicle])

  if (!modalOpen) return null

  const models = getModelsForMake(draft.make)
  const engines = getEnginesForMakeModel(draft.make, draft.model)

  const updateMake = (make) => {
    const nextModels = getModelsForMake(make)
    const model = nextModels[0]
    const nextEngines = getEnginesForMakeModel(make, model)
    setDraft((d) => ({
      ...d,
      make,
      model,
      engine: nextEngines[0],
    }))
  }

  const updateModel = (model) => {
    const nextEngines = getEnginesForMakeModel(draft.make, model)
    setDraft((d) => ({ ...d, model, engine: nextEngines[0] }))
  }

  const decodeVin = () => {
    if (draft.vin.trim().length >= 10) {
      setDraft((d) => ({
        ...d,
        year: '2021',
        make: 'Toyota',
        model: 'Corolla',
        engine: '2.0L Dynamic Force',
      }))
      showToast('VIN decoded: 2021 Toyota Corolla 2.0L Dynamic Force')
    } else {
      alert('Please enter at least 10 characters of the VIN.')
    }
  }

  const confirm = () => {
    setVehicle({
      ...draft,
      vin: draft.vin.trim() || vehicle.vin,
    })
    closeVehicleModal()
  }

  return (
    <div
      className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeVehicleModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ap-vehicle-modal-title"
    >
      <div
        className={`bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/40 max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col transition-transform duration-200 ${visible ? 'scale-100' : 'scale-95'}`}
      >
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
            </div>
            <div>
              <h3 id="ap-vehicle-modal-title" className="font-title-lg text-title-lg text-on-surface">
                {t('selectVehicleModalTitle')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t('selectVehicleModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
            onClick={closeVehicleModal}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface-variant">{t('fastVinDecode')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={17}
                placeholder={t('enterVinPlaceholder')}
                value={draft.vin}
                onChange={(e) => setDraft((d) => ({ ...d, vin: e.target.value.toUpperCase() }))}
                className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-data-mono-sm text-data-mono-sm uppercase outline-none focus:ring-2 focus:ring-primary-container"
              />
              <button
                type="button"
                onClick={decodeVin}
                className="px-4 h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors"
              >
                {t('decodeVinBtn')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-outline-variant/40 flex-1" />
            <span className="font-label-sm text-label-sm text-outline uppercase">{t('orChooseVehicle')}</span>
            <div className="h-px bg-outline-variant/40 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t('year')}</label>
              <select
                value={draft.year}
                onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t('make')}</label>
              <select
                value={draft.make}
                onChange={(e) => updateMake(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none"
              >
                {MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t('model')}</label>
              <select
                value={draft.model}
                onChange={(e) => updateModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t('engine')}</label>
              <select
                value={draft.engine}
                onChange={(e) => setDraft((d) => ({ ...d, engine: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none"
              >
                {engines.map((eng) => (
                  <option key={eng} value={eng}>
                    {eng}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low px-6 py-3 flex items-center justify-end gap-2 border-t border-outline-variant/30">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
            onClick={closeVehicleModal}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={confirm}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            {t('confirmAndCalibrate')}
          </button>
        </div>
      </div>
    </div>
  )
}
