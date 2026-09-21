// components/layout/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, BarChart3, Users2, Settings } from 'lucide-react';

import { cn } from '@/lib/cn';

const items = [
  { href: '/', label: '홈', icon: Home },
  { href: '/upload', label: '업로드', icon: Upload },
  { href: '/dashboard', label: '분석 결과', icon: BarChart3 },
  { href: '/changes', label: '변화 비교', icon: Users2 },
  { href: '/settings', label: '설정', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="모바일 하단 네비게이션"
      className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div className="glass-strong mx-auto max-w-md rounded-[28px] px-2 py-2">
        <ul className="grid grid-cols-5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 rounded-2xl text-xs font-medium transition-colors',
                    active ? 'text-brand' : 'text-slate-600 hover:text-slate-600',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <span className="absolute inset-1 rounded-2xl bg-brand-soft border border-white shadow-sm" />
                  )}
                  <Icon size={20} className="relative z-10" strokeWidth={active ? 2.4 : 2} />
                  <span className="relative z-10">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
