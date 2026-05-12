// app/stats/page.tsx — 통계 페이지
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Inbox, TrendingUp, TrendingDown, Users, Heart,
  AlertTriangle, ArrowRight, BadgeCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/stats/StatCard';
import { FollowerChart } from '@/components/stats/FollowerChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonStat } from '@/components/ui/Skeleton';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function StatsPage() {
  const current = useAnalysisStore((s) => s.current);
  const previous = useAnalysisStore((s) => s.previous);
  const history = useAnalysisStore((s) => s.history);
  const diffResult = useAnalysisStore((s) => s.diffResult);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <>
        <PageHeader title="통계" back />
        <div className="mx-auto max-w-md px-5 py-5 space-y-4">
          <SkeletonCard />
          <div className="grid grid-cols-2 gap-3"><SkeletonStat /><SkeletonStat /></div>
        </div>
      </>
    );
  }

  if (!current) {
    return (
      <>
        <PageHeader title="통계" back />
        <div className="px-5 py-12 mx-auto max-w-md">
          <EmptyState
            icon={<Inbox size={26} />}
            title="아직 통계가 없어요"
            description="분석을 두 번 이상 해야 변화 추이가 표시돼요."
            ctaLabel="업로드 하러 가기"
            ctaHref="/upload"
          />
        </div>
      </>
    );
  }

  const followerDelta = previous ? current.followers.length - previous.followers.length : 0;
  const summary = current.classificationSummary;

  return (
    <>
      <PageHeader title="통계" subtitle={`${history.length}회 분석 기록`} back />

      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        {/* 변화 차트 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold">팔로워 변화</h2>
              <p className="text-[12px] text-white/50">최근 {history.length}개 분석 기준</p>
            </div>
            {followerDelta !== 0 && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                  ${followerDelta > 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}
              >
                {followerDelta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {followerDelta > 0 ? '+' : ''}{followerDelta}
              </span>
            )}
          </div>
          {history.length >= 2 ? (
            <FollowerChart history={history} />
          ) : (
            <div className="h-32 grid place-items-center text-[13px] text-white/55 text-center px-4">
              한 번 더 분석하면 그래프가 그려져요.<br />최소 2개의 분석 기록이 필요합니다.
            </div>
          )}
        </GlassCard>

        {/* 변화량 4 지표 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="신규 팔로워" value={diffResult?.newFollowers.length ?? 0} icon={<TrendingUp size={18} />} accent="emerald" />
          <StatCard label="잃은 팔로워" value={diffResult?.lostFollowers.length ?? 0} icon={<TrendingDown size={18} />} accent="rose" />
          <StatCard label="신규 팔로잉" value={diffResult?.newFollowing.length ?? 0} icon={<Users size={18} />} accent="purple" />
          <StatCard label="언팔한 사람" value={diffResult?.unfollowedByMe.length ?? 0} icon={<Heart size={18} />} accent="amber" />
        </div>

        {/* 관계 분포 */}
        <GlassCard>
          <h2 className="text-base font-semibold">관계 분포</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: '맞팔', value: current.mutuals.length, color: 'bg-emerald-400' },
              { label: '내가 일방 팔로우', value: current.unfollowers.length, color: 'bg-ig-pink' },
              { label: '상대만 팔로우', value: current.fans.length, color: 'bg-accent-purple' },
            ].map(({ label, value, color }) => {
              const total = current.mutuals.length + current.unfollowers.length + current.fans.length;
              const pct = total ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="text-white/70">{label}</span>
                    <span className="font-semibold tabular-nums">{value} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* 언팔러 자동 분류 */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-amber-500/8 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-base font-semibold">언팔러 자동 분류</h2>
            <p className="text-[12px] text-white/50">총 {summary.total}명을 3가지로 분류</p>

            {/* 100% 누적 막대 */}
            {summary.total > 0 && (
              <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-white/5">
                <div
                  className="bg-sky-400 h-full"
                  style={{ width: `${(summary.official / summary.total) * 100}%` }}
                  title={`공식 ${summary.official}명`}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${(summary.inactiveTotal / summary.total) * 100}%` }}
                  title={`비활성 ${summary.inactiveTotal}명`}
                />
                <div
                  className="bg-white/30 h-full"
                  style={{ width: `${(summary.normal / summary.total) * 100}%` }}
                  title={`일반 ${summary.normal}명`}
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Link href="/unfollowers?filter=official" className="rounded-2xl p-3 border border-sky-500/25 bg-sky-500/[0.06] hover:bg-sky-500/[0.1] transition">
                <BadgeCheck size={16} className="mx-auto text-sky-300" strokeWidth={2.5} />
                <p className="text-[11px] text-white/55 mt-2">공식 계정</p>
                <p className="text-2xl font-bold text-sky-300 mt-0.5 tabular-nums">{summary.official}</p>
              </Link>
              <Link href="/unfollowers?filter=inactive" className="rounded-2xl p-3 border border-amber-500/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.1] transition">
                <AlertTriangle size={16} className="mx-auto text-amber-300" />
                <p className="text-[11px] text-white/55 mt-2">비활성</p>
                <p className="text-2xl font-bold text-amber-300 mt-0.5 tabular-nums">{summary.inactiveTotal}</p>
                <p className="text-[10px] text-white/40 mt-0.5">강력 {summary.inactiveStrong} · 의심 {summary.inactiveSuspect}</p>
              </Link>
              <Link href="/unfollowers?filter=normal" className="rounded-2xl p-3 border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition">
                <Users size={16} className="mx-auto text-white/70" />
                <p className="text-[11px] text-white/55 mt-2">일반</p>
                <p className="text-2xl font-bold text-white mt-0.5 tabular-nums">{summary.normal}</p>
              </Link>
            </div>

            <div className="mt-4 text-[11.5px] text-white/55 leading-relaxed">
              <p>· 공식 키워드(학교·공공·브랜드·연예인)에 매칭되면 비활성 판정에서 자동 제외됩니다.</p>
              <p>· 같은 username이 공식 + 비활성 둘 다에 들어가지 않아요.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
