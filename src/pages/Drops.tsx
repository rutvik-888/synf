import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { SecretDropRow, SecretDropStageRow } from '@/lib/platform-types';
import { Reveal } from '@/components/Reveal';
import { ArrowRight, Lock, Eye, EyeOff, Bell, Flame } from 'lucide-react';
import { countdown } from '@/lib/format';
import { useSeo, collectionPageJsonLd } from '@/lib/seo';

export function Drops() {
  const [drops, setDrops] = useState<SecretDropRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('secret_drops').select('*').eq('is_visible', true).order('sort_order').order('reveal_at', { ascending: false });
      setDrops((data as SecretDropRow[]) || []);
      setLoading(false);
    })();
  }, []);

  useSeo({
    title: 'Secret Drops — Upcoming Reveals & Teasers from Team Synf',
    description: `Cryptic teasers and staged reveals. ${drops.length} secret drops from Team Synf — something is coming and you'll see it here first.`,
    path: '/drops',
    keywords: ['Team Synf drops', 'secret drops Hyderabad', 'event teasers India', 'upcoming parties Hyderabad', 'limited drops', 'Hyderabad nightlife teasers', 'Synf reveals'],
    jsonLd: collectionPageJsonLd('Secret Drops', '/drops', drops.length),
  });

  return (
    <div className="bg-ink-void min-h-screen">
      <section className="relative overflow-hidden bg-ink-obsidian py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-void via-ink-obsidian to-ink-graphite" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ultraviolet-600/10 via-transparent to-cyan-500/6" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-600/12 blur-[120px] animate-drift gpu" />
        <div className="absolute -right-40 bottom-0 h-[25rem] w-[25rem] rounded-full bg-cyan-500/8 blur-[100px] animate-drift gpu" style={{ animationDelay: '5s' }} />
        <div className="container-synf relative">
          <Reveal className="index-marker text-cyan-400"><Lock size={14} /> Secret Drops</Reveal>
          <Reveal><h1 className="display-dimensional text-signal">Secret <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">Drops.</span></h1></Reveal>
          <Reveal delay={150}><p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">Cryptic teasers. Staged reveals. Something is coming — and you'll see it here first.</p></Reveal>
        </div>
      </section>

      {loading ? (
        <section className="container-synf py-20"><div className="h-96 animate-pulse rounded-2xl bg-ink-900" /></section>
      ) : drops.length === 0 ? (
        <section className="container-synf py-24 text-center">
          <Reveal>
            <Lock className="mx-auto h-10 w-10 text-ink-600" />
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">No active drops</h2>
            <p className="mx-auto mt-3 max-w-md text-white/60">When something is about to drop, you'll find the teaser here. Follow @team.synf to be first to know.</p>
            <a href="https://www.instagram.com/team.synf/" target="_blank" rel="noopener noreferrer" className="btn btn-lg bg-white text-ink-void hover:bg-white/90 mt-6 inline-flex">@team.synf</a>
          </Reveal>
        </section>
      ) : (
        <section className="container-synf pb-24">
          <div className="grid gap-8 md:grid-cols-2">
            {drops.map((d, i) => <Reveal key={d.id} delay={i * 100}><DropCard drop={d} /></Reveal>)}
          </div>
        </section>
      )}
    </div>
  );
}

function DropCard({ drop }: { drop: SecretDropRow }) {
  const cd = drop.reveal_at ? countdown(drop.reveal_at) : null;
  const isRevealed = drop.status === 'completed' || (cd?.past ?? false);

  return (
    <Link to={`/drops/${drop.slug}`} className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900 transition-all hover:border-ultraviolet-500/50 hover:shadow-[0_20px_80px_-20px] hover:shadow-ultraviolet-500/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        {drop.poster_url || drop.teaser_media_url ? (
          <img src={drop.poster_url || drop.teaser_media_url || ''} alt={drop.title} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ultraviolet-600 via-graphite-800 to-ink-950">
            <Lock size={48} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-void via-ink-void/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute left-4 top-4">
          {isRevealed ? (
            <span className="chip border border-lime-400/40 bg-lime-400/20 text-lime-400 backdrop-blur-sm"><Eye size={12} /> Revealed</span>
          ) : (
            <span className="chip border border-ultraviolet-500/40 bg-ultraviolet-500/20 text-ultraviolet-300 backdrop-blur-sm animate-glow-pulse"><EyeOff size={12} /> Locked</span>
          )}
        </div>

        {/* Countdown overlay */}
        {cd && !cd.past && (
          <div className="absolute right-4 top-4 rounded-xl border border-white/20 bg-ink-void/80 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-cyan-400"><Flame size={10} /> Reveals in</div>
            <div className="mt-1 flex items-center gap-2 font-mono">
              <span className="font-display text-xl font-bold text-signal">{String(cd.days).padStart(2, '0')}d</span>
              <span className="font-display text-xl font-bold text-signal">{String(cd.hours).padStart(2, '0')}h</span>
              <span className="font-display text-xl font-bold text-signal">{String(cd.mins).padStart(2, '0')}m</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-ultraviolet-400">{drop.title}</h3>
        {drop.teaser_description && <p className="mt-2 text-sm text-white/55">{drop.teaser_description}</p>}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ultraviolet-400 group-hover:text-ultraviolet-300">
          {isRevealed ? 'See the reveal' : 'Follow the drop'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function DropDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [drop, setDrop] = useState<SecretDropRow | null>(null);
  const [stages, setStages] = useState<SecretDropStageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('secret_drops').select('*').eq('slug', slug).eq('is_visible', true).maybeSingle();
      if (data) {
        setDrop(data as SecretDropRow);
        const { data: st } = await supabase.from('secret_drop_stages').select('*').eq('drop_id', (data as SecretDropRow).id).order('stage_number');
        setStages((st as SecretDropStageRow[]) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  useSeo({
    title: `${drop?.title || ''} — Secret Drop | Team Synf`,
    description: drop?.teaser_description || `${drop?.title || ''} — a secret drop from Team Synf. Something is coming.`,
    path: `/drops/${drop?.slug || ''}`,
    image: drop?.poster_url || drop?.teaser_media_url || undefined,
    type: 'article',
    keywords: [drop?.title || '', 'Team Synf drop', 'secret drop Hyderabad', 'Hyderabad event teaser', 'upcoming event India'],
  });

  if (loading) return <div className="bg-ink-void min-h-screen" />;
  if (!drop) return (
    <div className="bg-ink-void grid min-h-screen place-items-center">
      <div className="text-center">
        <Lock className="mx-auto h-12 w-12 text-ink-600" />
        <h1 className="mt-4 font-display text-3xl font-bold">Drop not found</h1>
        <Link to="/drops" className="btn btn-lg bg-white text-ink-void hover:bg-white/90 mt-6 inline-flex">Back to Drops</Link>
      </div>
    </div>
  );

  const cd = drop.reveal_at ? countdown(drop.reveal_at) : null;
  const isRevealed = drop.status === 'completed' || (cd?.past ?? false);

  return (
    <div className="bg-ink-void min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {drop.poster_url ? (
            <img src={drop.poster_url} alt={drop.title} className="h-full w-full object-cover opacity-30" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ultraviolet-600/30 via-ink-graphite/20 to-ink-void" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-void/60 via-ink-void/70 to-ink-void" />
        </div>
        <div className="grain pointer-events-none absolute inset-0 opacity-15" />
        <div className="container-synf relative py-24 sm:py-32">
          <Link to="/drops" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-ultraviolet-400"><ArrowRight size={14} className="rotate-180" /> Back to Drops</Link>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-ultraviolet-400"><Lock size={14} /> Secret Drop</div>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.85] tracking-tightest sm:text-7xl lg:text-8xl">{drop.title}</h1>
          {drop.teaser_description && <p className="mt-4 max-w-2xl text-xl text-white/70">{drop.teaser_description}</p>}

          {/* Live countdown */}
          {cd && !cd.past && (
            <div className="mt-10 inline-flex items-center gap-6 rounded-2xl border border-ultraviolet-500/30 bg-ink-900/70 p-6 backdrop-blur-sm animate-glow-pulse">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400"><Flame size={14} /> Reveals in</div>
              <div className="flex items-center gap-4 font-mono">
                {[['Days', cd.days], ['Hours', cd.hours], ['Mins', cd.mins], ['Secs', cd.secs]].map(([l, v]) => (
                  <div key={l as string} className="text-center">
                    <span className="font-display text-3xl font-bold text-white">{String(v).padStart(2, '0')}</span>
                    <span className="block text-[10px] text-ink-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product reveal animation */}
      {isRevealed && (drop.poster_url || drop.teaser_media_url) && (
        <section className="container-synf py-8">
          <div className="relative overflow-hidden rounded-3xl border border-lime-400/30">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-transparent to-ultraviolet-500/10" />
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative flex flex-col items-center gap-6 p-12 text-center">
              <span className="chip border border-lime-400/40 bg-lime-400/20 text-lime-400 animate-glow-pulse"><Eye size={12} /> Revealed</span>
              <div className="relative">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-lime-400/20 blur-2xl" />
                {(drop.poster_url || drop.teaser_media_url) && (
                  <img src={drop.poster_url || drop.teaser_media_url || ''} alt={drop.title} className="relative max-h-[24rem] rounded-2xl object-cover animate-fade-up" />
                )}
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tightest sm:text-5xl">{drop.title}</h2>
              {drop.teaser_description && <p className="max-w-xl text-white/70">{drop.teaser_description}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Stages */}
      {stages.length > 0 && (
        <section className="container-synf py-16">
          <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">Reveal stages</h2>
          <div className="space-y-4">
            {stages.map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${s.is_revealed ? 'border-lime-400/30 bg-lime-400/5' : 'border-white/[0.08] bg-ink-900'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${s.is_revealed ? 'bg-lime-400/20 text-lime-400' : 'bg-white/[0.03] text-white/30'}`}>
                      {s.is_revealed ? <Eye size={20} /> : <Lock size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs uppercase tracking-widest text-white/40">Stage {s.stage_number}</span>
                        {s.is_revealed ? <span className="chip border border-lime-400/40 bg-lime-400/10 text-[10px] text-lime-400">Revealed</span> : <span className="chip border border-white/[0.08] bg-white/[0.03] text-[10px] text-white/40">Locked</span>}
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight">{s.stage_name}</h3>
                      {s.is_revealed && s.stage_text && <p className="mt-2 text-white/70">{s.stage_text}</p>}
                      {s.is_revealed && s.media_url && <img src={s.media_url} alt={s.stage_name} className="mt-4 rounded-xl" />}
                      {s.is_revealed && s.cta_label && s.cta_url && (
                        <a href={s.cta_url} target="_blank" rel="noopener noreferrer" className="btn btn-lg bg-cyan-400 text-ink-void hover:bg-cyan-300 mt-4 inline-flex group">{s.cta_label} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Notify */}
      {drop.allow_notifications && !isRevealed && (
        <section className="container-synf pb-24">
          <div className="rounded-2xl border border-ultraviolet-500/30 bg-gradient-to-br from-ultraviolet-600/10 via-ink-obsidian to-ink-void p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-ultraviolet-400" />
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">Want to be first to know?</h3>
            <p className="mt-2 text-white/60">Follow <a href="https://www.instagram.com/team.synf/" target="_blank" rel="noopener noreferrer" className="text-ultraviolet-400 underline">@team.synf</a> on Instagram for the moment this drops.</p>
          </div>
        </section>
      )}
    </div>
  );
}
