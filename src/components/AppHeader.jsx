import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useVehicle } from '../context/VehicleContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
  { to: '/catalog', label: 'Catalog', icon: 'search' },
  { to: '/', label: 'Garage', icon: 'garage', end: true },
  { to: '/orders', label: 'Order Status', icon: 'local_shipping' },
  { to: '/vendor', label: 'Vendor Portal', icon: 'warehouse' },
  { to: '/admin', label: 'Admin Engine', icon: 'tune' },
]

const navLinkClass = ({ isActive }) =>
  `px-space-sm py-1.5 font-label-md text-label-md transition-colors rounded-lg ${
    isActive
      ? 'bg-surface-container-high text-on-surface font-semibold'
      : 'text-on-surface-variant hover:text-on-surface'
  }`

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-xl font-title-md text-title-md transition-colors ${
    isActive ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'
  }`

export function AppHeader() {
  const { vehicle, openVehicleModal } = useVehicle()
  const { itemCount, cartBounced } = useCart()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const shortLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-space-sm sm:gap-space-md">
        <div className="flex items-center gap-space-lg min-w-0">
          <NavLink to="/" className="flex items-center gap-space-xs text-on-surface select-none group min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-lg text-title-lg tracking-tight text-on-surface">
                Auto<span className="text-primary-container">Parts</span>
              </span>
              <span className="hidden sm:block font-label-sm text-label-sm text-on-surface-variant -mt-1">
                OEM & AFTERMARKET
              </span>
            </div>
          </NavLink>
          <nav className="hidden xl:flex items-center gap-space-xs p-1 bg-surface-container-low rounded-lg">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-1 max-w-md hidden md:flex items-center">
          <div className="w-full flex items-center bg-surface-container-lowest rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] px-space-sm py-1.5 gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
              placeholder="Search Part #, VIN, OEM or Keyword..."
              type="text"
            />
            <span className="font-data-mono-sm text-data-mono-sm bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">
              SKU
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-space-sm shrink-0">
          <button
            type="button"
            onClick={openVehicleModal}
            className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>CALIBRATED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-on-surface">{shortLabel}</span>
              <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
            </div>
          </button>
          <button
            type="button"
            onClick={openVehicleModal}
            aria-label="Change vehicle"
            className="sm:hidden p-2 rounded-lg bg-tertiary-fixed/40 text-tertiary flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
          </button>
          <NavLink
            to="/checkout"
            aria-label="Cart"
            className="relative p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {itemCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 bg-primary-container text-on-primary font-data-mono-sm text-data-mono-sm rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition-transform duration-300 ${
                  cartBounced ? 'scale-125 animate-bounce' : 'scale-100'
                }`}
              >
                {itemCount}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="xl:hidden p-2 rounded-lg hover:bg-surface-container-low text-on-surface flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="xl:hidden absolute inset-x-0 top-full h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)] bg-surface overflow-y-auto border-t border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="md:hidden flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 gap-2">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <input
                className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="Search Part #, VIN or keyword..."
                type="text"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                openVehicleModal()
              }}
              className="sm:hidden w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                <div className="text-left min-w-0">
                  <div className="font-label-sm text-label-sm text-on-surface-variant">ACTIVE VEHICLE</div>
                  <div className="font-title-md text-title-md text-on-surface truncate">{shortLabel}</div>
                </div>
              </div>
              <span className="font-label-md text-label-md text-primary shrink-0">Change</span>
            </button>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  {isDark ? 'dark_mode' : 'light_mode'}
                </span>
                <span className="font-title-md text-title-md text-on-surface">Theme</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label, icon, end }) => (
                <NavLink key={to} to={to} end={end} className={mobileNavLinkClass}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
