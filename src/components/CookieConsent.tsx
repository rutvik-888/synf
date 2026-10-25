import { useEffect, useState } from 'react';
import { Cookie, X, Check } from 'lucide-react';

const STORAGE_KEY = 'synf-cookie-consent';

type Consent = { accepted: boolean; analytics: boolean; marketing: boolean; timestamp: string };

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function accept(all: boolean) {
    const consent: Consent = {
      accepted: true,
      analytics: all || analytics,
      marketing: all || marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-2xl animate-fade-up rounded-2xl border border-white/[0.08] bg-ink-900/95 p-5 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-4 sm:w-96">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500/15 text-cyan-400">
          <Cookie size={18} />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-sm font-bold">We use cookies</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            We use essential cookies to run this site. Choose what else you'd like to allow.
          </p>
        </div>
        <button onClick={() => accept(false)} className="text-white/30 hover:text-white"><X size={16} /></button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
          <label className="flex items-center justify-between text-xs">
            <span className="text-white/70">Analytics (anonymous usage data)</span>
            <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="accent-cyan-500" />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="text-white/70">Marketing (event & drop alerts)</span>
            <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="accent-cyan-500" />
          </label>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!expanded && (
          <button onClick={() => setExpanded(true)} className="flex-1 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white">
            Preferences
          </button>
        )}
        <button onClick={() => accept(true)} className="flex-1 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600">
          <Check size={12} className="mr-1 inline" /> Accept all
        </button>
        {expanded && (
          <button onClick={() => accept(false)} className="flex-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">
            Save choices
          </button>
        )}
      </div>
    </div>
  );
}
