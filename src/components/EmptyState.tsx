import { type ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  cta?: { label: string; to?: string; href?: string; onClick?: () => void };
}

export function EmptyState({ icon, title, message, cta }: EmptyStateProps) {
  return (
    <div className="py-24 text-center">
      <Reveal>
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-white/[0.08] bg-ink-900/60">
          {icon}
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-white/50">{message}</p>
        {cta && (
          cta.href ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-6 inline-flex">{cta.label}</a>
          ) : cta.to ? (
            <a href={cta.to} className="btn-primary mt-6 inline-flex">{cta.label}</a>
          ) : cta.onClick ? (
            <button onClick={cta.onClick} className="btn-primary mt-6 inline-flex">{cta.label}</button>
          ) : null
        )}
      </Reveal>
    </div>
  );
}
