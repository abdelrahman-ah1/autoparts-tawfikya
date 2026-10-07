import { createContext, useContext, useState } from 'react'

const OrderContext = createContext(null)

const INITIAL_ORDER = {
  id: 'ORD-8942',
  date: 'Today, 09:42 AM',
  status: 'In Transit',
  statusStep: 2, // 1: Confirmed, 2: In Transit, 3: Out for Delivery, 4: Delivered
  carrier: 'UPS Ground',
  trackingNumber: '1Z9999999999999999',
  hub: 'Portland West DC',
  estimatedDelivery: 'Thursday, Oct 24',
  vehicleName: '2018 Toyota Corolla 1.8L',
  paymentMethod: 'Visa •••• 1984',
  items: [
    {
      title: 'Bosch QuietCast Ceramic Front Brake Pads',
      sku: 'BOS-BC1210',
      price: 48.95,
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGCOem_6QH5kt0j35YYxWmihGJ4zmZFmwyKAvHCletv-dbNgTD8mLTe0eMGUERYIS6T6H77XaYlZ_IbcOVIRcSOtQk2s31yCgrQsVpZqMHaxokVjwAij3U9-Gv0fkuIwV5jiKYiph2cJntJELrYrbvWkDnQPlJcVUo5krIRfZDjQ2CNUzT91AuVeiuB1mBiY0lNN47iTPHjvxOStk_oKmyGNdJ9UEOvOYs7Q-YBY5HEb-ZudiRCeFtDA'
    },
    {
      title: 'Bosch Premium Disc Brake Rotor (Front)',
      sku: 'BOS-50011492',
      price: 98.20,
      quantity: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE3J6W_RUTvDXhai09OgChsS5OW6OdzEr0sEya_35XGPORLbY68aJsZhBz2M_kf0Ap88rC3RrGZ8Ypz2ct12oGx_lE6zDBwE6sUY5RUk6qEPhAwlPCsUMbjOSoInl1jw2x4QiCtYidQyi0IsMfCKIu8XsoUQNP0a4UDvdgfOfAdQyrLMSoqqbFZII39GRSh43OfHuQB_VxK_9KijZqCOJfOyb79KMrGUFpAIYiQzlODm0Qx9UIcEvZEw'
    }
  ],
  subtotal: 147.15,
  shipping: 6.99,
  tax: 11.77,
  total: 165.91
}

export function OrderProvider({ children }) {
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const stored = localStorage.getItem('autoparts_latest_order')
      return stored ? JSON.parse(stored) : INITIAL_ORDER
    } catch {
      return INITIAL_ORDER
    }
  })

  const placeOrder = ({ items, vehicle, total, shipping, subtotal, tax }) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newOrder = {
      id: `ORD-${randomSuffix}`,
      date: 'Just now',
      status: 'Confirmed',
      statusStep: 1,
      carrier: 'FedEx Priority Ground',
      trackingNumber: `FX-9284-${randomSuffix}`,
      hub: 'Portland West DC',
      estimatedDelivery: '2 Business Days',
      vehicleName: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '2018 Toyota Corolla 1.8L',
      paymentMethod: 'Visa •••• 1984',
      items: items.map((i) => ({
        title: i.product.title,
        sku: i.product.sku,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image
      })),
      subtotal,
      shipping,
      tax,
      total
    }
    setActiveOrder(newOrder)
    try {
      localStorage.setItem('autoparts_latest_order', JSON.stringify(newOrder))
    } catch (e) {
      console.error(e)
    }
    return newOrder
  }

  const updateOrderStatus = (statusStep) => {
    const labels = { 1: 'Confirmed', 2: 'In Transit', 3: 'Delivered' }
    setActiveOrder((prev) => ({ ...prev, statusStep, status: labels[statusStep] }))
  }

  return (
    <OrderContext.Provider value={{ activeOrder, placeOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used within OrderProvider')
  return ctx
}
