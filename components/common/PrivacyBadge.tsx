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
      <span>내 데이터는 저장되지 않습니다 · 100% 브라우저 처리</span>
    </div>
  );
}
