import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CommunityWallPostRow, CommunityWallCategoryRow } from '@/lib/platform-types';
import { Reveal } from '@/components/Reveal';
import { Camera, X, ChevronLeft, ChevronRight, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Flame, TrendingUp } from 'lucide-react';
import { submitPublicForm } from '@/lib/api';
import { useSeo, collectionPageJsonLd } from '@/lib/seo';

const PAGE_SIZE = 24;

export function CommunityWall() {
  const [posts, setPosts] = useState<CommunityWallPostRow[]>([]);
  const [categories, setCategories] = useState<CommunityWallCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setHasMore(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('community_wall_posts').select('*, category:community_wall_categories(*)').eq('status', 'approved').order('is_featured', { ascending: false }).order('sort_order').order('created_at', { ascending: false }).limit(PAGE_SIZE),
        supabase.from('community_wall_categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setPosts((p as CommunityWallPostRow[]) || []);
      setCategories((c as CommunityWallCategoryRow[]) || []);
      if (((p as CommunityWallPostRow[]) || []).length < PAGE_SIZE) setHasMore(false);
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { data: more } = await supabase
      .from('community_wall_posts')
      .select('*, category:community_wall_categories(*)')
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('sort_order')
      .order('created_at', { ascending: false })
      .range(posts.length, posts.length + PAGE_SIZE - 1);
    const newPosts = (more as CommunityWallPostRow[]) || [];
    if (newPosts.length < PAGE_SIZE) setHasMore(false);
    setPosts(prev => [...prev, ...newPosts]);
    setLoadingMore(false);
  }, [loadingMore, hasMore, posts.length]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const filtered = posts.filter(p => activeCat === 'all' || p.category_id === activeCat);

  useSeo({
    title: 'Community Wall — Moments from Team Synf Nights',
    description: `Browse ${posts.length} community-submitted photos and videos from Team Synf events in Hyderabad. See the nights through the eyes of the people who lived them.`,
    path: '/community',
    keywords: ['Team Synf community', 'Hyderabad party photos', 'event photos India', 'nightlife photography Hyderabad', 'community wall', 'party photos Hyderabad', 'Synf events photos'],
    jsonLd: collectionPageJsonLd('Community Wall', '/community', posts.length),
  });

  const closeLightbox = () => setLightbox(null);
  const next = () => setLightbox(i => i === null ? i : (i + 1) % filtered.length);
  const prev = () => setLightbox(i => i === null ? i : (i - 1 + filtered.length) % filtered.length);

  return (
    <div className="bg-ink-950 min-h-screen">
      <section className="relative overflow-hidden bg-porcelain-100 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-porcelain-100 via-lavender-200/70 to-porcelain-200" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ultraviolet-500/8 via-transparent to-coral-400/8" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-500/12 blur-[120px] animate-drift gpu" />
        <div className="container-synf relative">
          <Reveal className="index-marker text-ultraviolet-600"><Camera size={14} /> Community Wall</Reveal>
          <Reveal><h1 className="display-dimensional text-ink-950 text-shadow-chrome">The <span className="bg-gradient-to-r from-ultraviolet-600 via-coral-500 to-ultraviolet-500 bg-clip-text text-transparent">wall.</span></h1></Reveal>
          <Reveal delay={150}><p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-950/70">Moments from the community — photos and videos from Synf nights, submitted by the people who lived them.</p></Reveal>
          <Reveal delay={250}>
            <button onClick={() => setShowSubmit(true)} className="btn btn-lg bg-coral-500 text-white hover:bg-coral-400 mt-6 group">
              <Upload size={16} /> Submit your moment <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
      </section>

      {loading ? (
        <section className="container-synf py-20"><div className="h-96 animate-pulse rounded-2xl bg-ink-900" /></section>
      ) : posts.length === 0 ? (
        <section className="container-synf py-24 text-center">
          <Reveal>
            <ImageIcon className="mx-auto h-10 w-10 text-ink-600" />
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">No posts yet</h2>
            <p className="mx-auto mt-3 max-w-md text-white/60">The wall is waiting for your moments. Submit a photo or video from a Synf night.</p>
            <button onClick={() => setShowSubmit(true)} className="btn btn-lg bg-coral-500 text-white hover:bg-coral-400 mt-6 inline-flex group"><Upload size={16} /> Submit your moment</button>
          </Reveal>
        </section>
      ) : (
        <section className="container-synf pb-24">
          <div className="mb-8 flex flex-wrap gap-2">
            <button onClick={() => setActiveCat('all')} className={`chip border transition-all ${activeCat === 'all' ? 'border-ultraviolet-500/40 bg-ultraviolet-500/20 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/60 hover:text-white'}`}>All</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={`chip border transition-all ${activeCat === c.id ? 'border-ultraviolet-500/40 bg-ultraviolet-500/20 text-ultraviolet-300' : 'border-white/[0.08] bg-ink-900 text-white/60 hover:text-white'}`}>{c.name}</button>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-3 [&>*]:mb-4">
                {filtered.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 6) * 60}>
                    <button onClick={() => setLightbox(i)} className="group relative block w-full overflow-hidden rounded-xl border border-white/[0.08] transition-all hover:border-ultraviolet-500/40">
                      {p.media_type === 'video' ? (
                        <div className="relative aspect-square">
                          {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} alt={p.caption || ''} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-ink-900"><Camera size={24} className="text-white/30" /></div>
                          )}
                        </div>
                      ) : (
                        <img src={p.media_url} alt={p.caption || ''} loading="lazy" referrerPolicy="no-referrer" className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      {p.caption && <p className="absolute bottom-2 left-2 right-2 text-left text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100">{p.caption}</p>}
                      {p.is_featured && <span className="absolute right-2 top-2 chip border border-coral-400/40 bg-ink-950/80 text-[9px] text-coral-400">Featured</span>}
                    </button>
                  </Reveal>
                ))}
              </div>
              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-12">
                  {loadingMore ? (
                    <Loader2 size={24} className="animate-spin text-white/40" />
                  ) : (
                    <div className="h-2 w-2" />
                  )}
                </div>
              )}
            </div>

            {/* Trending sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold"><TrendingUp size={16} className="text-ultraviolet-400" /> Trending now</div>
                  <div className="space-y-3">
                    {posts.filter(p => p.is_featured).slice(0, 5).map((p, i) => (
                      <button key={p.id} onClick={() => setLightbox(filtered.indexOf(p))} className="flex w-full items-start gap-3 text-left transition hover:opacity-80">
                        <span className="font-display text-lg font-bold text-white/20">{i + 1}</span>
                        <div className="flex-1 overflow-hidden">
                          {p.thumbnail_url || p.media_url ? (
                            <div className="h-16 w-full overflow-hidden rounded-lg"><img src={p.thumbnail_url || p.media_url} alt="" className="h-full w-full object-cover" /></div>
                          ) : null}
                          <p className="mt-1.5 line-clamp-2 text-xs text-white/60">{p.caption || 'Untitled moment'}</p>
                        </div>
                      </button>
                    ))}
                    {posts.filter(p => p.is_featured).length === 0 && (
                      <p className="text-xs text-white/40">Featured posts will appear here.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-ultraviolet-500/20 bg-gradient-to-br from-ultraviolet-500/10 to-transparent p-5">
                  <Flame size={20} className="text-ultraviolet-400" />
                  <h3 className="mt-2 font-display text-sm font-bold">Got a moment to share?</h3>
                  <p className="mt-1 text-xs text-white/50">Submit your photos and videos from Synf nights.</p>
                  <button onClick={() => setShowSubmit(true)} className="btn btn-lg w-full bg-ink-950 text-white hover:bg-graphite-800 mt-3 text-xs">Submit your moment</button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl" onClick={closeLightbox}>
          <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/20" onClick={closeLightbox}><X size={20} /></button>
          <button className="absolute left-4 grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft size={20} /></button>
          <button className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight size={20} /></button>
          <div className="max-h-[85vh] max-w-4xl p-4" onClick={e => e.stopPropagation()}>
            {filtered[lightbox].media_type === 'video' ? (
              <video src={filtered[lightbox].media_url} controls className="max-h-[75vh] w-full rounded-xl" />
            ) : (
              <img src={filtered[lightbox].media_url} alt={filtered[lightbox].caption || ''} referrerPolicy="no-referrer" className="max-h-[75vh] w-full rounded-xl object-contain" />
            )}
            {filtered[lightbox].caption && <p className="mt-4 text-center text-white/70">{filtered[lightbox].caption}</p>}
            {filtered[lightbox].contributor_name && !filtered[lightbox].is_anonymous && <p className="mt-1 text-center text-sm text-white/40">By {filtered[lightbox].contributor_name}</p>}
          </div>
        </div>
      )}

      {/* Submit modal */}
      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} categories={categories} />}
    </div>
  );
}

function SubmitModal({ onClose, categories }: { onClose: () => void; categories: CommunityWallCategoryRow[] }) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mediaUrl || !consent) return;
    setStatus('loading');
    const r = await submitPublicForm({
      kind: 'community_wall',
      media_url: mediaUrl,
      media_type: 'image',
      caption,
      category_id: categoryId || null,
      contributor_name: isAnonymous ? null : contributorName,
      is_anonymous: isAnonymous,
      consent_confirmed: consent,
      contact_email: contactEmail,
    });
    if (r.error) { setStatus('err'); setMsg(r.error); }
    else { setStatus('ok'); setMsg('Submitted! Your post will appear on the wall once approved by the Synf team.'); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-ink-900 p-6 sm:p-8" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">Submit your moment</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] hover:bg-white/20"><X size={16} /></button>
        </div>

        {status === 'ok' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-acid-500" />
            <p className="mt-4 text-white/80">{msg}</p>
            <button onClick={onClose} className="btn btn-lg bg-ink-950 text-white hover:bg-graphite-800 mt-6">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Image URL *</label>
              <input className="input" required placeholder="https://…" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
              <p className="mt-1 text-xs text-white/40">Paste a direct link to your photo or video.</p>
            </div>
            <div><label className="label">Caption</label><input className="input" placeholder="What's happening in this moment?" value={caption} onChange={e => setCaption(e.target.value)} /></div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Select…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Your name</label><input className="input" placeholder="Shown with your post" value={contributorName} onChange={e => setContributorName(e.target.value)} disabled={isAnonymous} /></div>
            <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="accent-ultraviolet-400" /> Post anonymously</label>
            <div><label className="label">Contact email (private, for moderation only)</label><input className="input" type="email" placeholder="your@email.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
            <label className="flex items-start gap-2 text-xs text-white/50">
              <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-ultraviolet-400" />
              I own this content and confirm I have permission to share it. I understand submission does not guarantee publication.
            </label>
            {status === 'err' && <div className="flex items-center gap-2 rounded-lg border border-coral-500/30 bg-coral-500/10 p-3 text-sm text-coral-300"><AlertCircle size={16} /> {msg}</div>}
            <button type="submit" disabled={status === 'loading'} className="btn btn-lg w-full bg-coral-500 text-white hover:bg-coral-400 group">
              {status === 'loading' ? 'Submitting…' : <>Submit <Upload size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
