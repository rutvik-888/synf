import { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Flame, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { EventRow } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { Reveal } from '@/components/Reveal';
import { DimensionalBackground } from '@/components/DimensionalBackground';
import { useSeo, collectionPageJsonLd } from '@/lib/seo';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'announced', label: 'Announced' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Past' },
  { key: 'postponed', label: 'Postponed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'sold_out', label: 'Sold out' },
];

export function EventsArchive() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('events').select('*').eq('is_published', true).order('start_at', { ascending: false, nullsFirst: false });
      setEvents((data as EventRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => Array.from(new Set(events.map(e => e.venue_city).filter(Boolean))) as string[], [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (status !== 'all' && e.status !== status) return false;
      if (city !== 'all' && e.venue_city !== city) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${e.title} ${e.subtitle || ''} ${e.venue_name || ''} ${e.venue_city || ''} ${e.category || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, status, city, query]);

  const upcoming = filtered.filter(e => ['announced', 'upcoming'].includes(e.status));
  const past = filtered.filter(e => ['completed', 'cancelled', 'postponed'].includes(e.status));

  useSeo({
    title: 'Events — Parties, DJ Nights & Experiences in Hyderabad',
    description: `Browse all Team Synf events — ${events.length} parties, DJ nights and curated experiences across Hyderabad. Upcoming events, past archive and ticket links.`,
    path: '/events',
    keywords: ['Team Synf events', 'Hyderabad events', 'Hyderabad parties', 'DJ nights Hyderabad', 'nightlife Hyderabad', 'college events', 'music events India', 'event archive'],
    jsonLd: collectionPageJsonLd('Team Synf Events', '/events', events.length),
  });

  return (
    <div className="bg-ink-void min-h-screen">
      {/* === Editorial header — void chapter === */}
      <section className="relative overflow-hidden bg-ink-obsidian py-20 sm:py-28">
        <DimensionalBackground variant="crystal-field" accent="mixed" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-600/10 blur-[140px] animate-drift" />
        <div className="absolute -right-40 bottom-0 h-[25rem] w-[25rem] rounded-full bg-cyan-500/8 blur-[120px] animate-drift" style={{ animationDelay: '5s' }} />

        <div className="container-synf relative">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Reveal className="index-marker text-cyan-400"><Calendar size={14} /> Events · Index</Reveal>
              <Reveal delay={80}>
                <h1 className="display-dimensional text-signal">
                  Every night,<br />
                  <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">a story.</span>
                </h1>
              </Reveal>
              <Reveal delay={200}><p className="mt-6 max-w-xl text-base text-white/55 sm:text-lg">Parties, DJ nights and curated experiences. Browse what's coming and where we've been.</p></Reveal>
            </div>
            {!loading && (
              <Reveal delay={300}>
                <div className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest text-white/35">
                  <div className="flex items-center gap-3">
                    <span className="text-white/55">{events.length}</span> total
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400">{upcoming.length}</span> upcoming
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/55">{past.length}</span> in archive
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* === Filter bar — dark utility panel === */}
      <section className="container-synf pb-10 pt-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-ink-900/50 p-4 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search events, venues, cities…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map(s => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`chip border transition-all duration-300 ${status === s.key ? 'border-ultraviolet-500/30 bg-ultraviolet-500/15 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/55 hover:border-white/20 hover:text-white'}`}
              >
                {s.label}
              </button>
            ))}
            {cities.length > 0 && (
              <select className="input ml-auto w-auto py-1.5 text-xs" value={city} onChange={e => setCity(e.target.value)}>
                <option value="all">All cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>
      </section>

      {/* === Content === */}
      {loading ? (
        <section className="container-synf py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-ink-900" />)}
          </div>
        </section>
      ) : filtered.length === 0 ? (
        <section className="container-synf py-24 text-center">
          <SlidersHorizontal className="mx-auto h-10 w-10 text-ink-400" />
          <h2 className="mt-4 font-display text-2xl font-bold">No events match your filters</h2>
          <p className="mt-2 text-white/45">Try clearing your search or check back soon — we're always planning.</p>
        </section>
      ) : (
        <div className="container-synf pb-24 space-y-24">
          {upcoming.length > 0 && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <Flame size={18} className="text-cyan-400" />
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-signal sm:text-3xl">Upcoming</h2>
                </div>
                <span className="chip border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">{upcoming.length}</span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard event={e} /></Reveal>)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="text-white/40" />
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-signal sm:text-3xl">Archive</h2>
                </div>
                <span className="chip border border-white/[0.08] bg-white/[0.03] text-white/45">{past.length}</span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard event={e} /></Reveal>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
