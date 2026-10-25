import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Inbox, UserSquare, Users, FileText, LogOut, Sparkles, Briefcase, Mail, Shield, Crown, Network, KeyRound, Settings, Camera, ShoppingBag, Megaphone, Palette, LayoutGrid, Store, ExternalLink, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState, useMemo, useEffect } from 'react';
import { CommandMenu } from '@/components/CommandMenu';
import { SynfMark } from '@/components/SynfMark';

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

function pageTitle(path: string): { title: string; breadcrumb: string } {
  const match = NAV.find(n => n.end ? n.to === path : path.startsWith(n.to) && n.to !== '/admin');
  if (match) return { title: match.label, breadcrumb: match.group || 'Overview' };
  if (path === '/admin') return { title: 'Control Room', breadcrumb: 'Overview' };
  return { title: 'Control Room', breadcrumb: 'Overview' };
}

export function AdminLayout() {
  const { user, loading, isStaff, signOut, role, profile, memberProfile, secretVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { title, breadcrumb } = useMemo(() => pageTitle(location.pathname), [location.pathname]);

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink-void text-white/40">Loading…</div>;
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
    <div className="min-h-screen bg-ink-void text-white">
      {/* Ambient atmosphere — subtle, almost invisible */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 top-0 h-[40rem] w-[40rem] rounded-full bg-cyan-500/[0.03] blur-[160px]" />
        <div className="absolute -right-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-ultraviolet-600/[0.03] blur-[160px]" />
      </div>

      <div className="relative z-10 flex">
        {/* === Navigation rail — compact command center === */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-obsidian/60 backdrop-blur-sm md:flex">
          {/* Brand identity */}
          <div className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-4">
            <NavLink to="/admin" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white">
                <SynfMark className="h-9 w-9 object-cover" />
              </span>
              <div>
                <div className="font-display text-base font-bold tracking-tightest">SYNF</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400/60">Control Room</div>
              </div>
            </NavLink>
          </div>

          {/* Nav — grouped with signal markers */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-hide">
            {Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group}>
                <div className="mb-2 flex items-center gap-2 px-2">
                  <span className="h-px w-4 bg-white/10" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">{group}</span>
                </div>
                <div className="space-y-0.5">
                  {groupItems.map(n => {
                    const Icon = n.icon;
                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${isActive ? 'bg-cyan-500/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.04] hover:text-white/85'}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-cyan-400" />
                            )}
                            <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-white/35 group-hover:text-white/65'} />
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

          {/* User identity card */}
          <div className="border-t border-white/[0.04] p-3">
            <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-gunmetal font-display text-xs font-bold text-white/85">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-[13px] font-medium text-white">
                  {memberProfile?.is_founder && <Crown size={11} className="shrink-0 text-amber-400" />}
                  <span className="truncate">{displayName}</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] capitalize text-white/35">{roleLabel}</div>
              </div>
            </div>
            <button onClick={logout} className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-white/45 transition hover:bg-white/[0.04] hover:text-cyan-400">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* === Main area === */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Global command header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-ink-void/85 px-5 backdrop-blur-xl md:px-8">
            {/* Section breadcrumb + title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(v => !v)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] text-white/50 transition hover:border-cyan-400/30 hover:text-white md:hidden"
                aria-label="Toggle navigation"
              >
                <span className="flex flex-col gap-1">
                  <span className="block h-0.5 w-4 bg-current" />
                  <span className="block h-0.5 w-4 bg-current" />
                  <span className="block h-0.5 w-4 bg-current" />
                </span>
              </button>
              <div className="hidden md:block">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">{breadcrumb}</div>
                <div className="font-display text-lg font-semibold tracking-tight text-white">{title}</div>
              </div>
              <div className="md:hidden">
                <div className="font-display text-base font-semibold tracking-tight text-white">{title}</div>
              </div>
            </div>

            {/* Right cluster — command actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-white/35 transition hover:border-cyan-400/30 hover:text-white/65"
              >
                <Sparkles size={14} /> <span className="hidden sm:inline">Search</span>
                <kbd className="ml-1 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white/30">⌘K</kbd>
              </button>
              <NavLink to="/" className="flex items-center gap-1.5 text-sm text-white/35 transition hover:text-cyan-400">
                <ExternalLink size={14} /> <span className="hidden sm:inline">View site</span>
              </NavLink>
            </div>
          </header>

          {/* Mobile nav drawer */}
          {mobileNavOpen && (
            <div className="md:hidden">
              <nav className="flex flex-col gap-1 border-b border-white/[0.06] bg-ink-obsidian/80 px-3 py-3 backdrop-blur-xl max-h-[70vh] overflow-y-auto">
                {Object.entries(grouped).map(([group, groupItems]) => (
                  <div key={group}>
                    <div className="mb-1 mt-2 px-2 font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">{group}</div>
                    {groupItems.map(n => {
                      const Icon = n.icon;
                      return (
                        <NavLink
                          key={n.to}
                          to={n.to}
                          end={n.end}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium ${isActive ? 'bg-cyan-500/[0.08] text-white' : 'text-white/50'}`
                          }
                        >
                          <Icon size={15} className={location.pathname === n.to ? 'text-cyan-400' : 'text-white/35'} />
                          {n.label}
                          <ChevronRight size={13} className="ml-auto text-white/15" />
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
                <button onClick={logout} className="mt-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-white/45">
                  <LogOut size={15} /> Sign out
                </button>
              </nav>
            </div>
          )}

          {/* Central workspace */}
          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
