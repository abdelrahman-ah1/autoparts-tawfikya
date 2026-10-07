export const DEFAULT_VEHICLE = {
  year: '2018',
  make: 'Toyota',
  model: 'Corolla',
  engine: '1.8L L4 Gas DOHC',
  vin: 'JT2BURHE9JC284910',
}

export const VEHICLE_CATALOG = {
  Toyota: {
    Corolla: ['1.8L L4 Gas DOHC', '2.0L Dynamic Force'],
    Camry: ['2.5L 4-Cyl Gas', '3.5L V6 Gas'],
    RAV4: ['2.5L Dynamic Force', '2.5L Hybrid'],
  },
  Honda: {
    Civic: ['1.5L Turbo L4', '2.0L L4 DOHC'],
    Accord: ['1.5L Turbo', '2.0L Turbo'],
  },
  Ford: {
    'F-150': ['3.5L EcoBoost V6', '5.0L V8 Coyote'],
    Mustang: ['2.3L EcoBoost', '5.0L V8'],
  },
  BMW: {
    '330i': ['2.0L Turbo B48', '3.0L Turbo B58'],
    M3: ['3.0L Twin-Turbo S58'],
  },
}

export const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017']
export const MAKES = Object.keys(VEHICLE_CATALOG)

export function getModelsForMake(make) {
  return VEHICLE_CATALOG[make] ? Object.keys(VEHICLE_CATALOG[make]) : ['Base Model']
}

export function getEnginesForMakeModel(make, model) {
  return (VEHICLE_CATALOG[make] && VEHICLE_CATALOG[make][model]) || ['Standard Engine']
}

export function loadActiveVehicle() {
  try {
    const stored = localStorage.getItem('autoparts_active_vehicle')
    return stored ? JSON.parse(stored) : { ...DEFAULT_VEHICLE }
  } catch {
    return { ...DEFAULT_VEHICLE }
  }
}

export function saveActiveVehicle(vehicle) {
  localStorage.setItem('autoparts_active_vehicle', JSON.stringify(vehicle))
}

export function vehicleDisplayName(v) {
  return `${v.year} ${v.make} ${v.model} ${v.engine}`
}
