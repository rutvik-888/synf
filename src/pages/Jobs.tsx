import { useEffect, useState } from 'react';
import { Briefcase, ArrowRight, Calendar, Sparkles, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { JobPostingRow } from '@/lib/types';
import { JOB_ARRANGEMENT_LABELS } from '@/lib/types';
import { Reveal } from '@/components/Reveal';
import { formatDate } from '@/lib/format';
import { useSeo, collectionPageJsonLd } from '@/lib/seo';
import { jobPostingJsonLd } from '@/lib/seo';

export function Jobs() {
  const [jobs, setJobs] = useState<JobPostingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'published')
        .lte('application_open', today)
        .order('created_at', { ascending: false });
      // Filter out closed deadlines client-side
      const open = ((data as JobPostingRow[]) || []).filter(j => !j.application_close || j.application_close >= today);
      setJobs(open);
      setLoading(false);
    })();
  }, []);

  useSeo({
    title: 'Join Team Synf — Open Roles & Student Jobs in Hyderabad',
    description: `Browse ${jobs.length} open roles at Team Synf. Students and creatives who want to help build nights that matter — DJs, photographers, designers, promoters and more in Hyderabad.`,
    path: '/jobs',
    keywords: ['Team Synf jobs', 'student jobs Hyderabad', 'DJ jobs Hyderabad', 'event jobs India', 'creative jobs Hyderabad', 'part time student jobs', 'event photographer jobs', 'party promoter jobs'],
    jsonLd: [
      collectionPageJsonLd('Open Roles at Team Synf', '/jobs', jobs.length),
      ...jobs.slice(0, 10).map(j => jobPostingJsonLd({ ...j, posted_at: j.created_at })),
    ],
  });

  return (
    <div className="bg-ink-void">
      <section className="relative overflow-hidden bg-ink-obsidian py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-void via-ink-obsidian to-ink-graphite" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ultraviolet-600/8 via-transparent to-cyan-500/6" />
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-ultraviolet-600/10 blur-[140px] animate-drift" />
        <div className="absolute -right-40 bottom-0 h-[25rem] w-[25rem] rounded-full bg-lime-400/6 blur-[120px] animate-drift" style={{ animationDelay: '5s' }} />
        <div className="container-synf relative">
          <Reveal className="index-marker text-cyan-400"><Sparkles size={14} /> Join the team</Reveal>
          <Reveal><h1 className="display-dimensional text-signal text-balance">Open <span className="bg-gradient-to-r from-cyan-400 via-ultraviolet-400 to-laser-500 bg-clip-text text-transparent">roles.</span></h1></Reveal>
          <Reveal delay={150}><p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">Students and creatives who want to help build nights that matter. Browse open positions and apply directly.</p></Reveal>
          {!loading && <Reveal delay={250} className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-white/35"><span className="text-lime-400">{jobs.length} open roles</span><span className="text-white/20">/</span><span>Build the next night</span></Reveal>}
        </div>
      </section>

      <section className="container-synf pb-24">
        <div className="mb-8 grid gap-4 border-y border-white/[0.06] py-5 sm:grid-cols-3">
          {['Real responsibility', 'Flexible around college', 'Built with a crew'].map((item, i) => <div key={item} className="flex items-center gap-3 text-sm text-white/60"><span className="font-mono text-xs text-cyan-400">0{i + 1}</span>{item}</div>)}
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-900" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-ink-500" />
            <h2 className="mt-4 font-display text-2xl font-bold">No open positions right now</h2>
            <p className="mt-2 text-white/60">Follow <a href="https://www.instagram.com/team.synf/" target="_blank" rel="noopener noreferrer" className="text-ultraviolet-400 underline">@team.synf</a> on Instagram for new openings, or <Link to="/collaborate" className="text-ultraviolet-400 underline">send a collaboration enquiry</Link>.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j, i) => {
              const daysSincePosted = j.created_at ? Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000) : 999;
              const isNew = daysSincePosted <= 7;
              return (
              <Reveal key={j.id} delay={i * 80} direction="scale">
                <Link to={`/jobs/${j.slug}`} className="group card block p-6 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(84,233,255,0.4)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-ultraviolet-500/25 bg-ultraviolet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-ultraviolet-300">{j.department}</span>
                    {isNew ? (
                      <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-400"><Flame size={10} /> New</span>
                    ) : (
                      <span className="text-right text-[10px] uppercase tracking-widest text-white/30">{JOB_ARRANGEMENT_LABELS[j.arrangement]}</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-white group-hover:text-ultraviolet-400">{j.title}</h3>
                  {j.description && <p className="mt-2 line-clamp-3 text-sm text-white/60">{j.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/30">
                    {j.num_openings && <span>{j.num_openings} opening{j.num_openings > 1 ? 's' : ''}</span>}
                    {j.application_close && <span className="flex items-center gap-1"><Calendar size={12} /> Closes {formatDate(j.application_close)}</span>}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ultraviolet-400">Apply now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
                </Link>
              </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
