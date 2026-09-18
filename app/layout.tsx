// app/layout.tsx
// 모든 페이지의 공통 레이아웃. PWA 메타, 하단 네비.

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorker } from '@/components/common/ServiceWorker';
import { BottomNav } from '@/components/layout/BottomNav';
import { StoreHydrator } from '@/components/common/StoreHydrator';

export const metadata: Metadata = {
  title: 'Unfollow Lens · 인스타 팔로우 관계 분석',
  description:
    '내 인스타 데이터(JSON)를 업로드하면 브라우저 내부에서만 분석합니다. 서버 저장 없음, 광고 없음, 100% 무료.',
  applicationName: 'Unfollow Lens',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Unfollow Lens',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F7F8FA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">
          본문으로 건너뛰기
        </a>
        <StoreHydrator />
        <ServiceWorker />
        <main id="main-content" className="with-bottom-nav relative">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
