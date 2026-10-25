import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { playIntroSound, stopIntroSound, resumeAudioContext } from '@/lib/introSound';
import { CinematicRenderer } from '@/lib/introRenderer';

const INTRO_KEY = 'synf_intro_seen';

type IntroConfig = {
  enabled: boolean;
  sound_enabled: boolean;
  sound_opt_in: boolean;
  duration_ms: number;
  treatment: string;
  show_on_every_visit: boolean;
};

const DEFAULT_CONFIG: IntroConfig = {
  enabled: true,
  sound_enabled: true,
  sound_opt_in: true,
  duration_ms: 11000,
  treatment: 'cinematic',
  show_on_every_visit: false,
};

type Scene = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem(INTRO_KEY) === '1';
const shouldSkip = reduceMotion || alreadySeen;

export function IntroScreen() {
  const [show, setShow] = useState(!shouldSkip);
  const [decision, setDecision] = useState<'pending' | 'play' | 'skip'>(shouldSkip ? 'skip' : 'pending');
  const [scene, setScene] = useState<Scene>(0);
  const [soundOn, setSoundOn] = useState(false);
  const [config, setConfig] = useState<IntroConfig>(DEFAULT_CONFIG);
  const [exiting, setExiting] = useState(shouldSkip);
  const [mounted, setMounted] = useState(false);

  // Tagline: 0=hidden, 1=line1, 2=line1 done, 3=line2, 4=both done
  const [taglineStage, setTaglineStage] = useState(0);
  const [synfVisible, setSynfVisible] = useState(false);
  const [synfAssembled, setSynfAssembled] = useState(false);
  const [brandLineVisible, setBrandLineVisible] = useState(false);
  const [replayHover, setReplayHover] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const soundPlayedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CinematicRenderer | null>(null);
  const sceneRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    if (shouldSkip) { setShow(false); return; }
    let cancelled = false;
    const seen = sessionStorage.getItem(INTRO_KEY);
    if (document.hidden) { if (!cancelled) setDecision('skip'); return; }

    const timeout = setTimeout(() => { if (!cancelled) setDecision('skip'); }, 5000);

    (async () => {
      try {
        const { data } = await supabase.from('site_content').select('data, is_public').eq('slug', 'intro_config').maybeSingle();
        if (cancelled) return;
        clearTimeout(timeout);
        const cfg = data && data.is_public
          ? { ...DEFAULT_CONFIG, ...(data.data as Record<string, unknown>) } as IntroConfig
          : DEFAULT_CONFIG;
        setConfig(cfg);
        if (!cfg.enabled || (seen && !cfg.show_on_every_visit)) setDecision('skip');
        else setDecision('play');
      } catch {
        if (!cancelled) { clearTimeout(timeout); setDecision('skip'); }
      }
    })();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (decision !== 'skip') return;
    const t = setTimeout(() => { setExiting(true); setTimeout(() => setShow(false), 400); }, 100);
    return () => clearTimeout(t);
  }, [decision]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    stopIntroSound();
    sessionStorage.setItem(INTRO_KEY, '1');
    setScene(6); sceneRef.current = 6;
    setExiting(true);
    setTimeout(() => setShow(false), 1200);
  }, [clearTimers]);

  useEffect(() => {
    if (decision !== 'play') return;
    if (!canvasRef.current) return;
    try {
      const renderer = new CinematicRenderer(canvasRef.current);
      rendererRef.current = renderer;
      renderer.start();
    } catch { /* canvas not available */ }

    const onMove = (e: MouseEvent) => {
      if (rendererRef.current) rendererRef.current.setMouse(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0] && rendererRef.current) rendererRef.current.setMouse(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      if (rendererRef.current) {
        rendererRef.current.stop();
        rendererRef.current = null;
      }
    };
  }, [decision]);

  useEffect(() => {
    if (decision !== 'play') return;
    const dur = config.duration_ms || DEFAULT_CONFIG.duration_ms;

    const setSceneSafe = (s: Scene) => {
      setScene(s);
      sceneRef.current = s;
      if (rendererRef.current) rendererRef.current.setScene(s);
    };

    const timers = [
      // Shot 01 — Absolute Void (0–1.5s)
      // Scene 0 is initial state

      // Shot 02 — Matter Emerges (1.5–3s)
      setTimeout(() => setSceneSafe(1), dur * 0.14),

      // Shot 03 — The World Awakens (3–5s)
      setTimeout(() => setSceneSafe(2), dur * 0.27),

      // Shot 04 — The Energy Cascade (5–6.5s)
      setTimeout(() => setSceneSafe(3), dur * 0.45),
      setTimeout(() => {
        if (rendererRef.current) { rendererRef.current.triggerFlash(); rendererRef.current.triggerShake(4); }
      }, dur * 0.50),

      // Shot 05 — The Declaration (6.5–8.5s)
      setTimeout(() => setSceneSafe(4), dur * 0.59),

      // Tagline choreography
      setTimeout(() => setTaglineStage(1), dur * 0.60),  // "WE DON'T FOLLOW THE NIGHT." reveals
      setTimeout(() => setTaglineStage(2), dur * 0.64),  // line 1 settled
      setTimeout(() => setTaglineStage(3), dur * 0.68),  // pause, then "WE MAKE IT." reveals
      setTimeout(() => setTaglineStage(4), dur * 0.71),  // both settled

      // Tagline fades, converge begins
      setTimeout(() => { setTaglineStage(0); setSceneSafe(5); }, dur * 0.77),

      // Shot 06 — SYNF reveal: letters converge then assemble
      setTimeout(() => setSynfVisible(true), dur * 0.79),
      setTimeout(() => setSynfAssembled(true), dur * 0.83),

      // Shot 07 — Enter SYNF
      setTimeout(() => setSceneSafe(6), dur * 0.88),
      setTimeout(() => setBrandLineVisible(true), dur * 0.91),

      // End
      setTimeout(() => dismiss(), dur),
    ];
    timersRef.current = timers;

    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / dur) * 100);
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
    }, 50);

    return () => { clearTimers(); clearInterval(interval); };
  }, [decision, config.duration_ms, dismiss, clearTimers]);

  useEffect(() => {
    if (decision !== 'play') return;
    const onVis = () => { if (document.hidden) { stopIntroSound(); setSoundOn(false); } };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [decision]);

  const handleSound = useCallback(() => {
    if (!config.sound_enabled) return;
    resumeAudioContext();
    if (!soundOn && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      setSoundOn(true);
      playIntroSound(0.38);
    } else {
      setSoundOn(false);
      stopIntroSound();
    }
  }, [config.sound_enabled, soundOn]);

  if (!show) return null;
  const isPlaying = decision === 'play';

  if (reduceMotion && isPlaying) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-void" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <div className="grain pointer-events-none absolute inset-0 opacity-8" />
        <div className="text-center px-6">
          <h1 className="font-display font-bold tracking-tightest text-white" style={{ fontSize: 'clamp(3rem, 12vw, 7rem)' }}>SYNF</h1>
          <div className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <p className="mt-6 font-display text-lg sm:text-2xl text-white/80 tracking-wide">WE DON&rsquo;T FOLLOW THE NIGHT.</p>
          <p className="mt-2 font-display text-lg sm:text-2xl text-cyan-400 tracking-wide">WE MAKE IT.</p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">A NEW FREQUENCY OF CULTURE</p>
        </div>
        <button onClick={dismiss} className="absolute bottom-8 right-8 text-[11px] uppercase tracking-widest text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-2">
          Enter site <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-void"
      style={{
        opacity: exiting ? 0 : (mounted ? 1 : 0),
        transform: exiting ? 'scale(1.03)' : 'scale(1)',
        filter: exiting ? 'blur(8px)' : 'blur(0px)',
        transition: 'opacity 1200ms cubic-bezier(0.4,0,0.2,1), transform 1200ms cubic-bezier(0.4,0,0.2,1), filter 1200ms ease-in-out',
      }}
    >
      {/* Canvas — dimensional environment */}
      {isPlaying && <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />}

      {/* Film grain */}
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.08]" />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          opacity: scene < 5 ? 0.6 : 0.2,
          transition: 'opacity 1.5s ease',
        }}
      />

      {/* === SHOT 05: THE DECLARATION — tagline === */}
      {isPlaying && scene === 4 && (
        <div className="relative z-20 flex flex-col items-center px-6">
          {/* Line 1: "WE DON'T FOLLOW THE NIGHT." */}
          <div className="overflow-hidden">
            <h2
              className="font-display font-bold text-center text-white"
              style={{
                fontSize: 'clamp(1.6rem, 6vw, 4.5rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                transform: taglineStage >= 1 ? 'translateY(0)' : 'translateY(100%)',
                opacity: taglineStage >= 1 ? 1 : 0,
                transition: 'transform 1.4s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease-out',
                textShadow: '0 0 30px rgba(243,246,255,0.12)',
              }}
            >
              WE DON&rsquo;T FOLLOW THE NIGHT.
            </h2>
          </div>

          {/* Line 2: "WE MAKE IT." — arrives with controlled impact */}
          {taglineStage >= 3 && (
            <div className="overflow-hidden mt-1 sm:mt-3">
              <h2
                className="font-display font-bold text-center"
                style={{
                  fontSize: 'clamp(2.5rem, 10vw, 7rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  background: 'linear-gradient(135deg, #F3F6FF 0%, #C6D0E0 30%, #50E6FF 60%, #9472FF 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  transform: taglineStage >= 3 ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.9)',
                  opacity: taglineStage >= 3 ? 1 : 0,
                  transition: 'transform 1s cubic-bezier(0.16,1,0.3,1) 0.05s, opacity 0.6s ease-out 0.05s',
                  filter: 'drop-shadow(0 0 40px rgba(80,230,255,0.25)) drop-shadow(0 0 15px rgba(148,114,255,0.15))',
                  animation: taglineStage >= 4 ? 'introChromeShift 6s ease-in-out infinite' : 'none',
                }}
              >
                WE MAKE IT.
              </h2>
            </div>
          )}
        </div>
      )}

      {/* === SHOT 06: SYNF REVEAL — letters assemble === */}
      {isPlaying && scene === 5 && (
        <div className="relative z-20 flex flex-col items-center">
          <div
            className="font-display font-bold tracking-tightest flex justify-center"
            style={{
              fontSize: 'clamp(4rem, 18vw, 12rem)',
              gap: 'clamp(0.02em, 0.4vw, 0.06em)',
            }}
          >
            {['S', 'Y', 'N', 'F'].map((letter, i) => {
              const delay = i * 0.08;
              return (
                <span
                  key={i}
                  className="inline-block gpu"
                  style={{
                    transform: synfAssembled
                      ? 'translateY(0) rotateX(0deg) scale(1)'
                      : synfVisible
                        ? 'translateY(0) rotateX(0deg) scale(1) blur(6px)'
                        : 'translateY(50%) rotateX(50deg) scale(1.3)',
                    opacity: synfVisible ? 1 : 0,
                    filter: synfAssembled
                      ? 'blur(0px) drop-shadow(0 0 50px rgba(80,230,255,0.35)) drop-shadow(0 0 25px rgba(148,114,255,0.2))'
                      : synfVisible
                        ? 'blur(6px) drop-shadow(0 0 30px rgba(80,230,255,0.2))'
                        : 'blur(16px)',
                    transition: `transform 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}s, opacity 0.8s ease-out ${delay}s, filter 1.5s ease-out ${delay + 0.3}s`,
                    background: 'linear-gradient(135deg, #F3F6FF 0%, #C6D0E0 25%, #50E6FF 55%, #9472FF 85%, #C6A5FF 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    animation: synfAssembled ? 'introChromeShift 6s ease-in-out infinite' : 'none',
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </div>

          {/* Chrome filament underline that draws in after letters */}
          <div
            className="relative mt-3 h-px"
            style={{
              width: 'clamp(8rem, 30vw, 20rem)',
              opacity: synfAssembled ? 1 : 0,
              transition: 'opacity 0.8s ease-out 0.5s',
              background: 'linear-gradient(90deg, transparent, #50E6FF, #9472FF, transparent)',
            }}
          />
        </div>
      )}

      {/* === SHOT 07: ENTER SYNF — brand line === */}
      {isPlaying && scene === 6 && (
        <div className="relative z-20 flex flex-col items-center px-6">
          <div
            className="font-display font-bold tracking-tightest"
            style={{
              fontSize: 'clamp(3rem, 14vw, 9rem)',
              background: 'linear-gradient(135deg, #F3F6FF 0%, #C6D0E0 30%, #50E6FF 60%, #9472FF 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(80,230,255,0.2))',
              animation: 'introChromeShift 6s ease-in-out infinite',
            }}
          >
            SYNF
          </div>
          <p
            className="mt-5 font-mono text-[10px] sm:text-sm uppercase tracking-[0.3em] text-white/50 text-center"
            style={{
              opacity: brandLineVisible ? 1 : 0,
              transform: brandLineVisible ? 'translateY(0)' : 'translateY(15px)',
              transition: 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s',
            }}
          >
            TEAM SYNF — A NEW FREQUENCY OF CULTURE
          </p>
        </div>
      )}

      {/* Progress bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.03] z-30">
          <div
            ref={progressRef}
            className="h-full"
            style={{
              width: '0%',
              background: 'linear-gradient(90deg, #50E6FF, #9472FF, #4F7DFF)',
              transition: 'width 0.05s linear',
              boxShadow: '0 0 8px rgba(80,230,255,0.4)',
            }}
          />
        </div>
      )}

      {/* Controls */}
      {isPlaying && !exiting && (
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-6 z-30">
          {config.sound_enabled ? (
            <button
              onClick={handleSound}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/25 transition-colors hover:text-cyan-400"
              aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />} {soundOn ? 'Sound on' : 'Sound off'}
            </button>
          ) : <span />}
          <button
            onClick={dismiss}
            className="group flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/25 transition-colors hover:text-cyan-400"
          >
            Skip intro <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Replay */}
      {isPlaying && exiting && (
        <button
          onClick={() => {
            sessionStorage.removeItem(INTRO_KEY);
            window.location.reload();
          }}
          onMouseEnter={() => setReplayHover(true)}
          onMouseLeave={() => setReplayHover(false)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/20 transition-colors hover:text-cyan-400"
        >
          <RotateCcw size={14} className={replayHover ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'} /> Replay
        </button>
      )}

      <style>{`
        @keyframes introChromeShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
