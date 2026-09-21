'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { DropZone } from '@/components/upload/DropZone';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import { validateFileSelection, parseFollowers, parseFollowing } from '@/lib/parser';
import { analyze } from '@/lib/analyzer';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { SAMPLE_FOLLOWERS_JSON, SAMPLE_FOLLOWING_JSON } from '@/lib/sample-data';
import type { AnalysisResult } from '@/types';
import { trackSafeEvent } from '@/lib/analytics';
import { accountLabel } from '@/lib/account-label';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export default function UploadPage() {
  const router = useRouter();
  const setCurrent = useAnalysisStore((s) => s.setCurrent);
  const history = useAnalysisStore((s) => s.history);
  const savedAccounts = history.filter(
    (record, index, all) =>
      record.account &&
      !record.isSample &&
      all.findIndex((other) => other.account === record.account) === index,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previousAccount, setPreviousAccount] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(today);
  const [complete, setComplete] = useState(false);
  const [persist, setPersist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const worker = useRef<Worker | null>(null);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
      worker.current?.terminate();
    },
    [],
  );

  const runAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const token = ++request.current;
    try {
      const owner =
        persist && savedAccounts.some((record) => record.account === previousAccount)
          ? previousAccount
          : `local:${crypto.randomUUID()}`;
      validateFileSelection(files);
      if (!complete) throw new Error('전체 기간으로 받은 모든 파일인지 확인해주세요.');
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate) ||
        snapshotDate > today() ||
        new Date(snapshotDate).toISOString().slice(0, 10) !== snapshotDate
      )
        throw new Error('데이터 기준일을 확인해주세요. 미래 날짜는 사용할 수 없습니다.');
      setRunning(true);
      const result = await new Promise<AnalysisResult>((resolve, reject) => {
        const instance = new Worker(new URL('../../lib/import.worker.ts', import.meta.url));
        worker.current = instance;
        instance.onmessage = (e: MessageEvent<{ result?: AnalysisResult; error?: string }>) => {
          instance.terminate();
          worker.current = null;
          if (e.data.result) resolve(e.data.result);
          else reject(new Error(e.data.error ?? '분석에 실패했습니다.'));
        };
        instance.onerror = () => {
          instance.terminate();
          worker.current = null;
          reject(
            new Error('분석 도구를 실행하지 못했습니다. 페이지를 새로고침하고 다시 시도해주세요.'),
          );
        };
        instance.postMessage({ files, account: owner, snapshotDate });
      });
      if (token !== request.current) return;
      await setCurrent(result, { persist });
      trackSafeEvent('analysis_completed');
      if (token === request.current) router.push('/dashboard');
    } catch (e) {
      if (token === request.current)
        setError(e instanceof Error ? e.message : '파일을 분석하지 못했습니다.');
    } finally {
      if (token === request.current) setRunning(false);
    }
  };
  const sample = async () => {
    setRunning(true);
    setError(null);
    const result = analyze(
      parseFollowing(SAMPLE_FOLLOWING_JSON),
      parseFollowers(SAMPLE_FOLLOWERS_JSON),
      { account: 'sample', snapshotDate: today() },
    );
    result.isSample = true;
    await setCurrent(result);
    router.push('/dashboard');
  };
  return (
    <>
      <PageHeader title="데이터 분석" subtitle="인스타그램에서 받은 파일을 선택해주세요" back />
      <form onSubmit={runAnalysis} className="page-shell py-6 space-y-5">
        <PrivacyBadge />
        <Link
          href="/guide"
          className="block rounded-2xl border border-brand/15 bg-brand-soft p-4 text-sm font-semibold text-brand"
        >
          파일이 아직 없나요? 다운로드 방법 보기 →
        </Link>
        <fieldset disabled={running} className="space-y-5 disabled:opacity-60">
          <DropZone
            files={files}
            onFilesChange={(next) => {
              setFiles(next);
              setComplete(false);
              setError(null);
            }}
          />
          <p className="text-xs text-slate-600">파일당 20MB · 전체 50MB까지 선택할 수 있어요.</p>
          <label className="block text-sm font-medium">
            데이터 기준일
            <input
              required
              type="date"
              value={snapshotDate}
              max={today()}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="field mt-2"
            />
            <span className="block mt-2 text-xs text-slate-600">
              인스타그램에서 이 파일을 만든 날짜를 입력하세요.
            </span>
          </label>
          <label className="flex gap-3 text-sm leading-relaxed">
            <input
              className="mt-1 size-5 shrink-0 accent-pink-500"
              type="checkbox"
              checked={complete}
              onChange={(e) => setComplete(e.target.checked)}
            />
            전체 기간으로 요청한 같은 계정의 파일을 모두 선택했어요.
          </label>
          <p className="text-xs text-slate-600">
            파일이 빠지거나 다른 날짜의 파일이 섞이면 결과가 달라질 수 있어요.
          </p>
          <label className="flex gap-3 text-sm leading-relaxed">
            <input
              className="mt-1 size-5 shrink-0 accent-pink-500"
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            이 기기에 분석 기록 저장
          </label>
          {persist && (
            <div className="rounded-2xl bg-brand-soft p-4 space-y-3">
              {savedAccounts.length > 0 && (
                <label className="block text-sm font-medium">
                  저장할 기록
                  <select
                    className="field mt-2"
                    value={previousAccount}
                    onChange={(event) => setPreviousAccount(event.target.value)}
                  >
                    <option value="">새 기록으로 저장</option>
                    {savedAccounts.map((record) => (
                      <option key={record.account} value={record.account!}>
                        {accountLabel(record.account)} · {record.snapshotDate} · 팔로워{' '}
                        {record.followers.length}명에 이어 저장
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="text-xs leading-relaxed text-slate-600">
                {previousAccount
                  ? '같은 인스타그램 계정의 파일일 때만 이어 저장하세요. 날짜가 다르면 변화를 비교하고, 같은 날짜면 기존 기록을 바꿉니다.'
                  : '아이디 입력 없이 별도 기록으로 저장합니다. 다음 분석에서 이 기록을 선택하면 변화를 비교할 수 있어요.'}{' '}
                각 기록 묶음은 최근 10개까지 보관합니다.
              </p>
            </div>
          )}
        </fieldset>
        {error && (
          <p
            role="alert"
            aria-label="파일 분석 오류"
            className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <GradientButton
          type="submit"
          className="w-full"
          size="lg"
          disabled={running || !files.length || !complete}
          loading={running}
        >
          {running ? '분석 중…' : '분석 시작'}
        </GradientButton>
        {running && (
          <button
            type="button"
            className="w-full p-3 text-sm text-slate-600"
            onClick={() => {
              request.current++;
              worker.current?.terminate();
              worker.current = null;
              setRunning(false);
            }}
          >
            분석 취소
          </button>
        )}
        <GradientButton
          type="button"
          className="w-full"
          variant="ghost"
          disabled={running}
          onClick={sample}
        >
          샘플 데이터로 체험하기
        </GradientButton>
      </form>
    </>
  );
}
