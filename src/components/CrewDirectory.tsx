import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PersonRow } from '@/lib/types';
import { Search, Mail, Phone, Instagram, MapPin } from 'lucide-react';

interface CrewMember extends PersonRow {
  contact_email?: string;
  phone?: string;
}

export function CrewDirectory() {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');

  useEffect(() => {
    (async () => {
      const { data: people } = await supabase
        .from('people')
        .select('*')
        .in('status', ['approved', 'pending_review'])
        .order('name');
      const { data: profiles } = await supabase
        .from('team_member_profiles')
        .select('user_id, contact_email, phone');
      const profileMap = new Map((profiles || []).map((p: { user_id: string; contact_email?: string; phone?: string }) => [p.user_id, p]));
      const enriched = ((people as PersonRow[]) || []).map(p => ({
        ...p,
        contact_email: profileMap.get((p as PersonRow & { user_id?: string }).user_id || '')?.contact_email,
        phone: profileMap.get((p as PersonRow & { user_id?: string }).user_id || '')?.phone,
      }));
      setMembers(enriched);
      setLoading(false);
    })();
  }, []);

  const departments = [...new Set(members.map(m => m.category).filter(Boolean))] as string[];
  const filtered = members.filter(m => {
    if (q && !m.name.toLowerCase().includes(q.toLowerCase()) && !(m.role || '').toLowerCase().includes(q.toLowerCase())) return false;
    if (dept !== 'all' && m.category !== dept) return false;
    return true;
  });

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-white/5" />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-bold">Crew Directory</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="input pl-9" />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)} className="input">
            <option value="all">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center gap-3">
              {m.portrait_url ? (
                <img src={m.portrait_url} alt={m.portrait_alt || m.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-synf-500/20 font-display text-lg font-bold text-synf-400">
                  {m.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">{m.name}</div>
                <div className="truncate text-xs text-white/50">{m.role || m.category}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-white/60">
              {m.contact_email && (
                <a href={`mailto:${m.contact_email}`} className="flex items-center gap-2 hover:text-synf-400">
                  <Mail size={12} /> {m.contact_email}
                </a>
              )}
              {m.phone && (
                <a href={`tel:${m.phone}`} className="flex items-center gap-2 hover:text-synf-400">
                  <Phone size={12} /> {m.phone}
                </a>
              )}
              {m.instagram_url && (
                <a href={m.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-synf-400">
                  <Instagram size={12} /> @{m.instagram_url.split('instagram.com/')[1]?.replace('/', '') || 'instagram'}
                </a>
              )}
              {m.category && (
                <div className="flex items-center gap-2 text-white/40">
                  <MapPin size={12} /> {m.category}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
