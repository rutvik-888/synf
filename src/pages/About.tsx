import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteContentRow, PersonRow } from '@/lib/types';
import { Reveal } from '@/components/Reveal';
import { Sparkles, Flame, ArrowRight, ArrowUpRight, Calendar, Users, Zap, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PersonCard } from '@/components/PersonCard';
import { SynfSignal } from '@/components/SynfSignal';
import { useSeo, organizationJsonLd } from '@/lib/seo';

const MANIFESTO = [
  { n: '01', text: 'We believe experiences should be felt, not just attended.', color: 'text-ultraviolet-600' },
  { n: '02', text: 'We believe creativity should be seen, heard, and shared.', color: 'text-coral-500' },
  { n: '03', text: 'We bring people, ideas, music, visuals, and moments together.', color: 'text-ultraviolet-600' },
  { n: '04', text: 'We build spaces where people connect through experiences.', color: 'text-coral-500' },
  { n: '05', text: 'We care about the atmosphere, the details, the memories people take home.', color: 'text-ultraviolet-600' },
];

const VALUES = ['Bold, not chaotic', 'Young, not childish', 'Cinematic, not slow', 'Experimental, not confusing', 'Premium, not corporate', 'Student-led, always'];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return progress;
}

export function About() {
  const [content, setContent] = useState<SiteContentRow | null>(null);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: pe }] = await Promise.all([
        supabase.from('site_content').select('*').eq('slug', 'about').maybeSingle(),
        supabase.from('people').select('*').eq('status', 'approved').order('sort_order').limit(4),
      ]);
      setContent(c as SiteContentRow | null);
      setPeople((pe as PersonRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const body = content?.body || 'Team Synf is a student-led collective creating parties, nightlife and curated music experiences. We exist to throw the kind of nights we wish existed — bold, creative and culturally rooted.';
  const tagline = content?.data && (content.data as { tagline?: string }).tagline || 'Student-led. Collaborative. Creative.';

  useSeo({
    title: 'About Team Synf — Student-Led Creative Collective in Hyderabad',
    description: 'Team Synf is a student-led collective creating parties, nightlife and curated music experiences in Hyderabad. We exist to throw the kind of nights we wish existed — bold, creative and culturally rooted.',
    path: '/about',
    keywords: ['about Team Synf', 'student collective Hyderabad', 'creative collective India', 'nightlife collective', 'event organizers Hyderabad', 'DJ collective', 'party organizers Hyderabad'],
    jsonLd: organizationJsonLd(),
  });

  return (
    <div className="bg-ink-950">
      <div className="fixed left-0 top-0 z-50 h-0.5 bg-gradient-to-r from-ultraviolet-500 via-coral-400 to-ultraviolet-400" style={{ width: `${scrollProgress * 100}%` }} />

      {/* ============ CHAPTER 01 — OPENING: PORCELAIN EDITORIAL STATEMENT ============ */}
      <section className="relative min-h-[92vh] overflow-hidden bg-porcelain-100">
        <div className="absolute inset-0 bg-gradient-to-br from-porcelain-100 via-lavender-200 to-porcelain-300" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ultraviolet-500/8 via-transparent to-coral-400/8" />

        {/* Chrome signal — asymmetric, top-right corner */}
        <div className="pointer-events-none absolute -right-12 -top-12 hidden h-[30rem] w-[30rem] md:block">
          <SynfSignal glow="signature" className="h-full w-full" />
        </div>

        <div className="absolute -left-40 top-20 h-[34rem] w-[34rem] rounded-full bg-ultraviolet-500/12 blur-[140px] animate-drift" style={{ transform: `translateY(${scrollProgress * 200}px)` }} />
        <div className="absolute -right-40 bottom-20 h-[26rem] w-[26rem] rounded-full bg-coral-400/10 blur-[140px] animate-drift" style={{ animationDelay: '5s', transform: `translateY(${scrollProgress * -150}px)` }} />

        {/* Index marker */}
        <div className="absolute right-6 top-24 hidden sm:block">
          <div className="flex flex-col items-end gap-1">
            <div className="index-marker text-ink-950/45">N°001</div>
            <div className="h-px w-10 bg-ink-950/25" />
            <div className="index-marker text-ultraviolet-600">Manifesto</div>
          </div>
        </div>

        <div className="container-synf relative flex min-h-[92vh] flex-col justify-center py-24">
          <Reveal className="mb-8 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.35em] text-ink-950/55">
            <Sparkles size={14} className="text-ultraviolet-600" /> The manifesto
          </Reveal>

          <Reveal delay={80} direction="up">
            <h1 className="display-dimensional text-ink-950 text-shadow-chrome">
              <span className="block text-[clamp(3rem,13vw,11rem)]">WE MAKE</span>
              <span className="block text-[clamp(3rem,13vw,11rem)] bg-gradient-to-r from-ultraviolet-600 via-coral-500 to-ultraviolet-500 bg-clip-text text-transparent">NOISE.</span>
              <span className="block text-[clamp(3rem,13vw,11rem)]" style={{ WebkitTextStroke: '1.5px rgba(20,20,26,0.75)', color: 'transparent' }}>WE MAKE</span>
              <span className="block text-[clamp(3rem,13vw,11rem)]">MEMORIES<span className="text-coral-500">.</span></span>
            </h1>
          </Reveal>

          <Reveal delay={260} className="mt-10 max-w-2xl">
            <p className="text-lg leading-relaxed text-ink-950/70 sm:text-xl">{tagline}</p>
          </Reveal>

          <Reveal delay={420} className="mt-10 flex flex-wrap gap-3">
            <Link to="/events" className="btn btn-lg bg-ink-950 text-white hover:bg-graphite-800 group">Explore events <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link to="/jobs" className="btn btn-lg border border-ink-950/25 bg-white/40 text-ink-950 backdrop-blur-sm hover:border-ink-950/40 hover:bg-white/70 group">Join the collective <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
          </Reveal>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-ink-950/40">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Keep going</span>
              <ArrowRight size={18} className="rotate-90 animate-bounce-subtle" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 02 — MANIFESTO LIST (DARK GRAPHITE) ============ */}
      <section className="relative border-y border-white/[0.06] bg-graphite-900">
        <div className="grain pointer-events-none absolute inset-0 opacity-8" />
        <div className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-ultraviolet-500/12 blur-[140px] animate-drift" />
        <div className="container-synf relative py-24 sm:py-32">
          <Reveal className="index-marker text-coral-400">02 / What we believe</Reveal>
          <Reveal delay={80}>
            <h2 className="mb-16 max-w-3xl font-display text-4xl font-bold leading-[0.9] tracking-tightest text-white sm:text-6xl">
              Not an agency. Not a <span style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.7)', color: 'transparent' }}>template.</span><br />A <span className="bg-gradient-to-r from-ultraviolet-300 via-coral-400 to-ultraviolet-300 bg-clip-text text-transparent">movement.</span>
            </h2>
          </Reveal>

          <div className="divide-y divide-white/[0.06]">
            {MANIFESTO.map((m, i) => (
              <Reveal key={m.n} delay={i * 100}>
                <div className="group flex items-start gap-6 py-8 transition-colors hover:bg-white/[0.015] sm:items-center sm:gap-10 sm:py-10">
                  <span className={`font-mono text-2xl font-bold sm:text-4xl ${m.color}`}>{m.n}</span>
                  <p className="font-display text-xl font-semibold leading-tight tracking-tight text-white/80 transition-colors group-hover:text-white sm:text-3xl sm:leading-[1.1]">
                    {m.text}
                  </p>
                  <ArrowUpRight size={24} className="ml-auto hidden shrink-0 text-white/15 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-coral-400 sm:block" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 03 — STORY (PORCELAIN WIDE QUOTE) ============ */}
      <section className="relative overflow-hidden bg-porcelain-100 py-24 sm:py-32">
        <div className="container-synf relative">
          {loading ? (
            <div className="h-64 animate-pulse rounded-2xl bg-porcelain-300" />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_2.5fr] lg:gap-16">
              <Reveal>
                <div className="sticky top-24">
                  <div className="index-marker text-ultraviolet-600">03 / The story</div>
                  <p className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-950/45">What we're built on.</p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="max-w-3xl whitespace-pre-wrap text-xl leading-[1.7] text-ink-950/80 sm:text-2xl">{body}</div>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* ============ CHAPTER 04 — VALUES TICKER (DARK) ============ */}
      <section className="border-y border-white/[0.06] bg-gradient-to-r from-ultraviolet-500/8 via-ink-900/5 to-coral-400/8">
        <div className="container-synf py-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-display text-sm font-semibold uppercase tracking-widest text-white/45 sm:text-base">
            {VALUES.map((v, i) => (
              <Reveal key={v} delay={i * 60} className="flex items-center gap-8">
                <span className="transition-colors hover:text-coral-400">{v}</span>
                <span className="text-ultraviolet-400/40">/</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 05 — COLLECTIVE PREVIEW (DARK) ============ */}
      {people.length > 0 && (
        <section className="container-synf py-24 sm:py-32">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal className="index-marker text-ultraviolet-300">04 / The collective</Reveal>
              <Reveal>
                <h2 className="mt-3 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-white sm:text-6xl">
                  Humans behind<br />the <span className="bg-gradient-to-r from-ultraviolet-300 to-coral-400 bg-clip-text text-transparent">nights.</span>
                </h2>
              </Reveal>
            </div>
            <Link to="/people" className="group inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-ultraviolet-300">
              Meet everyone <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((p, i) => <Reveal key={p.id} delay={i * 80}><PersonCard person={p} /></Reveal>)}
          </div>
        </section>
      )}

      {/* ============ CHAPTER 06 — PILLARS (PORCELAIN) ============ */}
      <section className="relative overflow-hidden bg-porcelain-100 py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-porcelain-100 via-lavender-200/60 to-porcelain-100" />
        <div className="container-synf relative">
          <Reveal className="index-marker text-ultraviolet-600">05 / What we do</Reveal>
          <Reveal delay={80}>
            <h2 className="mb-12 font-display text-4xl font-bold leading-[0.9] tracking-tightest text-ink-950 sm:text-6xl">Three things,<br />done <span className="bg-gradient-to-r from-ultraviolet-600 to-coral-500 bg-clip-text text-transparent">properly.</span></h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Flame, title: 'Parties', body: 'Full-spectrum nightlife — from intimate parties to big-room energy. Every event built from scratch.', accent: 'text-coral-500', border: 'hover:border-coral-500/40' },
              { icon: Volume2, title: 'Music', body: 'DJ nights and curated lineups across genres that move the room. Bollywood, house, hip-hop, commercial.', accent: 'text-ultraviolet-600', border: 'hover:border-ultraviolet-500/40' },
              { icon: Users, title: 'Culture', body: 'Collaborations with creatives, brands and venues that push things forward in Hyderabad.', accent: 'text-ultraviolet-600', border: 'hover:border-ultraviolet-500/40' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={i} delay={i * 120}>
                  <div className={`group relative h-full overflow-hidden rounded-3xl border border-ink-950/12 bg-white/50 p-8 transition-all duration-500 ${c.border} hover:bg-white/70`}>
                    <div className="relative">
                      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-950/12 bg-porcelain-100">
                        <Icon size={26} className={c.accent} />
                      </div>
                      <h3 className={`font-display text-2xl font-semibold tracking-tight ${c.accent}`}>{c.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-950/60">{c.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CHAPTER 07 — CLOSING INVITATION (ULTRAVIOLET GRADIENT) ============ */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-ultraviolet-600 via-graphite-900 to-ultraviolet-700">
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />
          <div className="absolute -left-20 top-1/3 h-[30rem] w-[30rem] rounded-full bg-coral-500/15 blur-[120px] animate-drift" />
          <div className="container-synf relative py-24 sm:py-32">
            <Reveal>
              <p className="index-marker text-white/70">The invitation</p>
              <h2 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[0.85] tracking-tightest text-white sm:text-6xl lg:text-7xl">
                The night is what<br />we make of it.<br />Come make it <span style={{ WebkitTextStroke: '1.5px #d4ff3f', color: 'transparent' }}>with us.</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/events" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-ink-950 transition-all hover:scale-105 hover:shadow-2xl">
                  <Calendar size={18} /> Explore events <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/jobs" className="group inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-4 text-sm font-bold text-white transition-all hover:border-white hover:bg-white/[0.06]">
                  <Users size={18} /> Join the collective <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/collaborate" className="group inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-4 text-sm font-bold text-white transition-all hover:border-white hover:bg-white/[0.06]">
                  <Sparkles size={18} /> Collaborate <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
