import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Instagram, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PersonRow, EventRow } from '@/lib/types';
import { Reveal } from '@/components/Reveal';
import { EventCard } from '@/components/EventCard';
import { useSeo, personJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { EmptyState } from '@/components/EmptyState';
import { Users } from 'lucide-react';

export function PersonProfile() {
  const { slug } = useParams();
  const [person, setPerson] = useState<PersonRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('people').select('*').eq('slug', slug).eq('status', 'approved').maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      const p = data as PersonRow;
      setPerson(p);

      if (p.related_event_ids && p.related_event_ids.length > 0) {
        const { data: evData } = await supabase
          .from('events')
          .select('*')
          .in('id', p.related_event_ids)
          .eq('is_published', true)
          .order('start_at', { ascending: false });
        setEvents((evData as EventRow[]) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  useSeo({
    title: person ? `${person.name} — Team Synf` : 'Person — Team Synf',
    description: person?.bio || `Meet ${person?.name}, part of the Team Synf collective.`,
    path: `/people/${slug}`,
    image: person?.portrait_url || undefined,
    type: 'profile',
    keywords: person ? [person.name, 'Team Synf', person.role || '', 'Hyderabad collective'] : [],
    jsonLd: person ? [
      personJsonLd(person),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'People', path: '/people' },
        { name: person.name, path: `/people/${person.slug}` },
      ]),
    ] : [],
  });

  if (loading) return <div className="container-synf py-32"><div className="h-96 animate-pulse rounded-3xl bg-ink-900" /></div>;
  if (notFound || !person) return (
    <div className="container-synf py-32">
      <EmptyState
        icon={<Users size={32} className="text-ink-500" />}
        title="Profile not found"
        message="This person may not be listed yet or their profile isn't published."
        cta={{ label: 'Back to the collective', to: '/people' }}
      />
    </div>
  );

  return (
    <article className="bg-ink-950">
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-violet-500/15 to-transparent" />
          <div className="absolute bottom-0 right-0 h-2/3 w-1/2 bg-gradient-to-tl from-synf-600/10 to-transparent" />
        </div>
        <div className="container-synf relative">
          <Link to="/people" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-synf-400"><ArrowLeft size={14} /> The collective</Link>
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            {person.portrait_url ? (
              <Reveal direction="scale">
                <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10">
                  <img src={person.portrait_url} alt={person.portrait_alt || person.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </Reveal>
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-950">
                <span className="font-display text-[6rem] font-extrabold text-white/10">{person.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex flex-col justify-center">
              <Reveal className="section-eyebrow"><Users size={14} /> {person.role || 'The collective'}</Reveal>
              <Reveal delay={80}><h1 className="display-xl text-[clamp(2.5rem,8vw,6rem)]">{person.name}</h1></Reveal>
              {person.bio && <Reveal delay={150}><p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 whitespace-pre-wrap">{person.bio}</p></Reveal>}
              <Reveal delay={250}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {person.instagram_url && (
                    <a href={person.instagram_url} target="_blank" rel="noopener noreferrer" className="btn-ghost group"><Instagram size={16} /> Instagram <ArrowLeft size={12} className="rotate-180 transition-transform group-hover:translate-x-1" /></a>
                  )}
                  <Link to="/people" className="btn-primary group">All people <ArrowLeft size={14} className="rotate-180 transition-transform group-hover:-translate-x-1" /></Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="container-synf pb-24">
          <Reveal className="section-eyebrow"><Calendar size={14} /> Credited events</Reveal>
          <Reveal><h2 className="mb-8 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Events with {person.name.split(' ')[0]}</h2></Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard event={e} /></Reveal>)}
          </div>
        </section>
      )}
    </article>
  );
}
