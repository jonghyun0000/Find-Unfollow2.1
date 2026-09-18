'use client';
import { Suspense, useDeferredValue, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
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
  const list = searchUsers(selected.users, deferredQuery);
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
              className={`rounded-xl px-3 py-3 text-sm ${g.key === selected.key ? 'bg-ig-gradient font-semibold' : 'bg-white/5 text-white/75'}`}
            >
              {g.label} {g.users.length.toLocaleString()}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-white/65 leading-relaxed">
          {mode === 'changes'
            ? previous
              ? `${previous.snapshotDate} → ${current.snapshotDate} 비교입니다. 계정 이름 변경·삭제·비활성화나 내보내기 범위 차이도 목록에서 사라지는 원인이 될 수 있습니다. 실제 언팔 행동을 확정하지 않습니다.`
              : '비교할 이전 기록이 없습니다. 같은 계정의 더 이전 기준일 데이터를 저장하면 변화를 볼 수 있습니다.'
            : mode === 'mutuals'
              ? '서로 팔로우하는 계정입니다.'
              : '현재 두 목록의 차이를 보여줍니다. 이전에 나를 팔로우한 적이 없는 계정도 포함됩니다.'}
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
          <p aria-live="polite" className="text-sm text-white/70">
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
          <UserList key={`${current.id}-${selected.key}-${deferredQuery}`} users={list} />
        ) : (
          <p className="glass rounded-2xl p-8 text-center text-sm text-white/65">
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
