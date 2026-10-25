export function BrandedLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-synf-500/20 border-t-synf-500" />
        <div className="absolute inset-1.5 animate-pulse rounded-full bg-synf-500/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-sm font-bold text-synf-500">S</span>
        </div>
      </div>
      {label && <p className="text-xs uppercase tracking-widest text-white/30">{label}</p>}
    </div>
  );
}
