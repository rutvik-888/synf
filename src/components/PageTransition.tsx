import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type TransitionVariant = 'default' | 'about' | 'people' | 'events' | 'join' | 'collaborate' | 'contact' | 'detail' | 'notfound';

function variantForPath(path: string): TransitionVariant {
  if (path.startsWith('/events/')) return 'detail';
  if (path.startsWith('/people/')) return 'detail';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/people')) return 'people';
  if (path.startsWith('/events')) return 'events';
  if (path.startsWith('/jobs') || path.startsWith('/apply')) return 'join';
  if (path.startsWith('/collaborate')) return 'collaborate';
  if (path.startsWith('/contact')) return 'contact';
  if (path.startsWith('/404') || path === '/not-found') return 'notfound';
  return 'default';
}

/**
 * OMEGA BLACK dimensional page transition.
 *
 * Phase A — Departure: outgoing content fades with a subtle light sweep.
 * Phase B — Passage: a thin dimensional veil (directional light band)
 *   crosses the screen, varying by destination.
 * Phase C — Arrival: new content enters with a timed reveal.
 *
 * No white flash, no blur bomb. ~280ms for ordinary pages, ~420ms for
 * detail pages with a scale reveal. Interruptible; falls back to instant
 * swap if reduced motion is requested.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'arrived' | 'departing' | 'passing'>('arrived');
  const [variant, setVariant] = useState<TransitionVariant>(variantForPath(pathname));
  const [passKey, setPassKey] = useState(0);
  const firstRender = useRef(true);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setDisplayChildren(children);
      setVariant(variantForPath(pathname));
      return;
    }
    if (reduceMotion) {
      setDisplayChildren(children);
      setVariant(variantForPath(pathname));
      return;
    }

    const nextVariant = variantForPath(pathname);
    setPhase('departing');
    const t1 = setTimeout(() => {
      setDisplayChildren(children);
      setVariant(nextVariant);
      setPassKey(k => k + 1);
      setPhase('passing');
    }, 140);
    const t2 = setTimeout(() => {
      setPhase('arrived');
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isDetail = variant === 'detail';

  return (
    <div className="relative">
      {/* Dimensional passage veil — light sweep overlay */}
      {phase === 'passing' && (
        <div
          key={`passage-${passKey}`}
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden
        >
          <PassageVeil variant={variant} />
        </div>
      )}

      <div
        key={pathname}
        className={
          phase === 'departing'
            ? 'opacity-0 translate-y-3'
            : phase === 'passing'
              ? isDetail ? 'animate-page-enter-scale' : 'animate-page-enter'
              : ''
        }
        style={{
          transition: phase === 'departing' ? 'opacity 140ms ease-out, transform 140ms ease-out' : undefined,
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}

/**
 * Destination-specific passage veils. All share the OMEGA dark glass
 * + light sweep language; the direction and accent vary by destination.
 */
function PassageVeil({ variant }: { variant: TransitionVariant }) {
  const config: Record<TransitionVariant, { angle: number; color: string; width: string }> = {
    default: { angle: 100, color: '80,230,255', width: '30vw' },
    about: { angle: 0, color: '148,114,255', width: '40vw' },
    people: { angle: 90, color: '198,165,255', width: '35vw' },
    events: { angle: 45, color: '80,230,255', width: '50vw' },
    join: { angle: 135, color: '148,114,255', width: '45vw' },
    collaborate: { angle: 60, color: '79,125,255', width: '40vw' },
    contact: { angle: 90, color: '243,246,255', width: '25vw' },
    detail: { angle: 120, color: '80,230,255', width: '55vw' },
    notfound: { angle: 200, color: '148,114,255', width: '40vw' },
  };
  const c = config[variant];
  const angleRad = (c.angle * Math.PI) / 180;
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);

  return (
    <>
      {/* Dark glass base */}
      <div
        className="absolute inset-0 bg-ink-void/40"
        style={{ animation: 'synf-passage-fade 280ms ease-out forwards' }}
      />
      {/* Directional light band */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${c.angle}deg, transparent 40%, rgba(${c.color},0.06) 50%, transparent 60%)`,
          animation: `synf-passage-sweep 280ms cubic-bezier(0.16,1,0.3,1) forwards`,
        }}
      />
      {/* Thin luminous leading edge */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          animation: `synf-passage-edge 280ms cubic-bezier(0.16,1,0.3,1) forwards`,
          ['--edge-x' as string]: `${dx * 120}%`,
          ['--edge-y' as string]: `${dy * 120}%`,
          ['--edge-w' as string]: c.width,
          ['--edge-c' as string]: c.color,
        }}
      />
      <style>{`
        @keyframes synf-passage-fade {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes synf-passage-sweep {
          0% { opacity: 0; transform: translate(0, 0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(${dx * 30}%, ${dy * 30}%); }
        }
        @keyframes synf-passage-edge {
          0% { opacity: 0; clip-path: inset(0 100% 0 0); }
          50% { opacity: 0.8; clip-path: inset(0 50% 0 0); }
          100% { opacity: 0; clip-path: inset(0 0 0 100%); }
        }
      `}</style>
    </>
  );
}
