import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

export function CopyButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy', 'error');
    }
  }

  return (
    <button onClick={copy} className={`inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition-all hover:border-cyan-500/40 hover:text-white ${className || ''}`}>
      {copied ? <><Check size={12} className="text-lime-400" /> Copied</> : <><Copy size={12} /> {label || 'Copy'}</>}
    </button>
  );
}
