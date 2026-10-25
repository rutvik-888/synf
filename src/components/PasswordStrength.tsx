import { useEffect, useRef, useState } from 'react';

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-coral-500', 'bg-coral-400', 'bg-gold-400', 'bg-lime-400', 'bg-lime-300'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const [mounted, setMounted] = useState(false);
  const prevScore = useRef(0);

  useEffect(() => {
    setMounted(true);
    prevScore.current = score;
  }, [score]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ease-out ${i < score ? colors[score] : 'bg-white/[0.06]'} ${mounted && i < score ? 'shadow-[0_0_8px_currentColor]' : ''}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs transition-colors duration-300 ${score >= 3 ? 'text-lime-400' : score >= 2 ? 'text-gold-400' : 'text-coral-400'}`}>{labels[score]}</span>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c, i) => (
            <span
              key={c.label}
              className={`text-[10px] transition-all duration-300 ${c.pass ? 'text-lime-400' : 'text-white/30'}`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
