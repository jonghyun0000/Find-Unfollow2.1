// components/ui/GradientButton.tsx
'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Variant = 'gradient' | 'ghost' | 'outline';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-11 px-5 text-[15px] rounded-2xl',
  lg: 'h-14 px-7 text-base rounded-2xl',
};

const variants: Record<Variant, string> = {
  gradient:
    'bg-brand text-white font-semibold shadow-glow hover:brightness-110 active:brightness-95',
  ghost: 'bg-slate-100 hover:bg-slate-100 text-slate-600 backdrop-blur-md border border-slate-200',
  outline: 'ig-border text-slate-900 hover:bg-slate-100',
};

export const GradientButton = forwardRef<HTMLButtonElement, Props>(function GradientButton(
  { variant = 'gradient', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-brand animate-spin" />
      )}
      {children}
    </motion.button>
  );
});
