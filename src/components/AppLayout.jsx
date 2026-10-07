import { Outlet } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'
import { VehicleModal } from './VehicleModal'
import { ExecutiveToolbar } from './ExecutiveToolbar'

export function AppLayout() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col pb-24">
      <AppHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <AppFooter />
      <VehicleModal />
      <ExecutiveToolbar />
    </div>
  )
}
