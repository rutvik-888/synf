import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PersonRow, DepartmentRow } from '@/lib/types';
import { PersonCard } from '@/components/PersonCard';
import { Reveal } from '@/components/Reveal';
import { DimensionalBackground } from '@/components/DimensionalBackground';
import { Users, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSeo, collectionPageJsonLd, personJsonLd } from '@/lib/seo';

export function People() {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [cat, setCat] = useState(searchParams.get('filter') || 'all');

  useEffect(() => {
    if (cat === 'all') {
      searchParams.delete('filter');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ filter: cat }, { replace: true });
    }
  }, [cat]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      const [peopleRes, deptRes] = await Promise.all([
        supabase.from('people').select('*').eq('status', 'approved').order('sort_order'),
        supabase.from('departments').select('id,name,group_label,sort_order,is_active').eq('is_active', true).order('sort_order'),
      ]);
      setPeople((peopleRes.data as PersonRow[]) || []);
      setDepartments((deptRes.data as DepartmentRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const usedDeptIds = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) {
      if (p.category) set.add(p.category);
      if (p.secondary_category) set.add(p.secondary_category);
    }
    return set;
  }, [people]);

  const filters = useMemo(() => {
    return departments
      .filter(d => usedDeptIds.has(d.id))
      .map(d => ({ key: d.id, label: d.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [departments, usedDeptIds]);

  const filtered = cat === 'all'
    ? people
    : people.filter(p => p.category === cat || p.secondary_category === cat);

  useSeo({
    title: 'The Collective — Team Synf People, DJs & Creatives',
    description: `Meet the ${people.length} students, DJs, creatives and collaborators behind every Team Synf night in Hyderabad.`,
    path: '/people',
    keywords: ['Team Synf collective', 'DJs Hyderabad', 'student creatives', 'event photographers Hyderabad', 'party DJs India', 'creative collective members', 'Synf crew'],
    jsonLd: [
      collectionPageJsonLd('The Collective', '/people', people.length),
      ...people.slice(0, 10).map(p => personJsonLd(p)),
    ],
  });

  return (
    <div className="bg-ink-void">
      {/* === Editorial header — void chapter === */}
      <section className="relative overflow-hidden bg-ink-obsidian py-20 sm:py-28">
        <DimensionalBackground variant="monoliths" accent="mixed" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-600/10 blur-[140px] animate-drift" />
        <div className="absolute -right-40 bottom-0 h-[25rem] w-[25rem] rounded-full bg-cyan-500/8 blur-[120px] animate-drift" style={{ animationDelay: '5s' }} />

        <div className="container-synf relative">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Reveal className="index-marker text-cyan-400"><Users size={14} /> People · Index</Reveal>
              <Reveal delay={80}>
                <h1 className="display-dimensional text-signal">
                  The <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">collective.</span>
                </h1>
              </Reveal>
              <Reveal delay={200}><p className="mt-6 max-w-xl text-base text-white/55 sm:text-lg">The students, DJs, creatives and collaborators behind every Team Synf night.</p></Reveal>
            </div>
            {!loading && (
              <Reveal delay={300}>
                <div className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest text-white/35">
                  <div className="flex items-center gap-3"><span className="text-cyan-400">{people.length}</span> people</div>
                  <div className="flex items-center gap-3"><span className="text-white/55">{filters.length}</span> disciplines</div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* === Filter chips === */}
      <section className="container-synf pb-8 pt-6">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/30"><span className="h-px w-6 bg-ultraviolet-500/40" /> Filter</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat('all')}
            className={`chip border transition-all duration-300 ${cat === 'all' ? 'border-ultraviolet-500/30 bg-ultraviolet-500/15 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/55 hover:border-white/20 hover:text-white'}`}
          >
            Everyone
          </button>
          {filters.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`chip border transition-all duration-300 ${cat === c.key ? 'border-ultraviolet-500/30 bg-ultraviolet-500/15 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/55 hover:border-white/20 hover:text-white'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* === Featured members strip === */}
      {!loading && people.filter(p => p.featured).length > 0 && (
        <section className="container-synf pb-8">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400"><span className="h-px w-6 bg-cyan-400/40" /> Featured</div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {people.filter(p => p.featured).slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <Link to={`/people/${p.slug}`} className="group flex w-48 flex-shrink-0 snap-start items-center gap-3 rounded-2xl border border-white/[0.08] bg-ink-900/50 p-3 transition-all hover:border-cyan-400/25">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-800">
                    {p.portrait_url ? <img src={p.portrait_url} alt={p.name} className="h-full w-full object-cover" /> : <Users size={20} className="text-white/20" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-semibold text-white group-hover:text-cyan-400">{p.name}</div>
                    <div className="truncate text-xs text-white/35">{p.role}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* === Portrait grid === */}
      <section className="container-synf pb-24">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/5] animate-pulse rounded-2xl bg-ink-900" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="mx-auto h-10 w-10 text-ink-400" />
            <h2 className="mt-4 font-display text-2xl font-bold">No profiles published yet</h2>
            <p className="mt-2 text-white/45">Team Synf members and collaborators will appear here once approved by an admin.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => <Reveal key={p.id} delay={i * 60} direction="scale"><PersonCard person={p} /></Reveal>)}
          </div>
        )}
      </section>

      {/* === Join CTA === */}
      <section className="container-synf pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-ink-graphite to-ink-void p-10 text-center sm:p-16">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-ultraviolet-500/12 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative">
              <div className="index-marker justify-center text-cyan-400">Join us</div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-signal sm:text-5xl">Want to be part of this?</h2>
              <p className="mx-auto mt-3 max-w-md text-white/55">We're always looking for students and creatives to join the collective.</p>
              <Link to="/apply" className="btn btn-lg bg-white text-ink-void hover:bg-white/90 mt-8 group">Apply to join <ArrowRight /></Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
