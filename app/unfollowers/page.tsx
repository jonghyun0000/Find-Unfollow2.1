// app/unfollowers/page.tsx — 언팔러 리스트 페이지
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Download, Inbox, UserX, Heart, AlertTriangle, Info, BadgeCheck, Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/analysis/SearchBar';
import { UserList } from '@/components/analysis/UserList';
import { EmptyState } from '@/components/ui/EmptyState';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { filterByGroup, searchUsers, type GroupFilter } from '@/lib/analyzer';
import { downloadCSV } from '@/lib/csv';
import { cn } from '@/lib/cn';

type Segment = 'unfollowers' | 'fans';

function UnfollowersInner() {
  const current = useAnalysisStore((s) => s.current);
  const params = useSearchParams();

  const [segment, setSegment] = useState<Segment>('unfollowers');
  const [filter, setFilter] = useState<GroupFilter>('all');
  const [query, setQuery] = useState('');

  // ?filter=inactive | official 로 진입 시 자동 적용
  useEffect(() => {
    const f = params.get('filter');
    if (f === 'inactive' || f === 'official' || f === 'normal') setFilter(f);
  }, [params]);

  const baseList = useMemo(() => {
    if (!current) return [];
    return segment === 'unfollowers' ? current.unfollowers : current.fans;
  }, [current, segment]);

  // 카운트 (필터 칩에 표시)
  const counts = useMemo(() => {
    return {
      all: baseList.length,
      official: filterByGroup(baseList, 'official').length,
      inactive: filterByGroup(baseList, 'inactive').length,
      normal: filterByGroup(baseList, 'normal').length,
    };
  }, [baseList]);

  const list = useMemo(() => {
    return searchUsers(filterByGroup(baseList, filter), query);
  }, [baseList, filter, query]);

  if (!current) {
    return (
      <>
        <PageHeader title="언팔러" back />
        <div className="px-5 py-12 mx-auto max-w-md">
          <EmptyState
            icon={<Inbox size={26} />}
            title="분석된 데이터가 없어요"
            description="JSON 파일을 업로드하면 언팔러 목록을 확인할 수 있어요."
            ctaLabel="업로드 하러 가기"
            ctaHref="/upload"
          />
        </div>
      </>
    );
  }

  const exportCSV = () => {
    const tag = filter === 'all' ? segment : `${segment}-${filter}`;
    downloadCSV(list, `${tag}-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <>
      <PageHeader
        title="언팔러"
        subtitle={`${list.length.toLocaleString()}명 표시 중`}
        back
        right={
          <GradientButton size="sm" variant="ghost" onClick={exportCSV} disabled={!list.length}>
            <Download size={14} /> CSV
          </GradientButton>
        }
      />

      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        {/* 세그먼트 */}
        <div className="glass rounded-2xl p-1 grid grid-cols-2 gap-1 relative">
          {(['unfollowers', 'fans'] as Segment[]).map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className="relative h-10 rounded-xl text-sm font-medium z-10 transition-colors"
            >
              {segment === s && (
                <motion.span
                  layoutId="seg-pill"
                  className="absolute inset-0 rounded-xl bg-ig-gradient -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn(segment === s ? 'text-white font-semibold' : 'text-white/65')}>
                {s === 'unfollowers' ? (
                  <span className="inline-flex items-center gap-1.5"><UserX size={14}/> 안 따라줌</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5"><Heart size={14}/> 내가 안 따름</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* 필터 칩 (가로 스크롤 가능) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="전체"
            count={counts.all}
            tone="primary"
          />
          <FilterChip
            active={filter === 'official'}
            onClick={() => setFilter('official')}
            icon={<BadgeCheck size={12} strokeWidth={3} />}
            label="공식"
            count={counts.official}
            tone="sky"
          />
          <FilterChip
            active={filter === 'inactive'}
            onClick={() => setFilter('inactive')}
            icon={<AlertTriangle size={12} />}
            label="비활성"
            count={counts.inactive}
            tone="amber"
          />
          <FilterChip
            active={filter === 'normal'}
            onClick={() => setFilter('normal')}
            icon={<Users size={12} />}
            label="일반"
            count={counts.normal}
            tone="default"
          />
        </div>

        {/* 안내 박스 */}
        <FilterExplainer filter={filter} segment={segment} />

        {/* 검색 */}
        <SearchBar value={query} onChange={setQuery} placeholder="아이디 검색" />

        {list.length === 0 ? (
          <EmptyState
            icon={<UserX size={22} />}
            title={query ? '검색 결과가 없어요' : '해당하는 사람이 없어요'}
            description={
              query
                ? '다른 키워드로 검색해보세요.'
                : filter === 'inactive'
                ? '비활성으로 추정되는 계정이 없어요. 깨끗한 편이에요!'
                : filter === 'official'
                ? '공식 계정은 없어요.'
                : '깨끗한 상태! 정리할 사람이 없네요.'
            }
          />
        ) : (
          <UserList
            users={list}
            badge={segment === 'unfollowers' ? '안 따름' : '맞팔 가능'}
            badgeColor={segment === 'unfollowers' ? 'pink' : 'amber'}
          />
        )}
      </div>
    </>
  );
}

/* ============================================================
 * 보조 컴포넌트들
 * ============================================================ */

interface ChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
  tone: 'primary' | 'sky' | 'amber' | 'default';
}

function FilterChip({ active, onClick, label, count, icon, tone }: ChipProps) {
  const tones: Record<ChipProps['tone'], string> = {
    primary: active
      ? 'bg-ig-gradient border-transparent text-white'
      : 'bg-white/5 border-white/10 text-white/65',
    sky: active
      ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
      : 'bg-sky-500/10 border-sky-500/30 text-sky-200/85',
    amber: active
      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
      : 'bg-amber-500/10 border-amber-500/30 text-amber-200/85',
    default: active
      ? 'bg-white/15 border-white/30 text-white'
      : 'bg-white/5 border-white/10 text-white/65',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 h-8 px-3 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 transition',
        tones[tone],
      )}
    >
      {icon}
      {label}
      <span className="opacity-80 tabular-nums">{count}</span>
    </button>
  );
}

function FilterExplainer({ filter, segment }: { filter: GroupFilter; segment: Segment }) {
  const messages: Record<GroupFilter, { tone: string; title: string; body: string }> = {
    all: {
      tone: 'neutral',
      title: '',
      body: segment === 'unfollowers'
        ? '내가 팔로우하고 있지만 나를 팔로우 하지 않는 사람들이에요.'
        : '나를 팔로우 하지만 내가 아직 안 따른 사람들이에요.',
    },
    official: {
      tone: 'sky',
      title: '공식 계정',
      body: '학교·공공기관·브랜드·연예인·크리에이터처럼 일방 팔로우가 자연스러운 계정이에요. 정리 대상이 아니에요.',
    },
    inactive: {
      tone: 'amber',
      title: '비활성 의심',
      body: '봇/유령 패턴 + 오랜 무응답을 종합해 추정한 계정이에요. 공식 키워드에 매칭되면 자동 제외돼요.',
    },
    normal: {
      tone: 'neutral',
      title: '일반 사용자',
      body: '공식 계정도 아니고 비활성 의심도 아닌 일반 사용자들이에요.',
    },
  };
  const m = messages[filter];

  if (filter === 'all' || filter === 'normal') {
    return <p className="text-[12.5px] text-white/55 px-1">{m.body}</p>;
  }

  const colorMap = {
    sky: 'border-sky-500/20 bg-sky-500/[0.04] [&_b]:text-sky-200 [&_svg]:text-sky-300',
    amber: 'border-amber-500/20 bg-amber-500/[0.04] [&_b]:text-amber-200 [&_svg]:text-amber-300',
    neutral: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass rounded-2xl p-3 border', colorMap[m.tone as 'sky' | 'amber'])}
    >
      <div className="flex gap-2.5 items-start">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="text-[12px] text-white/70 leading-relaxed">
          <b className="font-semibold">{m.title}</b> · {m.body}
        </p>
      </div>
    </motion.div>
  );
}

export default function UnfollowersPage() {
  return (
    <Suspense fallback={null}>
      <UnfollowersInner />
    </Suspense>
  );
}
