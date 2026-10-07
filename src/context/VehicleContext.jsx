import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  loadActiveVehicle,
  saveActiveVehicle,
  vehicleDisplayName,
} from '../lib/vehicleCatalog'
import { useToast } from './ToastContext'

const VehicleContext = createContext(null)

export function VehicleProvider({ children }) {
  const [vehicle, setVehicleState] = useState(loadActiveVehicle)
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

  const setVehicle = useCallback(
    (next) => {
      setVehicleState(next)
      saveActiveVehicle(next)
      showToast(`Active Vehicle Updated: ${vehicleDisplayName(next)}`)
    },
    [showToast],
  )

  useEffect(() => {
    saveActiveVehicle(vehicle)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- hydrate storage on mount

  return (
    <VehicleContext.Provider
      value={{
        vehicle,
        setVehicle,
        modalOpen,
        openVehicleModal: () => setModalOpen(true),
        closeVehicleModal: () => setModalOpen(false),
      }}
    >
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicle() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider')
  return ctx
}
