import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { CommunityProfileRow, SavedEventRow } from '@/lib/platform-types';
import type { EventRow as EventRowType } from '@/lib/types';
import { Reveal } from '@/components/Reveal';
import { DimensionalBackground } from '@/components/DimensionalBackground';
import { Ticket, User, Heart, Settings, Calendar, Trash2, Check } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useSeo } from '@/lib/seo';

export function SynfPass() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<CommunityProfileRow | null>(null);
  const [savedEvents, setSavedEvents] = useState<EventRowType[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'saved' | 'settings'>('profile');

  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
    (async () => {
      const { data: p } = await supabase.from('community_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(p as CommunityProfileRow | null);
      if (p) {
        const { data: saved } = await supabase.from('saved_events').select('event_id').eq('user_id', user.id);
        const ids = (saved as SavedEventRow[])?.map(s => s.event_id) || [];
        if (ids.length > 0) {
          const { data: evts } = await supabase.from('events').select('*').in('id', ids).eq('is_published', true);
          setSavedEvents((evts as EventRowType[]) || []);
        }
      }
      setProfileLoading(false);
    })();
  }, [user]);

  useSeo({
    title: 'Synf Pass — Your Community Profile & Saved Events',
    description: 'Your community pass to Team Synf. Save events, follow nights, build your profile and collect attendance badges for Hyderabad events.',
    path: '/synf-pass',
    keywords: ['Synf Pass', 'Team Synf community', 'event tickets Hyderabad', 'save events', 'community profile', 'nightlife membership Hyderabad', 'event pass India'],
  });

  if (loading || profileLoading) return <div className="bg-ink-void min-h-screen" />;
  if (!user) return <PassLanding />;

  if (!profile) return <CreateProfile userId={user.id} email={user.email || ''} onCreated={(p) => setProfile(p)} />;

  return (
    <div className="bg-ink-void min-h-screen">
      <section className="relative overflow-hidden py-16">
        <DimensionalBackground variant="portal" accent="violet" />
        <div className="absolute -left-40 top-0 h-[25rem] w-[25rem] rounded-full bg-ultraviolet-500/10 blur-[120px] animate-drift" />
        <div className="grain pointer-events-none absolute inset-0 opacity-8" />
        <div className="container-synf relative">
          <Reveal className="index-marker text-ultraviolet-300"><Ticket size={14} /> Synf Pass</Reveal>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-ultraviolet-400/40 bg-ink-900">
              {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" /> : <User size={28} className="text-ultraviolet-400" />}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{profile.display_name}</h1>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-synf pb-24">
        <div className="mb-8 flex gap-1 border-b border-white/[0.08]">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'saved', label: 'Saved Events', icon: Heart },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${tab === t.key ? 'border-ultraviolet-400 text-ultraviolet-400' : 'border-transparent text-white/50 hover:text-white'}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'profile' && <ProfileTab profile={profile} userId={user.id} onUpdate={setProfile} />}
        {tab === 'saved' && <SavedTab events={savedEvents} userId={user.id} onRemove={(id) => setSavedEvents(prev => prev.filter(e => e.id !== id))} />}
        {tab === 'settings' && <SettingsTab profile={profile} userId={user.id} onUpdate={setProfile} />}
      </section>
    </div>
  );
}

function PassLanding() {
  return (
    <div className="bg-ink-void min-h-screen">
      <section className="relative overflow-hidden bg-ink-obsidian py-16 sm:py-24">
        <DimensionalBackground variant="portal" accent="mixed" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-600/12 blur-[120px] animate-drift" />
        <div className="absolute -right-40 bottom-0 h-[25rem] w-[25rem] rounded-full bg-cyan-500/8 blur-[100px] animate-drift" style={{ animationDelay: '5s' }} />
        <div className="container-synf relative">
          <Reveal className="index-marker text-cyan-400"><Ticket size={14} /> Synf Pass</Reveal>
          <Reveal><h1 className="display-dimensional text-signal">Synf <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">Pass.</span></h1></Reveal>
          <Reveal delay={150}><p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">Your community pass to Synf. Save events, follow nights, build your profile and collect attendance badges.</p></Reveal>
          <Reveal delay={250}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admin/signup" className="btn btn-lg bg-white text-ink-void hover:bg-white/90 group">Get your pass <Ticket size={18} /></Link>
              <Link to="/events" className="btn btn-lg border border-white/15 bg-white/5 text-signal backdrop-blur-sm hover:border-cyan-400/40 hover:bg-white/10">Browse events</Link>
            </div>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Heart, title: 'Save events', desc: 'Bookmark nights you want to attend.' },
                { icon: Calendar, title: 'Stay in the loop', desc: 'Get reminders for events you follow.' },
                { icon: Ticket, title: 'Attendance badges', desc: 'Collect verified badges for events you attend.' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <Icon size={24} className="text-cyan-400" />
                    <h3 className="mt-3 font-display text-lg font-bold text-signal">{f.title}</h3>
                    <p className="mt-1 text-sm text-white/45">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Testimonials */}
          <Reveal delay={450}>
            <div className="mt-16 space-y-4">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ultraviolet-300"><span className="h-px w-8 bg-ultraviolet-400/60" /> What pass holders say</div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { quote: "Getting early access to event announcements before anyone else is a game changer. I never miss a night now.", name: "Aarav K.", role: "Pass holder since 2025" },
                  { quote: "The attendance badges are addictive. I've collected 12 already and it feels like a real collection.", name: "Priya M.", role: "Gold tier member" },
                  { quote: "Saving events and getting reminders means I actually show up instead of finding out later I missed it.", name: "Rohan S.", role: "Pass holder" },
                ].map((t, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm italic leading-relaxed text-white/60">"{t.quote}"</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-ultraviolet-500/20 text-xs font-bold text-ultraviolet-300">{t.name.charAt(0)}</div>
                      <div><div className="text-xs font-semibold text-signal">{t.name}</div><div className="text-[10px] text-white/35">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CreateProfile({ userId, email, onCreated }: { userId: string; email: string; onCreated: (p: CommunityProfileRow) => void }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName) return;
    setLoading(true);
    const { data } = await supabase.from('community_profiles').insert({ user_id: userId, display_name: displayName, bio }).select('*').single();
    if (data) onCreated(data as CommunityProfileRow);
    setLoading(false);
  }

  return (
    <div className="bg-ink-void grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-ink-obsidian p-8">
        <Ticket className="mx-auto h-10 w-10 text-ultraviolet-400" />
        <h1 className="mt-4 text-center font-display text-2xl font-bold tracking-tight">Create your Synf Pass</h1>
        <p className="mt-2 text-center text-sm text-white/50">Welcome! Set up your community profile to start saving events.</p>
        <form onSubmit={create} className="mt-6 space-y-4">
          <div><label className="label">Email</label><input className="input opacity-60" value={email} disabled /></div>
          <div><label className="label">Display name *</label><input className="input" required placeholder="How you'll appear" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
          <div><label className="label">Bio</label><textarea className="input min-h-[80px]" placeholder="Tell the community about yourself" value={bio} onChange={e => setBio(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn btn-lg w-full bg-cyan-400 text-ink-void hover:bg-cyan-300">{loading ? 'Creating…' : 'Create profile'}</button>
        </form>
      </div>
    </div>
  );
}

function ProfileTab({ profile, userId, onUpdate }: { profile: CommunityProfileRow; userId: string; onUpdate: (p: CommunityProfileRow) => void }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [interests, setInterests] = useState((profile.interests || []).join(', '));
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase.from('community_profiles').update({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl || null,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId).select('*').single();
    if (data) { onUpdate(data as CommunityProfileRow); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Display name</label><input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
        <div><label className="label">Avatar URL</label><input className="input" placeholder="https://…" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} /></div>
      </div>
      <div><label className="label">Bio</label><textarea className="input min-h-[100px]" value={bio} onChange={e => setBio(e.target.value)} /></div>
      <div><label className="label">Interests (comma separated)</label><input className="input" placeholder="house music, photography, DJing" value={interests} onChange={e => setInterests(e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="accent-ultraviolet-400" /> Make profile public</label>
      <button type="submit" disabled={saving} className="btn btn-lg bg-cyan-400 text-ink-void hover:bg-cyan-300 group">
        {saving ? 'Saving…' : saved ? <><Check size={16} /> Saved</> : 'Save profile'}
      </button>
    </form>
  );
}

function SavedTab({ events, userId, onRemove }: { events: EventRowType[]; userId: string; onRemove: (id: string) => void }) {
  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <Heart className="mx-auto h-10 w-10 text-ink-600" />
        <h3 className="mt-4 font-display text-xl font-bold">No saved events yet</h3>
        <p className="mt-2 text-white/50">Browse events and tap the heart to save them here.</p>
        <Link to="/events" className="btn btn-lg bg-white text-ink-void hover:bg-white/90 mt-4 inline-flex">Browse events</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map(e => (
        <div key={e.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900">
          <Link to={`/events/${e.slug}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden">
              {e.cover_image_url ? (
                <img src={e.cover_image_url} alt={e.cover_image_alt || e.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ultraviolet-500/20 to-ink-void"><Calendar size={32} className="text-white/15" /></div>
              )}
            </div>
          </Link>
          <div className="p-4">
            <Link to={`/events/${e.slug}`}><h3 className="font-display text-base font-bold leading-tight hover:text-ultraviolet-400">{e.title}</h3></Link>
            {e.start_at && <p className="mt-1 text-xs text-white/40">{formatDate(e.start_at)}</p>}
            <button onClick={async () => { await supabase.from('saved_events').delete().eq('user_id', userId).eq('event_id', e.id); onRemove(e.id); }} className="mt-3 flex items-center gap-1 text-xs text-white/40 hover:text-cyan-400">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ profile, userId, onUpdate }: { profile: CommunityProfileRow; userId: string; onUpdate: (p: CommunityProfileRow) => void }) {
  const [notifPrefs, setNotifPrefs] = useState(profile.notification_preferences || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const { data } = await supabase.from('community_profiles').update({ notification_preferences: notifPrefs, updated_at: new Date().toISOString() }).eq('user_id', userId).select('*').single();
    if (data) { onUpdate(data as CommunityProfileRow); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold">Notification preferences</h3>
        <div className="mt-4 space-y-3">
          {[
            { key: 'new_events', label: 'New event announcements' },
            { key: 'saved_reminders', label: 'Reminders for saved events' },
            { key: 'drops', label: 'Secret Drop alerts' },
            { key: 'frequency', label: 'New Frequency articles' },
          ].map(p => (
            <label key={p.key} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-ink-900 p-4">
              <span className="text-sm text-white/70">{p.label}</span>
              <input type="checkbox" checked={notifPrefs[p.key] ?? false} onChange={e => setNotifPrefs(prev => ({ ...prev, [p.key]: e.target.checked }))} className="accent-ultraviolet-400" />
            </label>
          ))}
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn btn-lg bg-cyan-400 text-ink-void hover:bg-cyan-300">{saving ? 'Saving…' : saved ? <><Check size={16} /> Saved</> : 'Save settings'}</button>

      <div className="border-t border-white/[0.08] pt-6">
        <h3 className="font-display text-lg font-bold text-cyan-400">Danger zone</h3>
        <p className="mt-2 text-sm text-white/50">Delete your profile and all associated data. This cannot be undone.</p>
        <button onClick={async () => { if (confirm('Delete your profile? This cannot be undone.')) { await supabase.from('community_profiles').delete().eq('user_id', userId); window.location.reload(); } }} className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20">Delete profile</button>
      </div>
    </div>
  );
}
