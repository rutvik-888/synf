import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Inbox, UserSquare, Users, FileText, LogOut, Sparkles, Briefcase, Mail, Shield, Crown, Network, KeyRound, Settings, Camera, ShoppingBag, Megaphone, Palette, LayoutGrid, Store, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { CommandMenu } from '@/components/CommandMenu';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  roles: string[];
  group?: string;
};

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['founder', 'owner', 'co_founder', 'hr_manager', 'admin', 'department_head', 'event_manager', 'core_team_member', 'viewer'], group: 'Overview' },
  { to: '/admin/events', label: 'Events', icon: CalendarDays, roles: ['founder', 'owner', 'co_founder', 'admin', 'department_head', 'event_manager', 'viewer'], group: 'Operations' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Operations' },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase, roles: ['founder', 'owner', 'co_founder', 'hr_manager', 'admin'], group: 'Operations' },
  { to: '/admin/applications', label: 'Applications', icon: UserSquare, roles: ['founder', 'owner', 'co_founder', 'hr_manager', 'admin', 'event_manager'], group: 'Operations' },
  { to: '/admin/community', label: 'Community Wall', icon: Camera, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Operations' },
  { to: '/admin/goods', label: 'Goods', icon: ShoppingBag, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Operations' },
  { to: '/admin/shopify', label: 'Shopify', icon: Store, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Operations' },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/content-calendar', label: 'Content Calendar', icon: CalendarDays, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/brand-studio', label: 'Brand Studio', icon: Palette, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/site-sections', label: 'Site Sections', icon: LayoutGrid, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/templates', label: 'Templates', icon: Mail, roles: ['founder', 'owner', 'co_founder', 'admin', 'hr_manager'], group: 'Content' },
  { to: '/admin/content', label: 'Content', icon: FileText, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/contact-settings', label: 'Contact Settings', icon: Settings, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Content' },
  { to: '/admin/people', label: 'The Collective', icon: Users, roles: ['founder', 'owner', 'co_founder', 'admin', 'department_head', 'event_manager', 'viewer'], group: 'Team' },
  { to: '/admin/team', label: 'Team', icon: Network, roles: ['founder', 'owner', 'co_founder', 'hr_manager', 'admin'], group: 'Team' },
  { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Team' },
  { to: '/admin/invitations', label: 'Invitations', icon: Mail, roles: ['founder', 'owner', 'co_founder', 'hr_manager', 'admin'], group: 'Team' },
  { to: '/admin/security', label: 'Security', icon: KeyRound, roles: ['founder', 'owner', 'co_founder', 'admin'], group: 'Team' },
  { to: '/admin/founder', label: 'Founder & Ownership', icon: Crown, roles: ['founder'], group: 'Team' },
];

export function AdminLayout() {
  const { user, loading, isStaff, signOut, role, profile, memberProfile, secretVerified } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink-950 text-white/40">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <Navigate to="/crew" replace />;
  if (!secretVerified) return <Navigate to="/admin/login" replace />;

  const items = NAV.filter(n => n.roles.includes(role || 'viewer'));
  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || 'Other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  async function logout() {
    await signOut();
    navigate('/admin/login');
  }

  const displayName = memberProfile?.display_name || memberProfile?.custom_title || profile?.full_name || user.email;
  const roleLabel = memberProfile?.role_definition?.display_name || role?.replace('_', ' ');
  const initials = (displayName || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="flex">
        {/* === Sidebar — compact command center === */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.05] bg-ink-900/40 md:flex">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-4">
            <NavLink to="/admin" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-synf-500 font-display text-base font-bold">S</span>
              <div>
                <div className="font-display text-base font-bold tracking-tightest">SYNF</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Control Room</div>
              </div>
            </NavLink>
          </div>

          {/* Nav — grouped */}
          <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2 scrollbar-hide">
            {Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group}>
                <div className="mb-1.5 px-2 font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">{group}</div>
                <div className="space-y-0.5">
                  {groupItems.map(n => {
                    const Icon = n.icon;
                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        className={({ isActive }) =>
                          `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${isActive ? 'bg-synf-500/12 text-synf-300' : 'text-white/55 hover:bg-white/[0.04] hover:text-white'}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={15} className={isActive ? 'text-synf-400' : 'text-white/40 group-hover:text-white/70'} />
                            {n.label}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User card */}
          <div className="border-t border-white/[0.05] p-3">
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-800 font-display text-xs font-bold text-white/80">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-[13px] font-medium text-white">
                  {memberProfile?.is_founder && <Crown size={11} className="shrink-0 text-gold-400" />}
                  <span className="truncate">{displayName}</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] capitalize text-white/35">{roleLabel}</div>
              </div>
            </div>
            <button onClick={logout} className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-white/50 transition hover:bg-white/[0.04] hover:text-synf-400">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* === Main area === */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.05] bg-ink-950/85 px-5 backdrop-blur-xl md:px-8">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-white/35 transition hover:border-synf-500/30 hover:text-white/60"
            >
              <Sparkles size={14} /> Search
              <kbd className="ml-1 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white/30">⌘K</kbd>
            </button>
            <div className="flex items-center gap-3">
              <NavLink to="/" className="flex items-center gap-1.5 text-sm text-white/35 transition hover:text-synf-400">
                <ExternalLink size={14} /> View site
              </NavLink>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.05] px-4 py-2 scrollbar-hide md:hidden">
            {items.map(n => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${isActive ? 'bg-synf-500/12 text-synf-300' : 'text-white/55'}`
                  }
                >
                  <Icon size={13} /> {n.label}
                </NavLink>
              );
            })}
            <button onClick={logout} className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-white/55">
              <LogOut size={13} />
            </button>
          </nav>

          <main className="p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
