import { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — premium dual-element pointer.
 *
 * A small dot tracks the mouse exactly (no lag), while a larger ring
 * follows with eased spring physics. On hover over interactive elements
 * the ring expands and shifts to the brand accent; on press it contracts.
 * Elements with [data-cursor="text"] swap the ring for a text label.
 * The dot hides on touch devices and when reduced motion is requested.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [blend, setBlend] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) { visible = true; setHidden(false); }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      const t = e.target as HTMLElement;
      const textEl = t.closest('[data-cursor-text]') as HTMLElement | null;
      if (textEl) {
        setLabel(textEl.dataset.cursorText || null);
      } else {
        setLabel(null);
      }
      const isHover = !!t.closest('a, button, [role="button"], [data-cursor="hover"], input, textarea, select, label') || !!textEl;
      setHovering(isHover);
      setBlend(!!t.closest('[data-cursor="blend"], img, video, canvas'));
    };
    const onLeave = () => setHidden(true);
    const onDown = () => setPressing(true);
    const onUp = () => setPressing(false);

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[90] hidden md:block transition-opacity duration-300 ${hidden ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Trailing ring — eased spring follow */}
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 rounded-full border transition-[width,height,border-color,background-color,opacity] duration-200 ${
          label
            ? 'h-0 w-0 border-transparent opacity-0'
            : pressing
              ? 'h-5 w-5 border-cyan-400/90 bg-cyan-400/15'
              : hovering
                ? 'h-12 w-12 border-lime-400/70 bg-lime-400/10'
                : 'h-8 w-8 border-cyan-500/50'
        }`}
      />
      {/* Text label — replaces ring on [data-cursor-text] elements */}
      <div
        ref={labelRef}
        className={`fixed left-0 top-0 whitespace-nowrap rounded-md border border-white/15 bg-ink-900/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white shadow-xl backdrop-blur-sm transition-[opacity,transform] duration-200 ${label ? 'opacity-100' : 'opacity-0'}`}
      >
        {label || ''}
      </div>
      {/* Precise dot — exact pointer position, hides on hover */}
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 rounded-full bg-cyan-400 transition-[width,height,opacity] duration-150 ${
          hovering || label ? 'h-0 w-0 opacity-0' : pressing ? 'h-1.5 w-1.5 opacity-100' : 'h-1 w-1 opacity-100'
        } ${blend ? 'mix-blend-difference' : ''}`}
      />
    </div>
  );
}
