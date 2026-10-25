type Props = {
  className?: string;
  /** intensity of the chromatic rim lighting */
  glow?: 'subtle' | 'signature' | 'cinematic';
  /** slow rotation toggle */
  animate?: boolean;
};

const GLOW_MAP = {
  subtle: { drop: 'drop-shadow(0 0 24px rgba(168,120,245,0.18))', shadow: 'rgba(138,66,245,0.20)' },
  signature: { drop: 'drop-shadow(0 0 60px rgba(168,120,245,0.35)) drop-shadow(0 0 24px rgba(255,103,94,0.20))', shadow: 'rgba(138,66,245,0.35)' },
  cinematic: { drop: 'drop-shadow(0 0 90px rgba(168,120,245,0.45)) drop-shadow(0 0 40px rgba(34,184,255,0.25))', shadow: 'rgba(138,66,245,0.45)' },
} as const;

/**
 * SynfSignal — the SYNF signature sculptural object.
 * A reflective chrome form of intersecting rings around a fractured core.
 * Rendered as inline SVG so it scales crisply, inherits context, and stays
 * a single recognizable brand motif across hero, transitions, loader, 404.
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
        {/* Chrome body — directional specular highlight */}
        <linearGradient id="synf-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="22%" stopColor="#E2E0E8" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#C4C2CF" stopOpacity="0.55" />
          <stop offset="58%" stopColor="#DCD5FF" stopOpacity="0.40" />
          <stop offset="78%" stopColor="#A878F5" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#8A42F5" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="synf-chrome-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="50%" stopColor="#DCD5FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A878F5" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="synf-core" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#DCD5FF" stopOpacity="0.70" />
          <stop offset="70%" stopColor="#8A42F5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3A1A6E" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="synf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A878F5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A878F5" stopOpacity="0" />
        </radialGradient>
        <filter id="synf-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Ambient glow field */}
      <circle cx="200" cy="200" r="180" fill="url(#synf-glow)" />

      {/* Outer fractured ring — three arcs rotated off-axis */}
      <g className={animate ? 'animate-spin-slow' : undefined} style={{ transformOrigin: '200px 200px' }}>
        <path d="M200 40 A160 160 0 0 1 358 188" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        <path d="M372 232 A160 160 0 0 1 252 356" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M168 358 A160 160 0 0 1 40 240" fill="none" stroke="url(#synf-chrome-rim)" strokeWidth="2.5" strokeLinecap="round" opacity="0.78" />
      </g>

      {/* Mid ring — intersecting ellipse, the dimensional twist */}
      <g style={{ transformOrigin: '200px 200px' }} className={animate ? 'animate-spin-slow' : undefined}>
        <ellipse cx="200" cy="200" rx="120" ry="68" fill="none" stroke="url(#synf-chrome)" strokeWidth="3" opacity="0.9" transform="rotate(28 200 200)" />
        <ellipse cx="200" cy="200" rx="120" ry="68" fill="none" stroke="url(#synf-chrome)" strokeWidth="1.5" opacity="0.5" transform="rotate(-34 200 200)" />
      </g>

      {/* Inner counter-rotating ring */}
      <g style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="86" fill="none" stroke="url(#synf-chrome)" strokeWidth="2" opacity="0.6" />
        <circle cx="200" cy="200" r="86" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.4" strokeDasharray="2 14" />
      </g>

      {/* Fractured core sphere */}
      <g filter="url(#synf-soft)">
        <circle cx="200" cy="200" r="54" fill="url(#synf-core)" />
        {/* fracture shards */}
        <path d="M200 146 L176 200 L214 200 Z" fill="#FFFFFF" opacity="0.18" />
        <path d="M214 200 L176 200 L200 254 Z" fill="#8A42F5" opacity="0.22" />
        <path d="M200 146 L214 200 L200 254 L176 200 Z" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />
        {/* specular */}
        <ellipse cx="186" cy="184" rx="20" ry="12" fill="#FFFFFF" opacity="0.55" transform="rotate(-25 186 184)" />
      </g>

      {/* Spark ticks */}
      <g stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        <line x1="120" y1="120" x2="132" y2="132" />
        <line x1="280" y1="120" x2="268" y2="132" />
        <line x1="120" y1="280" x2="132" y2="268" />
        <line x1="280" y1="280" x2="268" y2="268" />
      </g>
    </svg>
  );
}
