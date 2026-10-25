import { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, RotateCcw, AlertCircle, Activity, Lock, Database, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { loginSecretAction, rolesPermissionsAction } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { SecurityEventRow } from '@/lib/types';

type BackupLog = { id: string; checked_at: string; status: string; details: Record<string, unknown> | null; checked_by: string | null };

export function AdminSecurity() {
  const { isFounder, memberProfile } = useAuth();
  const [secretStatus, setSecretStatus] = useState<{ configured: boolean; version: number; last_rotated: string | null } | null>(null);
  const [events, setEvents] = useState<SecurityEventRow[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [backupLoading, setBackupLoading] = useState(true);
  const [backupRunning, setBackupRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRotate, setShowRotate] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const canView = isFounder || memberProfile?.role_id === 'co_founder' || memberProfile?.role_id === 'admin';

  useEffect(() => {
    if (!canView) return;
    (async () => {
      const sr = await loginSecretAction({ action: 'get_status' });
      if (!sr.error) setSecretStatus(sr as { configured: boolean; version: number; last_rotated: string | null });
      const er = await rolesPermissionsAction({ action: 'get_security_events', limit: 50 });
      if (er.events) setEvents(er.events as SecurityEventRow[]);
      setLoading(false);

      const { data: bk } = await supabase.from('backup_verification_log').select('*').order('checked_at', { ascending: false }).limit(20);
      setBackupLogs((bk as BackupLog[]) || []);
      setBackupLoading(false);
    })();
  }, [canView]);

  function showToast(type: 'ok' | 'err', msg: string) { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }

  if (!canView) return <div className="text-white/50">Admin access required to view security settings.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-white/50">Login secret rotation, session management, and security event logs.</p>
      </div>

      {toast && <div className={`rounded-lg border p-3 text-sm ${toast.type === 'ok' ? 'border-lime-400/30 bg-lime-400/10 text-lime-300' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'}`}>{toast.msg}</div>}

      {/* Login secret status */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-500/15 text-cyan-400"><KeyRound size={20} /></span>
            <div>
              <h2 className="font-display text-lg font-bold">Login Secret Code</h2>
              <p className="text-sm text-white/50">{secretStatus?.configured ? `Version ${secretStatus.version} · Last rotated ${secretStatus.last_rotated ? new Date(secretStatus.last_rotated).toLocaleDateString() : 'never'}` : 'Not configured'}</p>
            </div>
          </div>
          {isFounder && (
            <button onClick={() => setShowRotate(true)} className="btn-primary"><RotateCcw size={16} /> Rotate Secret</button>
          )}
        </div>
        {!secretStatus?.configured && isFounder && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>The login secret is not yet configured. Members cannot access the admin dashboard without it. Rotate the secret to set one.</span>
          </div>
        )}
        <div className="mt-4 space-y-2 text-xs text-ink-500">
          <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-lime-400" /> The secret hash is stored server-side and never sent to the browser.</div>
          <div className="flex items-center gap-2"><Lock size={12} className="text-lime-400" /> Repeated invalid attempts are rate-limited with automatic lockout.</div>
          <div className="flex items-center gap-2"><Activity size={12} className="text-lime-400" /> All secret attempts are logged for security auditing.</div>
        </div>
      </div>

      {/* Security events */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Activity size={16} className="text-cyan-400" /> Security Event Log</h2>
        {loading ? <div className="h-32 animate-pulse rounded-lg bg-ink-900" /> : events.length === 0 ? (
          <p className="text-sm text-ink-500">No security events recorded.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-900/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${e.success ? 'bg-lime-400' : 'bg-cyan-400'}`} />
                  <span className="font-semibold text-white">{e.event_type.replace(/_/g, ' ')}</span>
                  {e.user_id && <span className="text-xs text-ink-500">user: {e.user_id.slice(0, 8)}…</span>}
                </div>
                <span className="text-xs text-ink-500">{new Date(e.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database backup verification */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Database size={16} className="text-cyan-400" /> Backup Verification</h2>
          <button
            onClick={async () => {
              setBackupRunning(true);
              const { data } = await supabase.from('backup_verification_log').select('*').order('checked_at', { ascending: false }).limit(20);
              setBackupLogs((data as BackupLog[]) || []);
              setBackupRunning(false);
              showToast('ok', 'Backup status refreshed');
            }}
            disabled={backupRunning}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-cyan-500/40 hover:text-white"
          >
            <RefreshCw size={12} className={backupRunning ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        {backupLoading ? <div className="h-24 animate-pulse rounded-lg bg-ink-900" /> : backupLogs.length === 0 ? (
          <p className="text-sm text-ink-500">No backup verification checks recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {backupLogs.map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-900/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {b.status === 'ok' ? <CheckCircle2 size={14} className="text-lime-400" /> : <XCircle size={14} className="text-cyan-400" />}
                  <span className="font-semibold capitalize text-white">{b.status}</span>
                  {b.details && typeof b.details === 'object' && 'table_count' in (b.details as Record<string, unknown>) && (
                    <span className="text-xs text-ink-500">{String((b.details as Record<string, unknown>).table_count)} tables verified</span>
                  )}
                  {b.checked_by && <span className="text-xs text-ink-500">by {b.checked_by}</span>}
                </div>
                <span className="text-xs text-ink-500">{new Date(b.checked_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rotate secret modal */}
      {showRotate && isFounder && (
        <RotateSecretModal onClose={() => setShowRotate(false)} onDone={() => { setShowRotate(false); showToast('ok', 'Secret rotated successfully'); }} onError={(msg) => showToast('err', msg)} />
      )}
    </div>
  );
}

function RotateSecretModal({ onClose, onDone, onError }: { onClose: () => void; onDone: () => void; onError: (msg: string) => void }) {
  const [newSecret, setNewSecret] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newSecret.length < 6) { onError('Secret must be at least 6 characters'); return; }
    if (!confirmPassword) { onError('Password confirmation required'); return; }
    setLoading(true);
    const r = await loginSecretAction({ action: 'rotate_secret', new_secret: newSecret, confirm_password: confirmPassword });
    setLoading(false);
    if (r.error) { onError(r.error); return; }
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md space-y-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400/15 text-amber-400"><RotateCcw size={20} /></span>
          <div><h2 className="font-display text-xl font-bold">Rotate Login Secret</h2><p className="text-xs text-white/50">All members will need the new code for their next login.</p></div>
        </div>
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-400">
          <AlertCircle size={14} className="mb-1 inline" /> This is a high-impact action. Active sessions are not immediately terminated, but all members must use the new secret on their next login.
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">New Secret Code (min 6 characters)</label><input className="input text-center text-lg tracking-widest" type="password" value={newSecret} onChange={e => setNewSecret(e.target.value)} autoFocus /></div>
          <div><label className="label">Confirm Your Password</label><input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password to confirm" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Rotating…' : 'Rotate Secret'}</button>
        </form>
      </div>
    </div>
  );
}
