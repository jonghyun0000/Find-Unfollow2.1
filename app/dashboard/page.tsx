'use client';
import Link from 'next/link';
import { Heart, Users, UserMinus, ArrowRight } from 'lucide-react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/stats/StatCard';
import { ResultEmpty } from '@/components/analysis/ResultEmpty';
export default function DashboardPage() {
  const { current, previous, diffResult, hydrated, history } = useAnalysisStore();
  if (!current) return <ResultEmpty hydrated={hydrated} />;
  return (
    <>
      <PageHeader
        title="분석 결과"
        subtitle={`${current.account ? '@' + current.account : '이전 버전 기록'} · 기준일 ${current.snapshotDate}`}
      />
      <div className="mx-auto max-w-md px-5 py-5 space-y-5">
        {!current.isSample && !history.some((h) => h.id === current.id) && (
          <p className="text-sm text-white/65">
            이 결과는 저장되지 않았습니다. 새로고침하거나 앱을 닫으면 사라집니다.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="팔로워"
            value={current.followers.length.toLocaleString()}
            icon={<Heart size={18} />}
            accent="pink"
          />
          <StatCard
            label="팔로잉"
            value={current.following.length.toLocaleString()}
            icon={<Users size={18} />}
            accent="purple"
          />
          <StatCard
            label="나를 안 따름"
            value={current.unfollowers.length.toLocaleString()}
            icon={<UserMinus size={18} />}
            accent="rose"
          />
          <StatCard
            label="맞팔"
            value={current.mutuals.length.toLocaleString()}
            icon={<Heart size={18} />}
            accent="emerald"
          />
        </div>
        <p className="text-sm text-white/65 leading-relaxed">
          ‘나를 안 따름’은 현재 맞팔하지 않는 계정입니다. 과거에 팔로우했다가 해제했는지는 한 번의
          데이터로 알 수 없습니다.
        </p>
        {[
          [
            '/unfollowers',
            '팔로우 관계 전체 보기',
            `${current.unfollowers.length}명이 나를 안 따름 · ${current.fans.length}명을 내가 안 따름`,
          ],
          ['/mutual', '맞팔 전체 보기', `${current.mutuals.length}명`],
        ].map(([href, title, desc]) => (
          <Link key={href} href={href} className="block">
            <GlassCard className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-white/60">{desc}</p>
              </div>
              <ArrowRight size={18} />
            </GlassCard>
          </Link>
        ))}
        <GlassCard>
          <h2 className="font-semibold text-lg">이전 기록과 비교</h2>
          {previous ? (
            <>
              <p className="text-sm text-white/60 mt-2">
                {previous.snapshotDate} → {current.snapshotDate}
              </p>
              <div className="grid grid-cols-2 gap-3 my-4">
                <div>
                  <p className="text-sm text-white/60">사라진 팔로워</p>
                  <p className="text-2xl font-bold text-rose-300">
                    {diffResult?.lostFollowers.length ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60">새 팔로워</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {diffResult?.newFollowers.length ?? 0}
                  </p>
                </div>
              </div>
              <Link
                href="/changes"
                className="inline-flex rounded-xl bg-white/10 p-3 text-sm font-semibold"
              >
                변화 목록 전체 보기 →
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              비교할 이전 데이터가 없습니다. 같은 계정의 더 이전 기준일 기록이 필요합니다. 첫
              분석에서 ‘언팔 없음’을 판단하지 않습니다.
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-white/55">
            계정 이름 변경·삭제·비활성화도 팔로워 감소로 나타날 수 있습니다. 결과는 내보내기 시점
            기준이며 실시간 정보가 아닙니다.
          </p>
        </GlassCard>
        <Link href="/stats" className="block rounded-2xl bg-white/5 p-4 text-sm font-semibold">
          팔로워 변화 통계 →
        </Link>
        <Link
          href="/upload"
          className="block rounded-2xl bg-ig-gradient p-4 text-center font-semibold"
        >
          새 데이터 분석하기
        </Link>
      </div>
    </>
  );
}
