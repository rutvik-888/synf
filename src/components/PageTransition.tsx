import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animating, setAnimating] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setDisplayChildren(children);
      return;
    }
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setAnimating(false);
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isEventDetail = pathname.startsWith('/events/');
  const isPersonProfile = pathname.startsWith('/people/');

  return (
    <div
      key={pathname}
      className={
        animating
          ? 'opacity-0 translate-y-4 scale-[0.98] blur-sm'
          : isEventDetail || isPersonProfile
            ? 'animate-page-enter-scale'
            : 'animate-page-enter'
      }
      style={{ transition: 'opacity 200ms ease-out, transform 200ms ease-out, filter 200ms ease-out' }}
    >
      {displayChildren}
    </div>
  );
}
