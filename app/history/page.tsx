'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { ResultEmpty } from '@/components/analysis/ResultEmpty';
export default function HistoryPage() {
  const router = useRouter();
  const { history, hydrated, removeFromHistory, loadFromHistory } = useAnalysisStore();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!hydrated || !history.length)
    return (
      <>
        <PageHeader title="분석 기록" back />
        <ResultEmpty hydrated={hydrated} />
      </>
    );
  return (
    <>
      <PageHeader title="분석 기록" subtitle="계정별 최대 10개 · 이 기기에만 저장" back />
      <div className="mx-auto max-w-md px-5 py-6 space-y-3">
        {history.map((h) => (
          <article key={h.id} className="glass rounded-2xl p-5">
            <h2 className="font-semibold break-all">
              {h.account ? '@' + h.account : '이전 버전 기록 (비교 제외)'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">데이터 기준일 {h.snapshotDate}</p>
            <p className="mt-1 text-xs text-slate-600">
              팔로워 {h.followers.length.toLocaleString()} · 팔로잉{' '}
              {h.following.length.toLocaleString()}
            </p>
            <div className="mt-3 flex gap-3">
              <button
                className="rounded-xl bg-slate-100 px-4 py-3 text-sm"
                onClick={() => {
                  loadFromHistory(h.id);
                  router.push('/dashboard');
                }}
              >
                기록 열기
              </button>
              <button
                disabled={pending}
                className="rounded-xl border border-rose-400/30 px-4 py-3 text-sm text-rose-700"
                onClick={() => setConfirm(h.id)}
              >
                삭제
              </button>
            </div>
            {confirm === h.id && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-sm text-slate-600">이 기록을 삭제할까요? 복구할 수 없습니다.</p>
                <div className="flex gap-3 mt-2">
                  <button
                    disabled={pending}
                    className="rounded-xl bg-rose-700 text-white px-4 py-3 text-sm"
                    onClick={async () => {
                      setPending(true);
                      await removeFromHistory(h.id);
                      setPending(false);
                      setConfirm(null);
                    }}
                  >
                    삭제 확인
                  </button>
                  <button
                    disabled={pending}
                    className="p-3 text-sm"
                    onClick={() => setConfirm(null)}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
