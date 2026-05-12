// app/mutual/page.tsx — 맞팔 리스트 페이지
'use client';

import { useMemo, useState } from 'react';
import { Download, Inbox, Heart } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/analysis/SearchBar';
import { UserList } from '@/components/analysis/UserList';
import { EmptyState } from '@/components/ui/EmptyState';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { searchUsers } from '@/lib/analyzer';
import { downloadCSV } from '@/lib/csv';

export default function MutualPage() {
  const current = useAnalysisStore((s) => s.current);
  const [query, setQuery] = useState('');

  const list = useMemo(
    () => (current ? searchUsers(current.mutuals, query) : []),
    [current, query],
  );

  if (!current) {
    return (
      <>
        <PageHeader title="맞팔" back />
        <div className="px-5 py-12 mx-auto max-w-md">
          <EmptyState
            icon={<Inbox size={26} />}
            title="분석된 데이터가 없어요"
            description="JSON 파일을 업로드하면 맞팔 친구를 정리해드려요."
            ctaLabel="업로드 하러 가기"
            ctaHref="/upload"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="맞팔 친구"
        subtitle={`총 ${list.length.toLocaleString()}명`}
        back
        right={
          <GradientButton
            size="sm"
            variant="ghost"
            disabled={!list.length}
            onClick={() => downloadCSV(list, `mutuals-${new Date().toISOString().slice(0, 10)}`)}
          >
            <Download size={14} /> CSV
          </GradientButton>
        }
      />

      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        <div className="glass-strong rounded-2xl p-4 flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-ig-soft text-ig-pink">
            <Heart size={18} fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold">진짜 친구들</p>
            <p className="text-[12px] text-white/55">서로 팔로우하고 있는 친구만 모았어요.</p>
          </div>
        </div>

        <SearchBar value={query} onChange={setQuery} placeholder="아이디 검색" />

        {list.length === 0 ? (
          <EmptyState
            icon={<Heart size={22} />}
            title={query ? '검색 결과가 없어요' : '아직 맞팔이 없어요'}
            description={query ? '다른 키워드로 검색해보세요.' : '서로 팔로우하면 여기에 표시돼요.'}
          />
        ) : (
          <UserList users={list} badge="맞팔" badgeColor="emerald" />
        )}
      </div>
    </>
  );
}
