import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicle } from '../context/VehicleContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { VinScannerModal } from './VinScannerModal'

export function ExecutiveToolbar() {
  const [collapsed, setCollapsed] = useState(false)
  const [vinModalOpen, setVinModalOpen] = useState(false)
  const { setVehicle, vehicle } = useVehicle()
  const { resetDefaultCart, itemCount } = useCart()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const setCorolla = () => {
    setVehicle({
      year: '2018',
      make: 'Toyota',
      model: 'Corolla',
      engine: '1.8L L4 Gas DOHC',
      vin: 'JT2BURHE9JC284910'
    })
    navigate('/catalog')
  }

  const setF150 = () => {
    setVehicle({
      year: '2022',
      make: 'Ford',
      model: 'F-150',
      engine: '3.5L EcoBoost V6',
      vin: '1FTFW1ED4NFC92014'
    })
    navigate('/catalog')
  }

  return (
    <>
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[calc(100%-1rem)] sm:w-[94%] pointer-events-none">
        <div className="bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-primary-container/40 p-2 sm:px-4 sm:py-2.5 pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {collapsed ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-label-sm text-label-sm text-primary-fixed flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                PROTOTYPE DEMO BAR
              </span>
              <button
                onClick={() => setCollapsed(false)}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high/20 hover:bg-surface-container-high/40 text-white font-label-sm text-label-sm flex items-center gap-1"
              >
                <span>Expand</span>
                <span className="material-symbols-outlined text-[14px]">expand_less</span>
              </button>
            </div>
          ) : (
            <>
              <div className="hidden lg:flex items-center gap-2 border-r border-outline/30 pr-3">
                <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <div className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary-fixed">
                    Client Demo Controller
                  </div>
                  <div className="text-[11px] text-outline-variant truncate max-w-[140px]">
                    Active: {vehicle.year} {vehicle.make}
                  </div>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto py-1 [scrollbar-width:none]">
                <button
                  onClick={setCorolla}
                  title="Test Sedan Fitment (Exact Match for Brake Pads)"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    vehicle.make === 'Toyota'
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-container-high/20 hover:bg-surface-container-high/40 text-on-surface-variant text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">directions_car</span>
                  <span className="sm:hidden">Sedan</span><span className="hidden sm:inline">Sedan Demo (Corolla)</span>
                </button>

                <button
                  onClick={setF150}
                  title="Test Truck Fitment (Triggers 'Does Not Fit' on Sedan Pads!)"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    vehicle.make === 'Ford'
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-container-high/20 hover:bg-surface-container-high/40 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                  <span className="sm:hidden">Truck</span><span className="hidden sm:inline">Truck Demo (F-150)</span>
                </button>

                <button
                  onClick={() => setVinModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1 whitespace-nowrap hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                  <span className="sm:hidden">VIN</span><span className="hidden sm:inline">Scan VIN</span>
                </button>

                <button
                  onClick={() => navigate('/vendor')}
                  className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-surface-container-high/20 hover:bg-surface-container-high/40 text-white font-label-sm text-label-sm items-center gap-1 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[15px]">warehouse</span>
                  <span className="sm:hidden">Vendor</span><span className="hidden sm:inline">Vendor View</span>
                </button>

                <button
                  onClick={resetDefaultCart}
                  title="Reset cart items"
                  className="px-2.5 py-1.5 rounded-xl bg-surface-container-high/20 hover:bg-surface-container-high/40 text-white font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  <span className="sm:hidden">Reset</span><span className="hidden sm:inline">Reset Cart ({itemCount})</span>
                </button>

                <button
                  onClick={toggleTheme}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-container-high/20 hover:bg-surface-container-high/40 text-white font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="sm:hidden">{isDark ? 'Light' : 'Dark'}</span>
                  <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* Collapse button */}
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse toolbar"
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-outline-variant flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </>
          )}
        </div>
      </div>

      <VinScannerModal isOpen={vinModalOpen} onClose={() => setVinModalOpen(false)} />
    </>
  )
}
