// components/stats/StatCard.tsx
'use client';

import { motion } from 'framer-motion';
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
  pink: 'from-ig-pink/30 to-transparent text-ig-pink',
  purple: 'from-accent-purple/30 to-transparent text-accent-purple',
  amber: 'from-amber-500/25 to-transparent text-amber-300',
  emerald: 'from-emerald-500/25 to-transparent text-emerald-300',
  rose: 'from-rose-500/25 to-transparent text-rose-300',
};

export function StatCard({ label, value, delta, icon, accent = 'pink', className }: Props) {
  const deltaText =
    typeof delta === 'number' ? (delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative glass rounded-3xl p-5 overflow-hidden', className)}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br pointer-events-none opacity-50',
          accents[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12.5px] uppercase tracking-wider text-white/55 font-medium">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {deltaText !== null && (
            <p
              className={cn(
                'mt-1 text-xs font-semibold',
                (delta ?? 0) > 0
                  ? 'text-emerald-300'
                  : (delta ?? 0) < 0
                    ? 'text-rose-300'
                    : 'text-white/50',
              )}
            >
              {deltaText} 지난 분석 대비
            </p>
          )}
        </div>
        {icon && <div className="text-white/70">{icon}</div>}
      </div>
    </motion.div>
  );
}
