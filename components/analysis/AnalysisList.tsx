'use client';
import { Suspense, useDeferredValue, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { exclusionReasons } from '@/lib/account-filters';
import { searchUsers } from '@/lib/analyzer';
import { downloadCSV } from '@/lib/csv';
import { UserList } from './UserList';
import { ResultEmpty } from './ResultEmpty';
import { PageHeader } from '@/components/layout/PageHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import type { InstaUser } from '@/types';
function Inner({ mode }: { mode: 'relationships' | 'changes' | 'mutuals' }) {
  const { current, previous, diffResult, hydrated } = useAnalysisStore();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [hallym, setHallym] = useState(false);
  const [official, setOfficial] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [marked, setMarked] = useState<{ id: string; names: Set<string> }>({
    id: '',
    names: new Set(),
  });
  const deferredQuery = useDeferredValue(query);
  if (!current) return <ResultEmpty hydrated={hydrated} />;
  const groups: { key: string; label: string; users: InstaUser[] }[] =
    mode === 'changes'
      ? [
          { key: 'lostFollowers', label: '사라진 팔로워', users: diffResult?.lostFollowers ?? [] },
          { key: 'newFollowers', label: '새 팔로워', users: diffResult?.newFollowers ?? [] },
          {
            key: 'unfollowedByMe',
            label: '내가 팔로우 해제',
            users: diffResult?.unfollowedByMe ?? [],
          },
          { key: 'newFollowing', label: '새 팔로잉', users: diffResult?.newFollowing ?? [] },
        ]
      : mode === 'mutuals'
        ? [{ key: 'mutuals', label: '맞팔', users: current.mutuals }]
        : [
            { key: 'unfollowers', label: '나를 안 따름', users: current.unfollowers },
            { key: 'fans', label: '내가 안 따름', users: current.fans },
          ];
  const selected = groups.find((g) => g.key === params.get('group')) ?? groups[0];
  const unavailable = marked.id === current.id ? marked.names : new Set<string>();
  const filters = { hallym, official, keywords, unavailable };
  const hiddenCount = selected.users.filter(
    (user) => exclusionReasons(user, filters).length > 0,
  ).length;
  const candidates = selected.users.filter(
    (user) => exclusionReasons(user, filters).length > 0 === showHidden,
  );
  const list = searchUsers(candidates, deferredQuery);
  const toggleUnavailable = (username: string) =>
    setMarked((old) => {
      const names = new Set(old.id === current.id ? old.names : []);
      if (names.has(username)) names.delete(username);
      else names.add(username);
      return { id: current.id, names };
    });
  const path = mode === 'changes' ? '/changes' : mode === 'mutuals' ? '/mutual' : '/unfollowers';
  return (
    <>
      <PageHeader
        title={
          mode === 'changes' ? '팔로워 변화' : mode === 'mutuals' ? '맞팔 목록' : '팔로우 관계'
        }
        subtitle={`${current.account ? '@' + current.account : '이전 버전 기록'} · ${current.snapshotDate}`}
        back
      />
      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        <nav aria-label="목록 선택" className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <Link
              key={g.key}
              href={`${path}?group=${g.key}`}
              aria-current={g.key === selected.key ? 'page' : undefined}
              className={`rounded-xl px-3 py-3 text-sm ${g.key === selected.key ? 'bg-brand text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
            >
              {g.label} {g.users.length.toLocaleString()}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-slate-600 leading-relaxed">
          {mode === 'changes'
            ? previous
              ? `${previous.snapshotDate} → ${current.snapshotDate} 비교입니다. 계정 이름 변경·삭제·비활성화나 내보내기 범위 차이도 목록에서 사라지는 원인이 될 수 있습니다. 실제 언팔 행동을 확정하지 않습니다.`
              : '비교할 이전 기록이 없습니다. 같은 계정의 더 이전 기준일 데이터를 저장하면 변화를 볼 수 있습니다.'
            : mode === 'mutuals'
              ? '서로 팔로우하는 계정입니다.'
              : '현재 두 목록의 차이를 보여줍니다. 이전에 나를 팔로우한 적이 없는 계정도 포함됩니다.'}
        </p>
        <details className="glass rounded-2xl p-4" open>
          <summary className="cursor-pointer text-sm font-semibold">
            보고 싶은 계정만 골라보기
          </summary>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hallym}
                onChange={(e) => setHallym(e.target.checked)}
                className="size-5 accent-violet-600"
              />
              한림대 관련 단어 숨기기 (hallym)
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={official}
                onChange={(e) => setOfficial(e.target.checked)}
                className="size-5 accent-violet-600"
              />
              official이 포함된 아이디 숨기기
            </label>
            <label className="block">
              직접 제외할 단어
              <input
                className="field mt-2"
                value={keywords}
                maxLength={300}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="예: university, club, 다른 학교 영문명"
              />
            </label>
            <p className="text-xs leading-relaxed text-slate-600">
              아이디에 단어가 포함되면 숨깁니다. 공식·인증 계정 여부를 판별하지 않으며 개인 계정도
              포함될 수 있습니다. 원본 기록은 변경하지 않습니다.
            </p>
            <button
              type="button"
              aria-pressed={showHidden}
              className="rounded-xl bg-slate-100 px-3 py-3 font-medium"
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? '결과 목록으로 돌아가기' : `숨긴 계정 보기 (${hiddenCount}명)`}
            </button>
            <button
              type="button"
              className="ml-2 rounded-xl px-3 py-3 underline"
              onClick={() => {
                setHallym(false);
                setOfficial(false);
                setKeywords('');
                setMarked({ id: current.id, names: new Set() });
                setShowHidden(false);
              }}
            >
              필터 모두 초기화
            </button>
          </div>
        </details>
        <p className="text-xs leading-relaxed text-slate-600">
          프로필을 직접 열어 확인하세요. 페이지가 열리지 않아도 비활성화·삭제·아이디 변경·차단 등을
          구분할 수 없습니다. ‘확인 불가로 표시’는 이 화면에서만 적용되며 새로고침하면 초기화됩니다.
        </p>
        <label className="block text-sm">
          아이디 검색
          <input
            className="field mt-2"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아이디 입력"
            autoCapitalize="none"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-slate-600">
            {list.length.toLocaleString()}명
          </p>
          <GradientButton
            size="sm"
            variant="ghost"
            disabled={!list.length}
            onClick={() =>
              downloadCSV(
                list,
                `${current.account ?? 'history'}-${selected.key}-${current.snapshotDate}`,
              )
            }
          >
            전체 검색 결과 CSV
          </GradientButton>
        </div>
        {list.length ? (
          <UserList
            key={`${current.id}-${selected.key}-${deferredQuery}-${showHidden}-${hallym}-${official}-${keywords}`}
            users={list}
            onToggleUnavailable={toggleUnavailable}
            unavailable={unavailable}
            reasonFor={
              showHidden ? (user) => exclusionReasons(user, filters).join(' · ') : undefined
            }
          />
        ) : (
          <p className="glass rounded-2xl p-8 text-center text-sm text-slate-600">
            {mode === 'changes' && !previous
              ? '이전 데이터가 필요합니다.'
              : '해당하는 계정이 없습니다.'}
          </p>
        )}
      </div>
    </>
  );
}
export function AnalysisList(props: { mode: 'relationships' | 'changes' | 'mutuals' }) {
  return (
    <Suspense
      fallback={
        <p className="p-6" role="status">
          목록 불러오는 중…
        </p>
      }
    >
      <Inner {...props} />
    </Suspense>
  );
}
