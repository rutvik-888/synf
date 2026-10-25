import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Bookmark, X } from 'lucide-react';

interface SavedView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
}

export function useSavedViews(page: string) {
  const { user } = useAuth();
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('admin_saved_views')
        .select('id, name, filters, is_default')
        .eq('page', page)
        .eq('user_id', user.id)
        .order('created_at');
      setViews((data as SavedView[]) || []);
      setLoading(false);
    })();
  }, [user, page]);

  async function saveView(name: string, filters: Record<string, unknown>) {
    if (!user) return;
    const { data } = await supabase
      .from('admin_saved_views')
      .insert({ user_id: user.id, page, name, filters })
      .select('id, name, filters, is_default')
      .single();
    if (data) setViews(prev => [...prev, data as SavedView]);
  }

  async function deleteView(id: string) {
    await supabase.from('admin_saved_views').delete().eq('id', id);
    setViews(prev => prev.filter(v => v.id !== id));
  }

  return { views, loading, saveView, deleteView };
}

export function SavedViewBar({ page, currentFilters, onApply }: { page: string; currentFilters: Record<string, unknown>; onApply: (filters: Record<string, unknown>) => void }) {
  const { views, saveView, deleteView } = useSavedViews(page);
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState('');

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    saveView(name.trim(), currentFilters);
    setName('');
    setShowSave(false);
  }

  if (views.length === 0 && !showSave) {
    return (
      <button onClick={() => setShowSave(true)} className="chip border border-white/10 bg-white/5 text-white/50 hover:text-white">
        <Bookmark size={12} /> Save view
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {views.map(v => (
        <div key={v.id} className="group flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1">
          <button onClick={() => onApply(v.filters)} className="text-xs font-medium text-white/70 hover:text-white">
            {v.name}
          </button>
          <button onClick={() => deleteView(v.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
            <X size={10} className="text-white/30 hover:text-synf-400" />
          </button>
        </div>
      ))}
      {showSave ? (
        <form onSubmit={save} className="flex items-center gap-1">
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="View name…" className="input-xs w-28" />
          <button type="submit" className="btn-primary h-7 px-2 text-xs">Save</button>
          <button type="button" onClick={() => setShowSave(false)} className="text-white/30 hover:text-white"><X size={12} /></button>
        </form>
      ) : (
        <button onClick={() => setShowSave(true)} className="chip border border-white/10 bg-white/5 text-white/50 hover:text-white">
          <Bookmark size={12} /> Save
        </button>
      )}
    </div>
  );
}
