import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Send, Megaphone, Trash2, Loader2, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface ChatMessage {
  id: string;
  author_id: string | null;
  body: string;
  is_announcement: boolean;
  created_at: string;
  author_name?: string;
}

export function CrewChat() {
  const { user, memberProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const canAnnounce = memberProfile?.is_founder;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('crew_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setMessages((data as ChatMessage[]) || []);
      setLoading(false);
    })();

    const channel = supabase
      .channel('crew_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crew_chat_messages' },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages(prev => [msg, ...prev].slice(0, 100));
        })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'crew_chat_messages' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setSending(true);
    const { data } = await supabase
      .from('crew_chat_messages')
      .insert({ author_id: user.id, body: body.trim(), is_announcement: isAnnouncement })
      .select('*')
      .single();
    if (data) {
      setMessages(prev => [data as ChatMessage, ...prev].slice(0, 100));
      setBody('');
      setIsAnnouncement(false);
    }
    setSending(false);
  }

  async function deleteMsg(id: string) {
    await supabase.from('crew_chat_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/40" /></div>;

  const visibleMessages = searchQuery
    ? messages.filter(m => m.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="card flex flex-col" style={{ height: '32rem' }}>
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
        <h2 className="font-display text-sm font-bold">Crew Chat</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-28 rounded-lg border border-white/[0.08] bg-ink-void/50 py-1 pl-7 pr-2 text-xs text-white placeholder:text-white/30 focus:w-36 focus:border-cyan-500/40 focus:outline-none transition-all"
            />
          </div>
          <span className="flex items-center gap-1.5 text-xs text-lime-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" /> Live
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide">
        {visibleMessages.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">{searchQuery ? 'No messages match your search.' : 'No messages yet. Start the conversation.'}</p>
        )}
        {visibleMessages.map(m => (
          <div key={m.id} className={`group rounded-lg p-3 ${m.is_announcement ? 'border border-cyan-500/30 bg-cyan-500/10' : 'bg-white/[0.03]'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {m.is_announcement && <Megaphone size={12} className="text-cyan-400" />}
                <span className="text-xs font-semibold text-white/70">{m.author_id === user?.id ? 'You' : 'Crew member'}</span>
                <span className="text-[10px] text-white/30">{formatDate(m.created_at, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              {m.author_id === user?.id && (
                <button onClick={() => deleteMsg(m.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 size={12} className="text-white/30 hover:text-cyan-400" />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-white/80">{m.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="border-t border-white/[0.08] p-3">
        <div className="flex gap-2">
          <input
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Type a message…"
            className="input flex-1"
            maxLength={500}
          />
          {canAnnounce && (
            <button
              type="button"
              onClick={() => setIsAnnouncement(v => !v)}
              className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${isAnnouncement ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-400' : 'border-white/[0.08] text-white/40 hover:text-white'}`}
              title="Toggle announcement"
            >
              <Megaphone size={14} />
            </button>
          )}
          <button type="submit" disabled={sending || !body.trim()} className="btn-primary h-9 px-4">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
}
