'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { DropZone } from '@/components/upload/DropZone';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import {
  normalizeUsername,
  validateFileSelection,
  parseFollowers,
  parseFollowing,
} from '@/lib/parser';
import { analyze } from '@/lib/analyzer';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { SAMPLE_FOLLOWERS_JSON, SAMPLE_FOLLOWING_JSON } from '@/lib/sample-data';
import type { AnalysisResult } from '@/types';
import { trackSafeEvent } from '@/lib/analytics';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export default function UploadPage() {
  const router = useRouter();
  const setCurrent = useAnalysisStore((s) => s.setCurrent);
  const [files, setFiles] = useState<File[]>([]);
  const [account, setAccount] = useState('');
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
      const owner = normalizeUsername(account);
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
      <form onSubmit={runAnalysis} className="mx-auto max-w-md px-5 py-6 space-y-5">
        <PrivacyBadge />
        <Link
          href="/guide"
          className="block rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-brand"
        >
          파일이 아직 없나요? 다운로드 방법 보기 →
        </Link>
        <p className="text-sm text-slate-600">
          ZIP 압축을 풀어 <b>following.json 1개</b>와{' '}
          <b>followers_1.json, followers_2.json 등 모든 팔로워 파일</b>을 선택해주세요. 파일당 20MB,
          전체 50MB까지 가능합니다.
        </p>
        <fieldset disabled={running} className="space-y-5 disabled:opacity-60">
          <DropZone
            files={files}
            onFilesChange={(next) => {
              setFiles(next);
              setComplete(false);
              setError(null);
            }}
          />
          <label className="block text-sm font-medium">
            내 인스타그램 아이디
            <input
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={31}
              placeholder="예: jonghyun0000"
              className="field mt-2"
            />
            <span className="block mt-2 text-xs text-slate-600">
              로그인에 사용하지 않습니다. 다른 계정의 기록과 섞이지 않도록 구분합니다.
            </span>
          </label>
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
              인스타그램에서 이 파일을 만든 날짜를 입력하세요. 같은 아이디와 날짜로 저장한 기록이
              있으면 새 기록으로 바뀝니다.
            </span>
          </label>
          <label className="flex gap-3 text-sm leading-relaxed">
            <input
              className="mt-1 size-5 shrink-0 accent-pink-500"
              type="checkbox"
              checked={complete}
              onChange={(e) => setComplete(e.target.checked)}
            />
            전체 기간으로 요청한 같은 계정의 파일이며, 모든 팔로워 파일을 선택했습니다.
          </label>
          <p className="text-xs text-slate-600">
            파일이 빠지거나 다른 날짜에 받은 파일이 섞이면 결과가 부정확할 수 있습니다. 다운로드한
            폴더와 선택한 파일 목록을 한 번 더 비교해주세요.
          </p>
          <label className="flex gap-3 text-sm leading-relaxed">
            <input
              className="mt-1 size-5 shrink-0 accent-pink-500"
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            이 기기에 분석 기록 저장 (계정별 최근 10개). 이후 팔로워 변화를 비교할 수 있습니다.
          </label>
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
