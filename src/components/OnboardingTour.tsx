import { useEffect, useState } from 'react';
import { Sparkles, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const TOUR_KEY = 'synf_onboarding_done';

const STEPS = [
  { title: 'Events', body: 'Browse upcoming parties, DJ nights, and curated experiences from Team Synf.', highlight: 'events' },
  { title: 'The Collective', body: 'Meet the DJs, creatives, and collaborators behind every Synf night.', highlight: 'people' },
  { title: 'Community Wall', body: 'See photos and videos from Synf nights, submitted by the community.', highlight: 'community' },
  { title: 'Join the Team', body: 'Find open roles and apply to become part of the collective.', highlight: 'jobs' },
];

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('tour_seen')) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setActive(true), 2000);
      sessionStorage.setItem('tour_seen', '1');
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    setActive(false);
    localStorage.setItem(TOUR_KEY, '1');
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  if (!active) return null;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-ink-void/85 backdrop-blur-md px-4" onClick={dismiss}>
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-ink-900 p-8 shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <button onClick={dismiss} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
            <Sparkles size={14} /> Welcome to Synf
          </div>
          <div className="mt-2 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-8 bg-cyan-500' : i < step ? 'w-4 bg-cyan-500/50' : 'w-4 bg-white/[0.06]'}`} />
            ))}
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">{s.title}</h2>
          <p className="mt-3 text-white/60 leading-relaxed">{s.body}</p>
          <div className="mt-8 flex items-center justify-between">
            <button onClick={dismiss} className="text-sm text-white/40 hover:text-white/70 flex items-center gap-1"><Check size={14} /> Skip tour</button>
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={prev} className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] text-white/60 hover:text-white"><ArrowLeft size={16} /></button>
              )}
              <button onClick={next} className="btn-primary group">
                {step < STEPS.length - 1 ? 'Next' : 'Get started'}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
