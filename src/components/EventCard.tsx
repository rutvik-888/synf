import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import type { EventRow } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { TiltCard } from '@/components/TiltCard';

const STATUS_STYLES: Record<string, string> = {
  announced: 'bg-synf-500/15 text-synf-300 border-synf-500/30',
  upcoming: 'bg-acid-400/15 text-acid-400 border-acid-400/30',
  completed: 'bg-white/[0.03] text-white/40 border-white/[0.08]',
  postponed: 'bg-gold-400/15 text-gold-400 border-gold-400/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  sold_out: 'bg-electric-500/15 text-electric-300 border-electric-500/30',
  draft: 'bg-white/[0.03] text-white/35 border-white/[0.08]',
};

export function EventCard({ event }: { event: EventRow }) {
  const past = event.status === 'completed';
  return (
    <TiltCard className="h-full" maxTilt={5}>
      <Link
        to={`/events/${event.slug}`}
        className="group relative block h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 transition-all duration-500 hover:border-synf-500/30 hover:shadow-synf"
        data-cursor="hover"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.cover_image_alt || event.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-synf-600/40 via-ink-900 to-ink-950">
              <span className="font-display text-7xl font-bold tracking-tightest text-white/8">{event.title.charAt(0)}</span>
            </div>
          )}
          {/* Gradient overlay — stronger at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/15 to-transparent transition-opacity duration-500 group-hover:from-ink-950" />
          {/* Synf sheen on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(120deg, transparent 35%, rgba(255,45,111,0.15) 50%, transparent 65%)', mixBlendMode: 'screen' }} />

          {/* Date stamp — editorial */}
          {event.start_at && (
            <div className="absolute right-3 top-3 flex flex-col items-center rounded-lg border border-white/15 bg-ink-950/70 px-2 py-1.5 text-center backdrop-blur-sm">
              <span className="font-mono text-[8px] uppercase tracking-widest text-synf-400">{new Date(event.start_at).toLocaleDateString('en-GB', { month: 'short' })}</span>
              <span className="font-display text-lg font-bold leading-none text-white">{new Date(event.start_at).getDate()}</span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            <span className={`chip border backdrop-blur-sm ${STATUS_STYLES[event.status] || STATUS_STYLES.draft}`}>
              {event.status.replace('_', ' ')}
            </span>
            {event.featured && <span className="chip border border-acid-400/30 bg-acid-400/15 text-acid-400 backdrop-blur-sm">Featured</span>}
          </div>

          <div className="absolute right-4 bottom-4 grid h-9 w-9 place-items-center rounded-full bg-synf-500 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1">{event.title}</h3>
          {event.subtitle && <p className="mt-1 text-sm text-white/50">{event.subtitle}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
            {event.start_at && (
              <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(event.start_at)}</span>
            )}
            {event.venue_city && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {event.venue_city}</span>
            )}
            {past && <span className="text-white/30">Past event</span>}
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
