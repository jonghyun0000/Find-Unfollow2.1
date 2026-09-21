// components/ui/GradientButton.tsx
'use client';

import { forwardRef } from 'react';

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
  gradient: 'primary-action font-semibold',
  ghost: 'glass-control text-slate-600',
  outline: 'glass-control text-slate-900',
};

export const GradientButton = forwardRef<HTMLButtonElement, Props>(function GradientButton(
  { variant = 'gradient', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-brand animate-spin" />
      )}
      {children}
    </button>
  );
});
