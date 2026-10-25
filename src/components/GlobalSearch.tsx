import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, User, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  result_type: string;
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  image_url: string | null;
  url: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_site', { p_query: query.trim(), p_limit: 12 });
      if (cancelled) return;
      if (!error && data) setResults(data as SearchResult[]);
      setLoading(false);
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  function selectResult(r: SearchResult) {
    navigate(r.url);
    setOpen(false);
  }

  function onKeyNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) { e.preventDefault(); selectResult(results[activeIdx]); }
  }

  const iconFor = (type: string) => type === 'event' ? Calendar : type === 'person' ? User : Briefcase;
  const typeLabel = (type: string) => type === 'event' ? 'Event' : type === 'person' ? 'Person' : 'Job';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/50 transition-colors hover:border-synf-500/40 hover:text-white/80 md:flex"
        aria-label="Search"
      >
        <Search size={16} />
        <span className="font-mono text-xs">Search</span>
        <kbd className="ml-1 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center bg-ink-950/80 backdrop-blur-md pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-ink-900 shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <Search size={20} className="text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyNav}
            placeholder="Search events, people, jobs…"
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && <div className="px-4 py-6 text-center text-sm text-white/40">Searching…</div>}
          {!loading && query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-white/40">No results for "{query}"</div>
          )}
          {!loading && results.length > 0 && (
            <ul className="py-2">
              {results.map((r, i) => {
                const Icon = iconFor(r.result_type);
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => selectResult(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${i === activeIdx ? 'bg-white/[0.03]' : ''}`}
                    >
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.03]"><Icon size={18} className="text-white/40" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                        {r.subtitle && <div className="truncate text-xs text-white/40">{r.subtitle}</div>}
                      </div>
                      <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/40">{typeLabel(r.result_type)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && !query && (
            <div className="px-4 py-6 text-center text-sm text-white/30">Start typing to search across events, people, and jobs.</div>
          )}
        </div>
      </div>
    </div>
  );
}
