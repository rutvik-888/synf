import { SynfSignal } from '@/components/SynfSignal';

type Props = { label?: string; size?: 'sm' | 'md' | 'lg' };

const SIZE_MAP = {
  sm: { box: 'h-8 w-8', label: 'text-[9px]' },
  md: { box: 'h-16 w-16', label: 'text-xs' },
  lg: { box: 'h-24 w-24', label: 'text-sm' },
};

/**
 * OMEGA BLACK loader — the SYNF Signal artifact as a compact loading motif.
 * The signal slowly rotates with a restrained light pulse, evoking an
 * advanced physical object responding to energy rather than a spinning icon.
 */
export function BrandedLoader({ label, size = 'md' }: Props) {
  const s = SIZE_MAP[size];
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/8 blur-xl" />
        <div className={`${s.box} relative`}>
          <SynfSignal glow="subtle" animate={true} className="h-full w-full" />
        </div>
      </div>
      {label && (
        <p className={`font-mono ${s.label} uppercase tracking-[0.3em] text-white/30`}>{label}</p>
      )}
    </div>
  );
}
