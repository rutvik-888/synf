import { useEffect, useRef, useState } from 'react';

/**
 * DimensionalBackground — atmospheric architectural depth layer.
 *
 * Renders a composed scene of obsidian monoliths, distant luminous
 * points, atmospheric haze, and optional dimensional threshold frame.
 * Used behind page heroes to give each page a unique spatial region
 * of the SYNF dark universe without a heavy 3D pipeline.
 */
type Accent = 'cyan' | 'ultraviolet' | 'violet' | 'mixed';

type Props = {
  /** Visual variant — each page gets a distinct composition */
  variant?: 'monoliths' | 'portal' | 'chrome-veil' | 'crystal-field' | 'void-architecture';
  /** Accent hue for the atmospheric light */
  accent?: Accent;
  /** Enable subtle parallax on mouse move */
  parallax?: boolean;
  /** Overall opacity multiplier (0–1) for layering behind content */
  opacity?: number;
  className?: string;
};

const ACCENT_COLORS: Record<Accent, { primary: string; secondary: string }> = {
  cyan: { primary: 'rgba(80,230,255,0.08)', secondary: 'rgba(80,230,255,0.04)' },
  ultraviolet: { primary: 'rgba(148,112,255,0.08)', secondary: 'rgba(148,112,255,0.04)' },
  violet: { primary: 'rgba(148,112,255,0.08)', secondary: 'rgba(148,112,255,0.04)' },
  mixed: { primary: 'rgba(80,230,255,0.06)', secondary: 'rgba(148,112,255,0.06)' },
};

export function DimensionalBackground({
  variant = 'monoliths',
  accent = 'mixed',
  parallax = false,
  opacity = 1,
  className = '',
}: Props) {
  const c = ACCENT_COLORS[accent];
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!parallax) return;
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setOffset({ x: px, y: py });
      });
    };
    el.addEventListener('mousemove', onMove);
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [parallax]);

  const px = (depth: number) => `${offset.x * depth}px`;
  const py = (depth: number) => `${offset.y * depth}px`;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      data-parallax={parallax ? 'true' : undefined}
      style={{ opacity }}
    >
      {/* Base atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-void via-ink-obsidian to-ink-graphite" />

      {/* Accent wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 80% at ${50 + offset.x * 10}% ${30 + offset.y * 8}%, ${c.primary}, transparent 70%)`,
        }}
      />

      {/* Variant-specific architecture */}
      {variant === 'monoliths' && <Monoliths px={px} py={py} />}
      {variant === 'portal' && <Portal px={px} py={py} />}
      {variant === 'chrome-veil' && <ChromeVeil px={px} py={py} />}
      {variant === 'crystal-field' && <CrystalField px={px} py={py} />}
      {variant === 'void-architecture' && <VoidArchitecture px={px} py={py} />}

      {/* Distant luminous points — sparse stars in the void */}
      <DistantLights accent={accent} px={px} py={py} />

      {/* Film grain — subtle texture */}
      <div className="grain absolute inset-0 opacity-[0.06]" />

      {/* Atmospheric depth — haze at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, rgba(3,4,7,0.6), transparent)',
        }}
      />
    </div>
  );
}

type DepthFn = { px: (d: number) => string; py: (d: number) => string };

function Monoliths({ px, py }: DepthFn) {
  return (
    <div className="absolute inset-0">
      {/* Left monolith — tall, angled */}
      <div
        className="absolute left-[-10%] top-[10%] h-[80%] w-[35%] opacity-40"
        style={{
          background: 'linear-gradient(180deg, rgba(8,11,18,0.9) 0%, rgba(3,4,7,0.4) 100%)',
          transform: `perspective(1000px) rotateY(12deg) rotateX(2deg) translate(${px(-20)}, ${py(-15)})`,
          boxShadow: '1px 0 0 0 rgba(80,230,255,0.04) inset, -1px 0 40px rgba(0,0,0,0.5)',
          transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
      {/* Right monolith — shorter, offset */}
      <div
        className="absolute right-[-5%] top-[20%] h-[60%] w-[28%] opacity-30"
        style={{
          background: 'linear-gradient(180deg, rgba(10,14,22,0.8) 0%, rgba(3,4,7,0.3) 100%)',
          transform: `perspective(1000px) rotateY(-15deg) translate(${px(-35)}, ${py(-25)})`,
          boxShadow: '-1px 0 0 0 rgba(148,112,255,0.04) inset',
          transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
      {/* Mid monolith — distant, faint */}
      <div
        className="absolute left-[35%] top-[30%] h-[40%] w-[20%] opacity-20"
        style={{
          background: 'linear-gradient(180deg, rgba(12,16,26,0.6) 0%, transparent 100%)',
          transform: `perspective(1200px) rotateY(5deg) translate(${px(-50)}, ${py(-40)})`,
          transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
    </div>
  );
}

function Portal({ px, py }: DepthFn) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="h-[60vh] w-[60vh] max-w-[80vw] max-h-[80vw] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(80,230,255,0.03) 60%, transparent 80%)',
          border: '1px solid rgba(80,230,255,0.06)',
          transform: `translate(${px(-12)}, ${py(-12)})`,
          transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
      <div
        className="absolute h-[45vh] w-[45vh] max-w-[60vw] max-h-[60vw] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, transparent 50%, rgba(148,112,255,0.04) 70%, transparent 90%)',
          border: '1px solid rgba(148,112,255,0.04)',
          transform: `translate(${px(-24)}, ${py(-24)})`,
          transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
    </div>
  );
}

function ChromeVeil({ px, py }: DepthFn) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, transparent 30%, rgba(201,210,227,0.06) 45%, rgba(255,255,255,0.03) 50%, rgba(201,210,227,0.06) 55%, transparent 70%)`,
          transform: `translate(${px(-8)}, ${py(-8)})`,
          transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{
          background: 'conic-gradient(from 0deg, rgba(255,255,255,0.08), transparent 30%, rgba(148,112,255,0.06), transparent 60%, rgba(80,230,255,0.05), transparent 90%)',
          transform: `translate(-50%, -50%) translate(${px(-18)}, ${py(-18)})`,
          transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />
    </div>
  );
}

function CrystalField({ px, py }: DepthFn) {
  return (
    <div className="absolute inset-0">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            width: '120px',
            height: '160px',
            background: 'linear-gradient(135deg, rgba(20,14,40,0.4), rgba(8,11,18,0.6))',
            border: '1px solid rgba(192,165,255,0.06)',
            transform: `rotate(${i * 15 - 20}deg) translate(${px(-30 - i * 8)}, ${py(-25 - i * 8)})`,
            transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      ))}
    </div>
  );
}

function VoidArchitecture({ px, py }: DepthFn) {
  return (
    <div className="absolute inset-0">
      {/* Suspended geometric structure — thin lines suggesting hidden architecture */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12]"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translate(${px(-16)}, ${py(-16)})`, transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)' }}
      >
        <defs>
          <linearGradient id="va-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(80,230,255,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Horizontal planes suggesting depth */}
        <line x1="0" y1="25%" x2="100%" y2="35%" stroke="url(#va-line)" strokeWidth="0.5" />
        <line x1="0" y1="65%" x2="100%" y2="55%" stroke="url(#va-line)" strokeWidth="0.5" />
        {/* Vertical supports */}
        <line x1="20%" y1="15%" x2="20%" y2="75%" stroke="url(#va-line)" strokeWidth="0.3" />
        <line x1="80%" y1="20%" x2="80%" y2="70%" stroke="url(#va-line)" strokeWidth="0.3" />
        {/* Diagonal cross-bracing */}
        <line x1="20%" y1="15%" x2="80%" y2="55%" stroke="url(#va-line)" strokeWidth="0.2" />
        <line x1="80%" y1="20%" x2="20%" y2="65%" stroke="url(#va-line)" strokeWidth="0.2" />
      </svg>
    </div>
  );
}

function DistantLights({ accent, px, py }: { accent: Accent } & DepthFn) {
  const lights = [
    { x: '12%', y: '18%', s: 2, o: 0.6, d: 60 },
    { x: '85%', y: '22%', s: 1.5, o: 0.4, d: 45 },
    { x: '45%', y: '12%', s: 1, o: 0.3, d: 80 },
    { x: '68%', y: '45%', s: 1.5, o: 0.35, d: 50 },
    { x: '25%', y: '55%', s: 1, o: 0.25, d: 70 },
    { x: '92%', y: '65%', s: 2, o: 0.3, d: 55 },
    { x: '8%', y: '72%', s: 1.5, o: 0.2, d: 40 },
  ];

  const color = accent === 'cyan' ? '#50E6FF' : (accent === 'ultraviolet' || accent === 'violet') ? '#9472FF' : '#C6A5FF';

  return (
    <div className="absolute inset-0">
      {lights.map((l, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-flicker"
          style={{
            left: l.x,
            top: l.y,
            width: `${l.s}px`,
            height: `${l.s}px`,
            background: color,
            opacity: l.o,
            boxShadow: `0 0 ${l.s * 4}px ${color}`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${4 + i * 0.3}s`,
            transform: `translate(${px(-l.d)}, ${py(-l.d)})`,
            transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      ))}
    </div>
  );
}
