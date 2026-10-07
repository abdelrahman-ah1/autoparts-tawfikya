import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { VehicleProvider } from './context/VehicleContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { AdminCatalogPage } from './pages/AdminCatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { PartsSearchPage } from './pages/PartsSearchPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { VendorDashboardPage } from './pages/VendorDashboardPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ToastProvider>
          <VehicleProvider>
            <CartProvider>
              <OrderProvider>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="catalog" element={<PartsSearchPage />} />
                    <Route path="search" element={<Navigate to="/catalog" replace />} />
                    <Route path="product" element={<ProductDetailPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="cart" element={<Navigate to="/checkout" replace />} />
                    <Route path="orders" element={<OrderStatusPage />} />
                    <Route path="vendor" element={<VendorDashboardPage />} />
                    <Route path="admin" element={<AdminCatalogPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </OrderProvider>
            </CartProvider>
          </VehicleProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
