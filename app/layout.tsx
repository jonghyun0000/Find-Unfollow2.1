// app/layout.tsx
// 모든 페이지의 공통 레이아웃. PWA 메타, 하단 네비.
// (다크 전용 앱이라 테마 토글 없음)

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { StoreHydrator } from '@/components/common/StoreHydrator';

export const metadata: Metadata = {
  title: 'Unfollow Lens · 인스타 언팔러 분석',
  description:
    '내 인스타 데이터(JSON)를 업로드하면 브라우저 내부에서만 분석합니다. 서버 저장 없음, 광고 없음, 100% 무료.',
  applicationName: 'Unfollow Lens',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Unfollow Lens',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#08070D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-mesh-dark bg-fixed antialiased">
        <StoreHydrator />
        <main className="with-bottom-nav relative">{children}</main>
        <BottomNav />

        {/* 서비스 워커 등록 (PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
