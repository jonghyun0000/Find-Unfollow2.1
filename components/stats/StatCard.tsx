// components/stats/StatCard.tsx
'use client';

import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: number | string;
  delta?: number; // 양수=증가 음수=감소
  icon?: React.ReactNode;
  accent?: 'pink' | 'purple' | 'amber' | 'emerald' | 'rose';
  className?: string;
}

const accents = {
  pink: 'text-brand',
  purple: 'text-slate-900',
  amber: 'text-slate-900',
  emerald: 'text-slate-900',
  rose: 'text-brand',
};

export function StatCard({ label, value, delta, icon, accent = 'pink', className }: Props) {
  const deltaText =
    typeof delta === 'number' ? (delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0') : null;

  return (
    <div className={cn('relative glass rounded-3xl p-5 overflow-hidden', className)}>
      <div className="relative">
        {icon && (
          <div className="mb-4 grid size-9 place-items-center rounded-xl border border-white bg-white/70 text-slate-600">
            {icon}
          </div>
        )}
        <div>
          <p className="text-[12.5px] uppercase tracking-wider text-slate-600 font-medium">
            {label}
          </p>
          <p
            className={cn(
              'mt-2 text-4xl font-semibold tracking-tight tabular-nums',
              accents[accent],
            )}
          >
            {value}
          </p>
          {deltaText !== null && (
            <p
              className={cn(
                'mt-1 text-xs font-semibold',
                (delta ?? 0) > 0
                  ? 'text-emerald-700'
                  : (delta ?? 0) < 0
                    ? 'text-rose-700'
                    : 'text-slate-600',
              )}
            >
              {deltaText} 지난 분석 대비
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
