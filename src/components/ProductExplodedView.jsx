import { useState } from 'react'

export function ProductExplodedView({ product }) {
  const [activeLayer, setActiveLayer] = useState('pads')

  const layers = [
    {
      id: 'pads',
      label: 'Friction Pads',
      sub: 'Cold-pressed ceramic formulation',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAremV4A7e0yeYJZzKOwp4sbf9d7W4YI9zHWBLsqWrjI3Cg0hJR0qSuMGAl4KJWeFZuS6FV8vh28MFaV-tIBG6e07BtJpngYaviBt9fWWOpJv7YE4RNlIC9ZeNKBpk9-TRYX1J-hy2SyYyvBWK8o14G0v1XqyIuF3fZ-ihku-rQ733naIWhoh2KcUXVOoTYUKP4i5AL2XeKeGImq1nnj8z1RtVr3Lc7trUYYiOU5_ftnzq6O-sMRve0yQ',
      spec: '17.2mm pad depth • Radial cooling slots • Dual-radius chamfer'
    },
    {
      id: 'shim',
      label: 'Rubberized Shim',
      sub: 'Vulcanized acoustic isolator',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRByEMTw4OPxwoq61cgdHH0J3z_SnJ8oWIl-19KN8wj7Whd3_4qDWnvJoVI73YyoqR329s4fB8UpjnNKfWBDnNhT7sgOXs-og0fyfCHu24YsxLv8VnYMoXbTV4K79metbCXhbWQcob1lzKX7sh1WiImSWNUIVazqm8hoHHklErHpArDnnn8p1JIv13AWGx1Tca_UY4NCe1EVK0CqxNqzTxwORah2xfoEmnGypeh0QMHv1Y-RKPNyFVjg',
      spec: 'Multi-layer steel backing • Zero high-frequency brake squeal'
    },
    {
      id: 'hardware',
      label: 'Hardware Kit',
      sub: 'OE 301 Stainless caliper clips',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHef5ooSIoPX17e28XS6KVppfJikJ7lGDc5qWWjBlQvXmIdY1ANnKY6CUwZ4JC9yHEOWwLDZ3wQTcCHGQJCEeWBac40lhvTv9PSKVVeCxz1iUtbciWiMrZAkbhNwET3Swnrzo0eusSVYZAviA_s5ckJngerxxOpG8BuEfE2ob9bT83pskp97CYcE0Zj3eudRgf5HQaF775CQMXdWU0falJhYgfk7kF-xcWQgjmXq1gmdkfQBoyOLCeTQ',
      spec: '4x stainless abutment clips • Synthetic silicone ceramic lube'
    }
  ]

  const current = layers.find((l) => l.id === activeLayer) || layers[0]

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
          <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
            Component Breakdown
          </span>
        </div>
        <span className="font-data-mono-sm text-data-mono-sm text-tertiary flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          CAD Assembly Matched
        </span>
      </div>

      {/* Main interactive canvas */}
      <div className="relative w-full h-56 sm:h-80 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center group p-4 sm:p-6">
        <img
          src={current.image}
          alt={current.label}
          className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 transform group-hover:scale-105"
        />

        {/* Floating Technical Overlay */}
        <div className="hidden sm:flex absolute bottom-3 left-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl border border-outline-variant/30 items-center justify-between gap-2 shadow-sm">
          <div>
            <div className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-1.5">
              <span>{current.label}</span>
              <span className="font-label-sm text-label-sm text-outline font-normal">• {current.sub}</span>
            </div>
            <div className="font-data-mono-sm text-data-mono-sm text-primary font-medium mt-0.5">
              {current.spec}
            </div>
          </div>
          <span className="font-data-mono-sm text-data-mono-sm bg-surface-container px-2 py-1 rounded text-on-surface-variant shrink-0">
            ±0.02mm
          </span>
        </div>
      </div>

      <div className="sm:hidden p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div className="flex items-center justify-between gap-2">
          <span className="font-title-md text-title-md font-bold text-on-surface">{current.label}</span>
          <span className="font-data-mono-sm text-data-mono-sm bg-surface-container px-2 py-1 rounded text-on-surface-variant shrink-0">
            ±0.02mm
          </span>
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant">{current.sub}</div>
        <div className="font-data-mono-sm text-data-mono-sm text-primary font-medium mt-1">{current.spec}</div>
      </div>

      {/* Layer selector tabs */}
      <div className="grid grid-cols-3 gap-2">
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className={`p-2.5 rounded-xl text-left transition-all border ${
              activeLayer === l.id
                ? 'bg-primary-container/10 border-primary-container text-primary font-semibold shadow-xs'
                : 'bg-surface-container-low border-transparent hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <div className="font-label-md text-label-md sm:text-body-md leading-tight">{l.label}</div>
            <div className="hidden sm:block text-[11px] text-outline truncate">{l.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
