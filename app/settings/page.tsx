'use client';
import { InstallGuide } from '@/components/common/InstallGuide';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAnalysisStore } from '@/store/useAnalysisStore';
export default function SettingsPage() {
  const { resetAll, history } = useAnalysisStore();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <>
      <PageHeader title="설정" />
      <div className="mx-auto max-w-md px-5 py-6 space-y-4">
        <InstallGuide />
        {[
          ['/history', `분석 기록 · ${history.length}개`],
          ['/guide', '데이터 다운로드 방법'],
          ['/privacy', '데이터 처리 안내'],
        ].map(([href, label]) => (
          <Link key={href} className="block glass rounded-2xl p-5 font-semibold" href={href}>
            {label} →
          </Link>
        ))}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-semibold">모든 분석 기록 삭제</h2>
          <p className="mt-2 text-sm text-slate-600">
            이 기기에 저장된 모든 계정의 기록과 현재 분석 결과를 삭제합니다. 다운로드한 CSV는 직접
            삭제해주세요.
          </p>
          {confirming ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-rose-700">삭제한 기록은 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  disabled={pending}
                  className="rounded-xl bg-rose-700 text-white px-4 py-3 font-semibold disabled:opacity-50"
                  onClick={async () => {
                    setPending(true);
                    await resetAll();
                    setMessage(
                      useAnalysisStore.getState().warning ? '' : '모든 분석 기록을 삭제했습니다.',
                    );
                    setPending(false);
                    setConfirming(false);
                  }}
                >
                  모든 기록 삭제 확인
                </button>
                <button
                  disabled={pending}
                  className="rounded-xl bg-slate-100 px-4 py-3"
                  onClick={() => setConfirming(false)}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              className="mt-4 rounded-xl border border-rose-400/40 px-4 py-3 text-sm text-rose-700"
              onClick={() => {
                setConfirming(true);
                setMessage('');
              }}
            >
              모든 기록 삭제
            </button>
          )}
          {message && (
            <p role="status" className="mt-3 text-sm text-emerald-700">
              {message}
            </p>
          )}
        </section>
        <p className="pt-4 text-center text-xs text-slate-600">
          Unfollow Lens 2.2 · 브라우저 안에서 분석합니다.
        </p>
      </div>
    </>
  );
}
