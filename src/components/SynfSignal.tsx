type Props = {
  className?: string;
  /** intensity of the chromatic rim lighting */
  glow?: 'subtle' | 'signature' | 'cinematic';
  /** slow rotation toggle */
  animate?: boolean;
};

const GLOW_MAP = {
  subtle: { drop: 'drop-shadow(0 0 24px rgba(168,120,245,0.18))', shadow: 'rgba(138,66,245,0.20)' },
  signature: { drop: 'drop-shadow(0 0 60px rgba(168,120,245,0.35)) drop-shadow(0 0 24px rgba(84,233,255,0.18))', shadow: 'rgba(138,66,245,0.35)' },
  cinematic: { drop: 'drop-shadow(0 0 90px rgba(168,120,245,0.45)) drop-shadow(0 0 40px rgba(84,233,255,0.28))', shadow: 'rgba(138,66,245,0.45)' },
} as const;

/**
 * SynfSignal — the SYNF signature sculptural artifact.
 *
 * An impossible object: intersecting chrome ellipses orbit a fractured
 * black-crystal core wrapped in a translucent glass shell. Luminous
 * filaments trace the rings; fine particles drift around the silhouette.
 * Rendered as inline SVG so it scales crisply and stays a single
 * recognizable brand motif across hero, intro, loader, and 404.
 */
export function SynfSignal({ className = 'h-full w-full', glow = 'signature', animate = true }: Props) {
  const g = GLOW_MAP[glow];
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: g.drop }}
      role="img"
      aria-label="SYNF signal"
    >
      <defs>
        {/* Liquid chrome — directional specular with cool-violet bounce */}
        <linearGradient id="synf-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="18%" stopColor="#E8ECF4" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#A8B0C2" stopOpacity="0.55" />
          <stop offset="58%" stopColor="#C6A5FF" stopOpacity="0.38" />
          <stop offset="78%" stopColor="#9472FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#3A1A6E" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="synf-chrome-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="45%" stopColor="#DCD5FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#9472FF" stopOpacity="0.85" />
        </linearGradient>
        {/* Black crystal core — faceted, deep */}
        <radialGradient id="synf-core" cx="48%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F3F6FF" stopOpacity="0.9" />
          <stop offset="22%" stopColor="#C6A5FF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#5C24C0" stopOpacity="0.5" />
          <stop offset="82%" stopColor="#1A0B3A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#030407" stopOpacity="0.95" />
        </radialGradient>
        {/* Translucent glass shell — faint, spectral */}
        <radialGradient id="synf-glass" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="70%" stopColor="#C6A5FF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#50E6FF" stopOpacity="0.08" />
        </radialGradient>
        {/* Ambient field */}
        <radialGradient id="synf-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9472FF" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#9472FF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#9472FF" stopOpacity="0" />
        </radialGradient>
        {/* Filament glow */}
        <linearGradient id="synf-filament" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#50E6FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#50E6FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#50E6FF" stopOpacity="0" />
        </linearGradient>
        <filter id="synf-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id="synf-glass-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Ambient aura */}
      <circle cx="200" cy="200" r="190" fill="url(#synf-aura)" />

      {/* Translucent glass shell — outermost, faint spectral veil */}
      <circle cx="200" cy="200" r="172" fill="url(#synf-glass)" filter="url(#synf-glass-blur)" opacity="0.7" />

      {/* Outer fractured ring — three arcs rotated off-axis, slow spin */}
      <g className={animate ? 'animate-spin-slow' : undefined} style={{ transformOrigin: '200px 200px' }}>
        <path d="M200 36 A164 164 0 0 1 362 196" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.6" strokeLinecap="round" opacity="0.88" />
        <path d="M372 236 A164 164 0 0 1 252 360" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.6" strokeLinecap="round" opacity="0.72" />
        <path d="M168 360 A164 164 0 0 1 36 240" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        {/* Filament travelling the outer ring */}
        <path d="M200 36 A164 164 0 0 1 320 92" fill="none" stroke="url(#synf-filament)" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* Mid ring system — two intersecting ellipses, the dimensional twist */}
      <g style={{ transformOrigin: '200px 200px' }} className={animate ? 'animate-spin-slow' : undefined}>
        <ellipse cx="200" cy="200" rx="124" ry="66" fill="none" stroke="url(#synf-chrome)" strokeWidth="3.2" opacity="0.92" transform="rotate(32 200 200)" />
        <ellipse cx="200" cy="200" rx="124" ry="66" fill="none" stroke="url(#synf-chrome)" strokeWidth="1.6" opacity="0.5" transform="rotate(-38 200 200)" />
        {/* Highlight tick on the mid ring */}
        <circle cx="312" cy="148" r="2.2" fill="#FFFFFF" opacity="0.9" transform="rotate(32 200 200)" />
      </g>

      {/* Inner counter-rotating ring with dashed luminous thread */}
      <g style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="92" fill="none" stroke="url(#synf-chrome)" strokeWidth="2.2" opacity="0.65" />
        <circle cx="200" cy="200" r="92" fill="none" stroke="#F3F6FF" strokeWidth="0.7" opacity="0.45" strokeDasharray="2 16" />
      </g>

      {/* Fractured crystal core — faceted, with shards and specular */}
      <g filter="url(#synf-soft)">
        <circle cx="200" cy="200" r="58" fill="url(#synf-core)" />
        {/* facet shards */}
        <path d="M200 142 L172 200 L214 200 Z" fill="#FFFFFF" opacity="0.16" />
        <path d="M214 200 L172 200 L200 258 Z" fill="#9472FF" opacity="0.24" />
        <path d="M200 142 L214 200 L200 258 L172 200 Z" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55" />
        {/* internal fracture lines */}
        <line x1="200" y1="142" x2="200" y2="258" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.35" />
        <line x1="172" y1="200" x2="228" y2="200" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.3" />
        {/* specular highlight */}
        <ellipse cx="184" cy="182" rx="22" ry="13" fill="#FFFFFF" opacity="0.6" transform="rotate(-28 184 182)" />
        <ellipse cx="216" cy="220" rx="10" ry="5" fill="#50E6FF" opacity="0.4" transform="rotate(20 216 220)" />
      </g>

      {/* Spark ticks — corner particles catching light */}
      <g stroke="#F3F6FF" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <line x1="118" y1="118" x2="132" y2="132" />
        <line x1="282" y1="118" x2="268" y2="132" />
        <line x1="118" y1="282" x2="132" y2="268" />
        <line x1="282" y1="282" x2="268" y2="268" />
      </g>
      {/* Fine drifting particles */}
      <g fill="#FFFFFF" opacity="0.5">
        <circle cx="96" cy="200" r="1.1" />
        <circle cx="304" cy="196" r="1.3" />
        <circle cx="200" cy="92" r="1" />
        <circle cx="206" cy="308" r="1.2" />
        <circle cx="148" cy="120" r="0.8" />
        <circle cx="252" cy="282" r="0.9" />
      </g>
    </svg>
  );
}
