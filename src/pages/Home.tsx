import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, MapPin, Users, Mail, Ticket, ChevronDown, ChevronLeft, ChevronRight, Flame, Zap, Sparkles, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { EventRow, PersonRow, SiteContentRow } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { PersonCard } from '@/components/PersonCard';
import { Reveal } from '@/components/Reveal';
import { MagneticButton } from '@/components/MagneticButton';
import { formatDate, countdown } from '@/lib/format';
import { submitPublicForm } from '@/lib/api';
import { SynfMark } from '@/components/SynfMark';
import { SynfSignal } from '@/components/SynfSignal';
import { ParticleField } from '@/components/ParticleField';
import { LiveCountdown } from '@/components/LiveCountdown';
import { useSeo, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

const MARQUEE_A = ["WE DON'T FOLLOW THE NIGHT", 'WE MAKE IT', 'HYDERABAD', 'AFTER DARK', 'STUDENT-LED', 'LESS ORDINARY'];
const MARQUEE_B = ['MUSIC', 'CULTURE', 'PEOPLE', 'MOMENTS', 'COLLABORATE', 'CREATE', 'TEAM SYNF'];

// Editorial visual culture panels — atmospheric, abstract, real photography.
// These are abstract/atmospheric visuals, not claims about specific SYNF events.
const CULTURE_PANELS = [
  {
    src: 'https://images.pexels.com/photos/13230724/pexels-photo-13230724.jpeg?auto=compress&cs=tinysrgb&h=900&w=600',
    alt: 'Silhouettes of a concert crowd under vibrant stage lighting',
    label: 'Sound',
    index: '01',
    caption: 'The room before the drop.',
  },
  {
    src: 'https://images.pexels.com/photos/29490704/pexels-photo-29490704.jpeg?auto=compress&cs=tinysrgb&h=900&w=600',
    alt: 'Stylish figure in black outfit in an urban downtown setting',
    label: 'Style',
    index: '02',
    caption: 'Dress like you mean it.',
  },
  {
    src: 'https://images.pexels.com/photos/15273773/pexels-photo-15273773.jpeg?auto=compress&cs=tinysrgb&h=900&w=600',
    alt: 'Intricate shiny metallic sculpture with reflective surfaces',
    label: 'Form',
    index: '03',
    caption: 'Chrome and reflection.',
  },
  {
    src: 'https://images.pexels.com/photos/13230506/pexels-photo-13230506.jpeg?auto=compress&cs=tinysrgb&h=900&w=600',
    alt: 'Vibrant night concert atmosphere with crowd under bright lights',
    label: 'Energy',
    index: '04',
    caption: 'Where the collective lands.',
  },
];

export function Home() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [content, setContent] = useState<SiteContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0.5, y: 0.4 });
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: ev }, { data: pe }, { data: sc }] = await Promise.all([
        supabase.from('events').select('*').eq('is_published', true).order('start_at', { ascending: false }).limit(8),
        supabase.from('people').select('*').eq('status', 'approved').order('sort_order').limit(8),
        supabase.from('site_content').select('*').eq('slug', 'home_hero').maybeSingle(),
      ]);
      setEvents((ev as EventRow[]) || []);
      setPeople((pe as PersonRow[]) || []);
      setContent(sc as SiteContentRow | null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        if (heroBgRef.current) {
          heroBgRef.current.style.transform = `translateY(${y * 0.4}px) scale(1.15)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setSpot({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const heroData = content?.data as { headline?: string; subhead?: string } | null;
  const subhead = heroData?.subhead || 'Student-led collective shaping nightlife, music and culture across Hyderabad. We don\'t follow the night — we make it.';

  const upcoming = events.filter(e => ['announced', 'upcoming'].includes(e.status));
  const featuredEvents = events.filter(e => e.featured);
  const featuredPool = featuredEvents.length > 0 ? featuredEvents : (events.length > 0 ? [events[0]] : []);
  const featured = featuredPool[featuredIdx] || events[0];

  useSeo({
    title: 'Team Synf — We don\'t follow the night. We make it.',
    description: 'Student-led creative collective in Hyderabad. Parties, nightlife, DJ nights, music events and curated experiences. We don\'t do ordinary.',
    path: '/',
    keywords: ['Team Synf', 'synf', 'Hyderabad events', 'Hyderabad nightlife', 'student collective', 'DJ nights', 'parties Hyderabad', 'music events India', 'college events', 'nightlife Hyderabad', 'event collective', 'creative collective'],
    image: featured?.cover_image_url || undefined,
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  });
  const past = events.filter(e => e.status === 'completed').slice(0, 6);
  const cd = featured ? countdown(featured.start_at) : null;

  useEffect(() => {
    if (paused || featuredPool.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % featuredPool.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, featuredPool.length]);

  const touchStartX = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50 && featuredPool.length > 1) {
      if (diff < 0) setFeaturedIdx(i => (i + 1) % featuredPool.length);
      else setFeaturedIdx(i => (i - 1 + featuredPool.length) % featuredPool.length);
    }
  }, [featuredPool.length]);

  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const signalRotate = Math.min(scrollY * 0.08, 40);

  return (
    <div className="bg-ink-void">

      {/* ============ CHAPTER 01 — HERO: VOID ENVIRONMENT WITH CHROME SIGNAL ============ */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-ink-void">
        {/* Atmospheric void — layered depth, not flat black */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-void via-ink-obsidian to-ink-graphite" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ultraviolet-600/8 via-transparent to-cyan-500/6" />

        {/* Real event image bleeding through, low opacity, art-directed */}
        {featured?.cover_image_url && (
          <div ref={heroBgRef} className="absolute inset-0" style={{ transform: 'translateY(0px) scale(1.15)' }}>
            <img src={featured.cover_image_url} alt="" className="h-full w-full object-cover opacity-15 mix-blend-luminosity" loading="eager" fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-void/70 via-transparent to-ink-void" />

        {/* Mouse spotlight — cyan wash on void */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(700px circle at ${spot.x * 100}% ${spot.y * 100}%, rgba(84,233,255,0.10), transparent 60%)` }}
        />

        {/* Chrome signal sculpture — positioned asymmetrically right, with depth */}
        <div
          className="pointer-events-none absolute right-[-6rem] top-1/2 hidden h-[42rem] w-[42rem] -translate-y-1/2 md:block"
          style={{ transform: `translateY(-50%) rotate(${signalRotate}deg)` }}
        >
          <SynfSignal glow="cinematic" className="h-full w-full" />
        </div>

        {/* Soft chromatic orbs */}
        <div className="absolute inset-0">
          <div className="gpu absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-ultraviolet-600/10 blur-[140px] animate-drift" />
          <div className="gpu absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/8 blur-[140px] animate-drift" style={{ animationDelay: '8s' }} />
        </div>

        {/* Side rail — vertical editorial label */}
        <div className="absolute left-5 top-1/2 hidden -translate-y-1/2 rotate-180 xl:block">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/25 [writing-mode:vertical-rl]">Team Synf · Est. Hyderabad · After Dark</span>
        </div>

        {/* Index marker — top right */}
        <div className="absolute right-6 top-24 hidden sm:block">
          <div className="flex flex-col items-end gap-1">
            <div className="index-marker text-white/30">N°001</div>
            <div className="h-px w-12 bg-white/15" />
            <div className="index-marker text-cyan-400">Live</div>
          </div>
        </div>

        <div className="container-synf relative flex min-h-[100svh] flex-col justify-center py-24">
          {/* Eyebrow + logo chip */}
          <Reveal className="mb-10 flex items-center gap-4" delay={100}>
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white/5 shadow-[0_8px_30px_-8px_rgba(148,112,255,0.35)] border border-white/10">
              <SynfMark className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.3em] text-white/45">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" /> Independent culture · Events · Creative energy
            </div>
          </Reveal>

          {/* Monumental headline — signal white on void, dimensional */}
          <div style={{ opacity: heroOpacity }}>
            <Reveal delay={200} direction="up">
              <h1 className="display-dimensional text-signal">
                <span className="block text-[clamp(3rem,13vw,11rem)]">WE DON'T</span>
                <span className="block text-[clamp(3rem,13vw,11rem)]">
                  <span style={{ WebkitTextStroke: '1.5px rgba(244,247,255,0.5)', color: 'transparent' }}>FOLLOW</span>{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">THE NIGHT.</span>
                </span>
                <span className="block text-[clamp(3rem,13vw,11rem)]">WE MAKE IT.</span>
              </h1>
            </Reveal>
          </div>

          {/* Subhead + CTAs — signal text on void */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <Reveal delay={400}>
              <p className="max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">{subhead}</p>
            </Reveal>
            <Reveal delay={520}>
              <div className="flex flex-wrap gap-3">
                <MagneticButton>
                  <Link to="/events" className="btn btn-lg group bg-white text-ink-void hover:bg-white/90 hover:shadow-[0_20px_50px_-20px_rgba(84,233,255,0.5)]">
                    <Calendar size={18} /> Explore events
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.25}>
                  <Link to="/about" className="btn btn-lg border border-white/15 bg-white/5 text-signal backdrop-blur-sm hover:border-cyan-400/40 hover:bg-white/10">
                    <Sparkles size={16} /> The collective
                  </Link>
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          {/* Stats rail with countdown — dark glass on void */}
          <Reveal delay={680} className="mt-16">
            <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
              {cd && !cd.past && featured && (
                <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400"><Flame size={14} /> Next drop</div>
                  <div className="h-6 w-px bg-white/15" />
                  <LiveCountdown target={featured.start_at || ''} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:grid-cols-4">
                {[
                  { label: 'Focus', value: 'Nightlife', icon: Zap, color: 'text-cyan-400' },
                  { label: 'Based', value: 'Hyderabad', icon: MapPin, color: 'text-ultraviolet-300' },
                  { label: 'Events', value: `${events.length} live`, icon: Calendar, color: 'text-cyan-400' },
                  { label: 'Crew', value: `${people.length} listed`, icon: Users, color: 'text-ultraviolet-300' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="group bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                      <Icon size={16} className={`${s.color} opacity-70 transition-opacity group-hover:opacity-100`} />
                      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/35">{s.label}</div>
                      <div className="mt-0.5 font-display text-lg font-semibold text-signal">{s.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: heroOpacity }}>
          <div className="flex flex-col items-center gap-2 text-white/30">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <ChevronDown size={18} className="animate-bounce-subtle" />
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 02 — THE SYNF STATEMENT (OBSIDIAN EDITORIAL) ============ */}
      <section className="relative overflow-hidden bg-ink-obsidian py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-void/50 via-transparent to-ink-graphite/40" />
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-ultraviolet-600/8 blur-[160px]" />
        <div className="container-synf relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Index + intro — left column, asymmetric */}
            <div className="lg:col-span-4">
              <Reveal className="index-marker text-white/30">01 / The Idea</Reveal>
              <Reveal delay={100}>
                <p className="mt-6 max-w-sm text-base leading-relaxed text-white/50">
                  Synf is a student-led collective bringing people together through events, music, culture and creative collaboration — across Hyderabad and beyond.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-8 flex items-center gap-3">
                  <span className="h-px w-10 bg-cyan-400/40" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">Make noise. Make culture.</span>
                </div>
              </Reveal>
            </div>

            {/* Monumental statement — right, dominant */}
            <div className="lg:col-span-8">
              <Reveal delay={150} direction="up">
                <h2 className="display-dimensional text-signal">
                  <span className="block text-[clamp(2.5rem,8vw,7rem)]">NOT ANOTHER</span>
                  <span className="block text-[clamp(2.5rem,8vw,7rem)]">
                    <span style={{ WebkitTextStroke: '1.5px rgba(244,247,255,0.55)', color: 'transparent' }}>SCENE.</span>
                  </span>
                  <span className="block text-[clamp(2.5rem,8vw,7rem)] bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">A NEW FREQUENCY.</span>
                </h2>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 03 — VISUAL CULTURE STRIP (STAGGERED EDITORIAL) ============ */}
      <section className="relative overflow-hidden bg-graphite-900 py-24 sm:py-32">
        <div className="grain pointer-events-none absolute inset-0 opacity-8" />
        <div className="absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-500/15 blur-[140px] animate-drift" />
        <div className="absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-cyan-500/8 blur-[140px] animate-drift" style={{ animationDelay: '9s' }} />

        <div className="container-wide relative">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal className="index-marker text-white/45">02 / Visual Culture</Reveal>
              <Reveal><h2 className="mt-3 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-white sm:text-6xl">The world we're <span className="bg-gradient-to-r from-ultraviolet-300 to-cyan-400 bg-clip-text text-transparent">building.</span></h2></Reveal>
            </div>
            <Reveal delay={100}>
              <p className="max-w-xs text-sm leading-relaxed text-white/50">Sound, style, form and energy — the disciplines that collide into one undeniable frequency.</p>
            </Reveal>
          </div>

          {/* Staggered asymmetric grid — varied panel sizes and offsets */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-12">
            {CULTURE_PANELS.map((p, i) => {
              // Asymmetric layout: alternating offsets and spans
              const layouts = [
                'lg:col-span-4 lg:row-span-2 lg:mt-0',
                'lg:col-span-3 lg:mt-16',
                'lg:col-span-4 lg:row-span-2 lg:mt-8',
                'lg:col-span-3 lg:mt-24',
              ];
              const heights = [
                'aspect-[3/4] lg:h-auto',
                'aspect-[4/5] lg:h-auto',
                'aspect-[3/4] lg:h-auto',
                'aspect-[4/5] lg:h-auto',
              ];
              return (
                <Reveal key={i} delay={i * 120} direction="up" className={`${layouts[i]} ${heights[i]} group relative overflow-hidden rounded-2xl`}>
                  <img src={p.src} alt={p.alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/85 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="index-marker text-white/80">{p.index}</span>
                    <span className="h-px w-6 bg-white/40" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ultraviolet-300">{p.label}</div>
                    <div className="mt-1 font-display text-lg font-semibold leading-tight text-white">{p.caption}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE STRIP — KINETIC TYPOGRAPHY (DARK) ============ */}
      <section className="relative border-y border-white/[0.06] bg-ink-900 overflow-hidden">
        <div className="flex w-max animate-marquee gap-0 whitespace-nowrap py-5">
          {Array.from({ length: 4 }).map((_, k) => (
            <div key={k} className="flex items-center">
              {MARQUEE_A.map((t, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6 font-display text-2xl font-semibold uppercase tracking-tight text-white/90 sm:text-3xl">{t}</span>
                  <span className="text-xl text-ultraviolet-400">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-max animate-marquee-rev gap-0 whitespace-nowrap py-5">
          {Array.from({ length: 4 }).map((_, k) => (
            <div key={k} className="flex items-center">
              {MARQUEE_B.map((t, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6 font-display text-2xl font-semibold uppercase tracking-tight text-white/12 sm:text-3xl">{t}</span>
                  <span className="text-xl text-cyan-400/40">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============ CHAPTER 04 — FEATURED EVENT SPOTLIGHT (DARK IMMERSIVE) ============ */}
      {featured && (
        <section className="container-synf py-24 sm:py-32" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="scale">
              <div className="relative">
                <Link to={`/events/${featured.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3]">
                  {featured.cover_image_url ? (
                    <img key={featured.id} src={featured.cover_image_url} alt={featured.cover_image_alt || featured.title} className="h-full w-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-105" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ultraviolet-600 via-ink-graphite to-ink-void">
                      <span className="font-display text-[12rem] font-bold text-white/8">{featured.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-void/90 via-transparent to-transparent" />
                  <div className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-cyan-400 text-ink-void opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  {featured.featured && (
                    <span className="absolute left-4 top-4 chip border border-lime-400/40 bg-lime-400/15 text-lime-400 backdrop-blur-sm">Featured</span>
                  )}
                  {featured.start_at && (
                    <div className="absolute bottom-4 left-4 flex flex-col items-center rounded-xl border border-white/15 bg-ink-void/80 px-3 py-2 text-center backdrop-blur-sm">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">{new Date(featured.start_at).toLocaleDateString('en-GB', { month: 'short' })}</span>
                      <span className="font-display text-2xl font-bold leading-none text-signal">{new Date(featured.start_at).getDate()}</span>
                    </div>
                  )}
                </Link>
                {featuredPool.length > 1 && (
                  <>
                    <button onClick={() => setFeaturedIdx(i => (i - 1 + featuredPool.length) % featuredPool.length)} className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink-void/70 text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white" aria-label="Previous featured event">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setFeaturedIdx(i => (i + 1) % featuredPool.length)} className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink-void/70 text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white" aria-label="Next featured event">
                      <ChevronRight size={18} />
                    </button>
                    <div className="mt-3 flex justify-center gap-2">
                      {featuredPool.map((_, i) => (
                        <button key={i} onClick={() => setFeaturedIdx(i)} className={`h-1.5 rounded-full transition-all ${i === featuredIdx ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} aria-label={`Go to featured event ${i + 1}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal className="index-marker text-cyan-400">03 / Spotlight</Reveal>
              <Reveal delay={100} key={`status-${featured.id}`}>
                <span className="chip w-fit border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">{featured.status.replace('_', ' ')}</span>
              </Reveal>
              <Reveal delay={150} key={`title-${featured.id}`}>
                <h2 className="mt-4 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-white sm:text-6xl lg:text-7xl">{featured.title}</h2>
              </Reveal>
              {featured.subtitle && <Reveal delay={200} key={`sub-${featured.id}`}><p className="mt-3 text-lg text-white/55">{featured.subtitle}</p></Reveal>}
              <Reveal delay={250}>
                <div className="mt-6 space-y-3 text-sm text-white/70">
                  {featured.start_at && <div className="flex items-center gap-2"><Calendar size={16} className="text-cyan-400" /> {formatDate(featured.start_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                  {featured.venue_name && <div className="flex items-center gap-2"><MapPin size={16} className="text-ultraviolet-300" /> {featured.venue_name}{featured.venue_city ? `, ${featured.venue_city}` : ''}</div>}
                </div>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={`/events/${featured.slug}`} className="btn-primary group">View event <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                  {featured.ticket_url && <a href={featured.ticket_url} target="_blank" rel="noopener noreferrer" className="btn-acid"><Ticket size={16} /> Get passes</a>}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ============ CHAPTER 05 — UPCOMING (DARK EDITORIAL GRID) ============ */}
      {upcoming.length > 0 && (
        <section className="container-synf py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal className="index-marker text-cyan-400">04 / Upcoming</Reveal>
              <Reveal><h2 className="mt-3 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-signal sm:text-6xl">Next<span className="bg-gradient-to-r from-cyan-300 to-ultraviolet-400 bg-clip-text text-transparent"> up</span></h2></Reveal>
            </div>
            <Link to="/events" className="group inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-cyan-400">
              All events <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 3).map((e, i) => <Reveal key={e.id} delay={i * 100}><EventCard event={e} /></Reveal>)}
          </div>
        </section>
      )}

      {/* ============ CHAPTER 06 — PAST ARCHIVE (HORIZONTAL STRIP) ============ */}
      {past.length > 0 && (
        <section className="py-20">
          <div className="container-synf">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Reveal className="index-marker text-white/45">05 / Archive</Reveal>
                <Reveal><h2 className="mt-3 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-white sm:text-6xl">Where we've<span style={{ WebkitTextStroke: '1.5px #d4ff3f', color: 'transparent' }}> been</span></h2></Reveal>
              </div>
              <Link to="/events" className="group inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-cyan-400">
                Full archive <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="mt-8 flex gap-6 overflow-x-auto px-5 pb-6 sm:px-8 scrollbar-hide snap-x snap-mandatory">
            {past.map((e) => (
              <div key={e.id} className="w-[80vw] flex-shrink-0 snap-center sm:w-[24rem]">
                <EventCard event={e} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ EMPTY STATE ============ */}
      {loading ? (
        <section className="container-synf py-20"><div className="h-64 animate-pulse rounded-2xl bg-ink-900" /></section>
      ) : events.length === 0 && (
        <section className="container-synf py-24 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight">No events published yet</h2>
            <p className="mx-auto mt-3 max-w-md text-white/55">Team Synf is cooking something up. Follow along on Instagram or join the insider list to be first to know.</p>
            <div className="mt-6 flex justify-center gap-3">
              <a href="https://www.instagram.com/team.synf/" target="_blank" rel="noopener noreferrer" className="btn-ghost">@team.synf</a>
              <Link to="/apply" className="btn-primary">Join the team</Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ============ CHAPTER 07 — PEOPLE PREVIEW (DARK CREW STRIP) ============ */}
      {people.length > 0 && (
        <section className="container-synf py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal className="index-marker text-ultraviolet-300">06 / The Collective</Reveal>
              <Reveal><h2 className="mt-3 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-signal sm:text-6xl">People behind<br className="sm:hidden" /> the nights</h2></Reveal>
            </div>
            <Link to="/people" className="group inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-ultraviolet-300">
              All people <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {people.slice(0, 4).map((p, i) => <Reveal key={p.id} delay={i * 80}><PersonCard person={p} /></Reveal>)}
          </div>
        </section>
      )}

      {/* ============ CHAPTER 08 — INSIDER SIGNUP (ULTRAVOLET BLOCK) ============ */}
      <InsiderSignup />

      {/* ============ CHAPTER 09 — COLLABORATION CTA (DARK IMMERSIVE) ============ */}
      <section className="container-synf py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-ink-graphite to-ink-void p-10 sm:p-16 lg:p-20">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-ultraviolet-500/15 blur-3xl animate-drift" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-drift" style={{ animationDelay: '7s' }} />
            <div className="relative">
              <div className="index-marker text-cyan-400">07 / Collaborate</div>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-[0.9] tracking-tightest text-signal sm:text-5xl lg:text-6xl">
                Build something <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">unforgettable</span> with us.
              </h2>
              <p className="mt-4 max-w-xl text-white/55">Brands, venues, DJs, artists, photographers and creatives — we're open to collaborations that push the culture forward.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/collaborate" className="btn-primary btn-lg group">Collaborate <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                <Link to="/jobs" className="btn-ghost btn-lg">Join the team</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function InsiderSignup() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [prefs, setPrefs] = useState<string[]>(['events']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const PREF_OPTIONS = [
    { key: 'events', label: 'Events' },
    { key: 'jobs', label: 'Job Openings' },
  ];

  function togglePref(key: string) {
    setPrefs(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    const consent = 'I agree to receive insider updates from Team Synf. I can unsubscribe at any time.';
    const r = await submitPublicForm({ kind: 'subscriber', email, first_name: firstName, consent_text: consent, preferences: prefs });
    if (r.error) { setStatus('err'); setMsg(r.error); }
    else { setStatus('ok'); setMsg('You\'re on the list. Check your inbox.'); setEmail(''); setFirstName(''); setPrefs(['events']); }
  }

  return (
    <section className="container-synf py-20">
      <Reveal>
        <div className="relative grid gap-8 overflow-hidden rounded-3xl border border-ultraviolet-500/25 bg-gradient-to-br from-ultraviolet-600/8 via-ink-graphite to-ink-void p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ultraviolet-500/12 blur-3xl" />
          <div className="relative">
            <div className="section-eyebrow text-ultraviolet-300"><Mail size={14} /> Insider list</div>
            <h2 className="font-display text-3xl font-bold leading-[0.9] tracking-tightest text-white sm:text-5xl">First to know.<br />First <span className="text-gradient-synf">in.</span></h2>
            <p className="mt-3 max-w-md text-white/60">Get early event announcements, recruitment openings and behind-the-scenes updates. No spam, ever.</p>
          </div>
          <form onSubmit={submit} className="relative space-y-3" aria-label="Insider signup form">
            <div className="hidden"><label>Don't fill this<input value="" tabIndex={-1} autoComplete="off" /></label></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="First name (optional)" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <input className="input" type="email" required placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-white/30">What do you want to hear about?</div>
              <div className="flex flex-wrap gap-2">
                {PREF_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => togglePref(opt.key)}
                    className={`chip border transition-all ${prefs.includes(opt.key) ? 'border-ultraviolet-500/50 bg-ultraviolet-500/15 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/45 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-white/45">
              <input type="checkbox" required className="mt-0.5 accent-ultraviolet-500" />
              I agree to receive insider updates from Team Synf. I can unsubscribe at any time.
            </label>
            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full group">
              {status === 'loading' ? 'Joining…' : <>Join the insider list <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>}
            </button>
            {status === 'ok' && <p className="text-sm text-ultraviolet-300">{msg}</p>}
            {status === 'err' && <p className="text-sm text-cyan-400">{msg}</p>}
          </form>
        </div>
      </Reveal>
    </section>
  );
}
