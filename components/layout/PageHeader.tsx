// components/layout/PageHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, right, className }: Props) {
  const router = useRouter();
  return (
    <header
      className={cn(
        'sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-slate-200',
        className,
      )}
    >
      <div className="mx-auto max-w-md px-5 py-4 flex items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            className="-ml-2 grid place-items-center w-10 h-10 rounded-full hover:bg-slate-100 active:scale-95 transition"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[13px] text-slate-600 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
