import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg pb-space-xl">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">Guaranteed Fitment</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Precision compatibility verification engine backs every verified order.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">24/7 Technical Support</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Certified automotive mechanics and parts specialists on standby.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">Verified Vendor Network</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Authorized Tier-1 distributors and direct OEM manufacturers globally.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">100% Satisfaction</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                30-day hassle-free return logistics and defect replacement guarantee.
              </div>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="font-title-md text-title-md text-on-surface">
              Auto<span className="text-primary-container">Parts</span>
            </span>
            <span>© 2024 AutoParts Marketplace Inc. Professional Tier Fulfillment.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <Link to="/" className="hover:text-on-surface transition-colors">
              Fitment Policy
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              Privacy & Security
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              OEM Compliance
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              Fleet API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
