// components/ui/EmptyState.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
  icon: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon, title, description, ctaLabel, ctaHref }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8 text-center"
    >
      <div className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-2xl bg-ig-soft border border-white/10 text-ig-pink">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{description}</p>}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="inline-block mt-5 rounded-xl bg-ig-gradient px-5 py-3">
          {ctaLabel}
        </Link>
      )}
    </motion.div>
  );
}
