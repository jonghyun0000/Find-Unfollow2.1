'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAnalysisStore } from '@/store/useAnalysisStore';
export function StoreHydrator() {
  const hydrate = useAnalysisStore((s) => s.hydrate);
  const warning = useAnalysisStore((s) => s.warning);
  const sample = useAnalysisStore((s) => s.current?.isSample);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <div className="mx-auto max-w-md px-5">
      {warning && (
        <p
          role="alert"
          className="my-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100"
        >
          {warning}
        </p>
      )}
      {sample && (
        <p role="status" className="my-3 rounded-xl bg-purple-500/15 p-3 text-sm">
          샘플 데이터 체험 중 · 저장하거나 실제 기록과 비교하지 않습니다.{' '}
          <Link href="/upload" className="underline">
            내 데이터 분석
          </Link>
        </p>
      )}
    </div>
  );
}
