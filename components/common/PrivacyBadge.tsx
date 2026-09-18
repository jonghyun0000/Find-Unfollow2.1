// components/common/PrivacyBadge.tsx
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export function PrivacyBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium',
        className,
      )}
    >
      <ShieldCheck size={14} />
      <span>파일은 서버로 전송되지 않습니다</span>
    </div>
  );
}
