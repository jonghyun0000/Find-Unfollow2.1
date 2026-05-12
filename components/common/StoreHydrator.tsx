// components/common/StoreHydrator.tsx
'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';

/**
 * 앱 부팅 시 localStorage 의 분석 기록을 zustand 메모리로 한 번만 끌어올린다.
 */
export function StoreHydrator() {
  const hydrate = useAnalysisStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}
