import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH_ROUTES } from '../lib/routes'
import { useToast } from '../context/ToastContext'
import { useVehicle } from '../context/VehicleContext'
import { vehicleDisplayName } from '../lib/vehicleCatalog'

/**
 * Wires legacy HTML fragments: data-path links, vehicle bindings, copy-to-clipboard.
 */
export function useLegacyPageContent(html) {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { vehicle, setVehicle, openVehicleModal } = useVehicle()
  const { showToast } = useToast()

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const cleanups = []

    root.querySelectorAll('[data-bind-vehicle-name]').forEach((el) => {
      el.textContent = vehicleDisplayName(vehicle)
    })
    root.querySelectorAll('[data-bind-vehicle-vin]').forEach((el) => {
      el.textContent = `VIN: ${vehicle.vin}`
    })

    const yearSelect = root.querySelector('#year-select')
    const makeSelect = root.querySelector('#make-select')
    const modelSelect = root.querySelector('#model-select')
    const engineSelect = root.querySelector('#engine-select')

    if (yearSelect && makeSelect && modelSelect) {
      yearSelect.value = vehicle.year
      makeSelect.value = vehicle.make
      modelSelect.value = vehicle.model
      if (engineSelect) engineSelect.value = vehicle.engine

      const saveHandler = () => {
        setVehicle({
          ...vehicle,
          year: yearSelect.value,
          make: makeSelect.value,
          model: modelSelect.value,
          engine: engineSelect ? engineSelect.value : vehicle.engine,
        })
      }
      ;[yearSelect, makeSelect, modelSelect, engineSelect].filter(Boolean).forEach((select) => {
        select.addEventListener('change', saveHandler)
        cleanups.push(() => select.removeEventListener('change', saveHandler))
      })
    }

    root.querySelectorAll('a[data-path], button[data-path]').forEach((el) => {
      const pathKey = el.getAttribute('data-path')
      const route = PATH_ROUTES[pathKey]
      if (!route) return

      const handler = (e) => {
        e.preventDefault()
        navigate(route)
      }
      el.addEventListener('click', handler)
      cleanups.push(() => el.removeEventListener('click', handler))
    })

    root.querySelectorAll('.js-cart-link').forEach((el) => {
      const handler = (e) => {
        e.preventDefault()
        navigate('/checkout')
      }
      el.addEventListener('click', handler)
      cleanups.push(() => el.removeEventListener('click', handler))
    })

    const openModalHandler = (e) => {
      e.preventDefault()
      openVehicleModal()
    }
    root.querySelectorAll('#toggleSelectorModal, .js-change-vehicle').forEach((el) => {
      el.addEventListener('click', openModalHandler)
      cleanups.push(() => el.removeEventListener('click', openModalHandler))
    })

    root.querySelectorAll('.select-all, [data-copy]').forEach((el) => {
      el.classList.add('cursor-pointer', 'hover:text-primary', 'transition-colors')
      el.setAttribute('title', 'Click to copy')
      const copyHandler = () => {
        const text = el.getAttribute('data-copy') || el.innerText.trim()
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard: ${text}`)
        })
      }
      el.addEventListener('click', copyHandler)
      cleanups.push(() => el.removeEventListener('click', copyHandler))
    })

    root.querySelectorAll('a[href^="/"]').forEach((el) => {
      const href = el.getAttribute('href')
      if (!href || href.startsWith('//')) return
      const handler = (e) => {
        e.preventDefault()
        navigate(href)
      }
      el.addEventListener('click', handler)
      cleanups.push(() => el.removeEventListener('click', handler))
    })

    return () => cleanups.forEach((fn) => fn())
  }, [html, vehicle, navigate, setVehicle, openVehicleModal, showToast])

  return containerRef
}
