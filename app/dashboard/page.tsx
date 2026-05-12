// app/dashboard/page.tsx — 분석 결과 대시보드
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Heart, UserMinus, UserPlus, UserX, Inbox, ArrowRight,
  AlertTriangle, BadgeCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/stats/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow, SkeletonStat } from '@/components/ui/Skeleton';
import { UserCard } from '@/components/analysis/UserList';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function DashboardPage() {
  const current = useAnalysisStore((s) => s.current);
  const previous = useAnalysisStore((s) => s.previous);
  const diffResult = useAnalysisStore((s) => s.diffResult);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <>
        <PageHeader title="대시보드" />
        <div className="mx-auto max-w-md px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
          </div>
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      </>
    );
  }

  if (!current) {
    return (
      <>
        <PageHeader title="대시보드" />
        <div className="mx-auto max-w-md px-5 py-12">
          <EmptyState
            icon={<Inbox size={26} />}
            title="아직 분석된 데이터가 없어요"
            description="JSON 파일을 업로드하면 결과가 여기에 표시됩니다."
            ctaLabel="파일 업로드 하러 가기"
            ctaHref="/upload"
          />
        </div>
      </>
    );
  }

  const followerDelta = previous ? current.followers.length - previous.followers.length : undefined;
  const followingDelta = previous ? current.following.length - previous.following.length : undefined;

  const summary = current.classificationSummary;

  return (
    <>
      <PageHeader
        title="대시보드"
        subtitle={`최근 분석 · ${new Date(current.createdAt).toLocaleString('ko-KR')}`}
      />

      <div className="mx-auto max-w-md px-5 py-5 space-y-5">
        {/* 핵심 4 지표 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="팔로워" value={current.followers.length.toLocaleString()} delta={followerDelta} icon={<Heart size={18} />} accent="pink" />
          <StatCard label="팔로잉" value={current.following.length.toLocaleString()} delta={followingDelta} icon={<UserPlus size={18} />} accent="purple" />
          <StatCard label="언팔러" value={current.unfollowers.length.toLocaleString()} icon={<UserX size={18} />} accent="rose" />
          <StatCard label="맞팔" value={current.mutuals.length.toLocaleString()} icon={<Heart size={18} />} accent="emerald" />
        </div>

        {/* 빠른 링크 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/unfollowers">
            <GlassCard className="p-4 flex items-center justify-between hover:bg-white/[0.06] transition">
              <div>
                <p className="text-[13px] text-white/55">언팔러 보기</p>
                <p className="text-base font-semibold mt-1">{current.unfollowers.length}명</p>
              </div>
              <ArrowRight size={16} className="text-white/40" />
            </GlassCard>
          </Link>
          <Link href="/mutual">
            <GlassCard className="p-4 flex items-center justify-between hover:bg-white/[0.06] transition">
              <div>
                <p className="text-[13px] text-white/55">맞팔 보기</p>
                <p className="text-base font-semibold mt-1">{current.mutuals.length}명</p>
              </div>
              <ArrowRight size={16} className="text-white/40" />
            </GlassCard>
          </Link>
        </div>

        {/* 분류 요약 카드 (공식 vs 비활성 vs 일반) */}
        <GlassCard>
          <h2 className="text-base font-semibold flex items-center gap-2">
            언팔러 자동 분류
          </h2>
          <p className="text-[12px] text-white/50 mt-0.5">
            언팔러를 3가지로 자동 분류했어요. 정리할 때 헷갈리지 않게요.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link
              href="/unfollowers?filter=official"
              className="rounded-2xl p-3 border border-sky-500/25 bg-sky-500/[0.06] text-center hover:bg-sky-500/[0.1] transition"
            >
              <div className="grid place-items-center w-9 h-9 mx-auto rounded-full bg-sky-500/15 text-sky-300">
                <BadgeCheck size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] text-white/55 mt-2">공식</p>
              <p className="text-xl font-bold text-sky-300 mt-0.5 tabular-nums">{summary.official}</p>
            </Link>
            <Link
              href="/unfollowers?filter=inactive"
              className="rounded-2xl p-3 border border-amber-500/25 bg-amber-500/[0.06] text-center hover:bg-amber-500/[0.1] transition"
            >
              <div className="grid place-items-center w-9 h-9 mx-auto rounded-full bg-amber-500/15 text-amber-300">
                <AlertTriangle size={16} />
              </div>
              <p className="text-[11px] text-white/55 mt-2">비활성</p>
              <p className="text-xl font-bold text-amber-300 mt-0.5 tabular-nums">{summary.inactiveTotal}</p>
            </Link>
            <Link
              href="/unfollowers?filter=normal"
              className="rounded-2xl p-3 border border-white/10 bg-white/[0.04] text-center hover:bg-white/[0.07] transition"
            >
              <div className="grid place-items-center w-9 h-9 mx-auto rounded-full bg-white/5 text-white/70">
                <UserX size={16} />
              </div>
              <p className="text-[11px] text-white/55 mt-2">일반</p>
              <p className="text-xl font-bold text-white mt-0.5 tabular-nums">{summary.normal}</p>
            </Link>
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11.5px] text-white/55 leading-relaxed">
            <BadgeCheck size={12} className="text-sky-300 mt-0.5 shrink-0" />
            <p>
              <b className="text-sky-300">공식</b>은 학교·공공기관·브랜드·연예인 등으로 일방 팔로우가 자연스러워 정리 대상이 아니에요.
            </p>
          </div>
          <div className="mt-1 flex items-start gap-2 text-[11.5px] text-white/55 leading-relaxed">
            <AlertTriangle size={12} className="text-amber-300 mt-0.5 shrink-0" />
            <p>
              <b className="text-amber-300">비활성</b>은 봇처럼 보이거나 1년 이상 무응답인 계정이에요. 정리 후보입니다.
            </p>
          </div>
        </GlassCard>

        {/* 정리 추천 (비활성 ≥ 1) */}
        {summary.inactiveTotal > 0 && (
          <Link href="/unfollowers?filter=inactive">
            <GlassCard className="relative overflow-hidden p-5 hover:bg-white/[0.07] transition">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-rose-500/10 pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <div className="grid place-items-center w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-300 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold">정리 추천</p>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {summary.inactiveTotal}명
                    </span>
                  </div>
                  <p className="text-[12px] text-white/60 mt-1 leading-relaxed">
                    공식 계정은 자동으로 빠지고, 진짜 비활성 의심 계정만 보여드려요.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-amber-200/80">
                    <span className="font-semibold">자세히 보기</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        )}

        {/* 최근 언팔 */}
        {diffResult && diffResult.lostFollowers.length > 0 ? (
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold">최근 언팔러</h2>
                <p className="text-[12px] text-white/50">지난 분석 이후 나를 언팔한 사람들</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {diffResult.lostFollowers.length}명
              </span>
            </div>
            <ul className="space-y-2">
              {diffResult.lostFollowers.slice(0, 5).map((u, i) => (
                <UserCard key={u.username} user={u} index={i} badge="언팔" badgeColor="pink" showClassification={false} />
              ))}
            </ul>
          </GlassCard>
        ) : (
          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300">
                <UserMinus size={18} />
              </div>
              <div>
                <p className="text-[14px] font-semibold">최근 언팔 없음</p>
                <p className="text-[12.5px] text-white/55">
                  {previous
                    ? '지난 분석 이후 새로운 언팔러가 발견되지 않았어요. 잘하고 있어요!'
                    : '두 번 이상 분석하면 변화를 추적할 수 있어요.'}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {diffResult && diffResult.newFollowers.length > 0 && (
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold">새 팔로워</h2>
                <p className="text-[12px] text-white/50">지난 분석 이후 새로 늘어난 팔로워</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                +{diffResult.newFollowers.length}
              </span>
            </div>
            <ul className="space-y-2">
              {diffResult.newFollowers.slice(0, 5).map((u, i) => (
                <UserCard key={u.username} user={u} index={i} badge="NEW" badgeColor="emerald" showClassification={false} />
              ))}
            </ul>
          </GlassCard>
        )}

        <Link href="/stats">
          <GlassCard className="flex items-center justify-between hover:bg-white/[0.06] transition">
            <div>
              <p className="text-[13px] text-white/55">팔로워 변화 추이</p>
              <p className="text-[15px] font-semibold mt-0.5">통계 페이지에서 자세히 보기</p>
            </div>
            <ArrowRight size={18} className="text-white/40" />
          </GlassCard>
        </Link>
      </div>
    </>
  );
}
