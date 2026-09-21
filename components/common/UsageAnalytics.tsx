'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { removeAnalyticsUrlDetails, trackSafeEvent } from '@/lib/analytics';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function UsageAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/guide') trackSafeEvent('download_guide_viewed');
  }, [pathname]);

  useEffect(() => {
    if (isStandalone()) trackSafeEvent('home_screen_launch');
  }, []);

  return <Analytics beforeSend={removeAnalyticsUrlDetails} debug={false} />;
}
