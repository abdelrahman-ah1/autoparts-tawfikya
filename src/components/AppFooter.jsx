import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function AppFooter() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-surface-container-low mt-space-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg pb-space-xl">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">{t('trustFitmentTitle')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustFitmentDesc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">{t('trustSupportTitle')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustSupportDesc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">{t('catEngineTitle')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustDispatchDesc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface">{t('trustSatisfactionTitle')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('trustSatisfactionDesc')}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="font-title-md text-title-md text-on-surface">
              Auto<span className="text-primary-container">Parts</span>
            </span>
            <span>{t('footerRights')}</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <Link to="/" className="hover:text-on-surface transition-colors">
              {t('fitmentPolicy')}
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              {t('privacySecurity')}
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              {t('oemCompliance')}
            </Link>
            <Link to="/" className="hover:text-on-surface transition-colors">
              {t('fleetApi')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
