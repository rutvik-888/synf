import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface CountdownProps {
  target: string;
  className?: string;
}

export function LiveCountdown({ target, className = '' }: CountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetMs = new Date(target).getTime();
  const diff = targetMs - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const isUrgent = days < 1;

  const units = [['Days', days], ['Hrs', hours], ['Mins', mins], ['Secs', secs]] as const;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Flame size={16} className={isUrgent ? 'animate-pulse text-synf-400' : 'text-synf-400'} />
      <div className="flex items-center gap-2">
        {units.map(([label, val]) => (
          <div key={label} className="text-center">
            <span className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {String(val).padStart(2, '0')}
            </span>
            <span className="ml-1 text-[10px] uppercase tracking-widest text-white/40">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
