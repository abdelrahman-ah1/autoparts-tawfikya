import { createContext, useContext, useEffect, useState } from 'react'
import { PRODUCTS } from '../data/products'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

const INITIAL_CART = [
  {
    product: PRODUCTS[0], // Bosch QuietCast Ceramic Pads
    quantity: 1,
    shippingSpeed: 'standard',
    shippingCost: 6.99
  },
  {
    product: PRODUCTS[1], // Bosch Brake Rotor
    quantity: 2,
    shippingSpeed: 'standard',
    shippingCost: 0.00 // bundled
  }
]

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('autoparts_cart')
      return stored ? JSON.parse(stored) : INITIAL_CART
    } catch {
      return INITIAL_CART
    }
  })

  const [cartBounced, setCartBounced] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    try {
      localStorage.setItem('autoparts_cart', JSON.stringify(items))
    } catch (e) {
      console.error(e)
    }
  }, [items])

  const triggerBounce = () => {
    setCartBounced(true)
    setTimeout(() => setCartBounced(false), 600)
  }

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id)
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        }
        return next
      }
      return [...prev, { product, quantity, shippingSpeed: 'standard', shippingCost: 0 }]
    })
    triggerBounce()
    showToast(`Added to cart: ${product.title}`)
  }

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
    showToast('Item removed from cart')
  }

  const updateQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta
            return newQty > 0 ? { ...i, quantity: newQty } : null
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const resetDefaultCart = () => {
    setItems(INITIAL_CART)
    triggerBounce()
    showToast('Loaded demo parts cart')
  }

  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0)
  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0)
  const shippingTotal = items.length > 0 ? 6.99 : 0
  const taxTotal = subtotal * 0.08
  const grandTotal = subtotal + shippingTotal + taxTotal

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        resetDefaultCart,
        itemCount,
        subtotal,
        shippingTotal,
        taxTotal,
        grandTotal,
        cartBounced
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
