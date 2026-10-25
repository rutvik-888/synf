import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type SoundMode = 'on' | 'off';
interface SoundCtx {
  enabled: boolean;
  toggle: () => void;
  play: (type: 'click' | 'hover' | 'success' | 'error') => void;
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} });

export function useSound() {
  return useContext(Ctx);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<SoundMode>(() => {
    return (localStorage.getItem('synf_sound') as SoundMode) || 'off';
  });

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (enabled === 'on' && !audioCtx) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        setAudioCtx(ctx);
      } catch {
        setEnabled('off');
      }
    }
    localStorage.setItem('synf_sound', enabled);
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  function play(type: 'click' | 'hover' | 'success' | 'error') {
    if (!enabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const freqs: Record<string, number> = { click: 800, hover: 1200, success: 660, error: 220 };
      const durations: Record<string, number> = { click: 0.04, hover: 0.02, success: 0.15, error: 0.2 };

      osc.frequency.value = freqs[type];
      osc.type = type === 'error' ? 'sawtooth' : 'sine';
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durations[type]);

      if (type === 'success') {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
      }

      osc.start(now);
      osc.stop(now + durations[type] + 0.02);
    } catch {
      // ignore
    }
  }

  function toggle() {
    setEnabled(prev => {
      const next = prev === 'on' ? 'off' : 'on';
      if (next === 'off' && audioCtx) {
        audioCtx.suspend();
      }
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ enabled: enabled === 'on', toggle, play }}>
      {children}
    </Ctx.Provider>
  );
}
