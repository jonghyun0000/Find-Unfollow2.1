'use client';
import dynamic from 'next/dynamic';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { ResultEmpty } from '@/components/analysis/ResultEmpty';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
const FollowerChart = dynamic(
  () => import('@/components/stats/FollowerChart').then((m) => m.FollowerChart),
  {
    ssr: false,
    loading: () => <p className="py-10 text-center text-white/60">차트 불러오는 중…</p>,
  },
);
export default function StatsPage() {
  const { current, history, hydrated } = useAnalysisStore();
  if (!current) return <ResultEmpty hydrated={hydrated} />;
  const records =
    current.isSample || !current.account
      ? []
      : history
          .filter((h) => h.account === current.account && h.snapshotDate <= current.snapshotDate)
          .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate));
  return (
    <>
      <PageHeader
        title="통계"
        subtitle={`${current.account ? '@' + current.account : '이전 버전 기록'} · ${records.length}개 저장 기록`}
        back
      />
      <div className="mx-auto max-w-md px-5 py-5 space-y-5">
        <GlassCard>
          <h2 className="font-semibold">데이터 기준일별 변화</h2>
          {records.length >= 2 ? (
            <FollowerChart history={records} />
          ) : (
            <p className="py-8 text-sm text-white/65">
              같은 계정의 서로 다른 기준일 기록을 2개 이상 저장하면 차트가 표시됩니다.
            </p>
          )}
        </GlassCard>
        <GlassCard>
          <h2 className="font-semibold mb-4">현재 관계 분포</h2>
          <dl className="space-y-4">
            {[
              ['맞팔', current.mutuals.length],
              ['나를 안 따름', current.unfollowers.length],
              ['내가 안 따름', current.fans.length],
            ].map(([label, count]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-white/65">{label}</dt>
                <dd className="font-semibold">{Number(count).toLocaleString()}명</dd>
              </div>
            ))}
          </dl>
        </GlassCard>
        {records.length > 0 && (
          <GlassCard>
            <h2 className="font-semibold mb-3">기록별 수치</h2>
            <table className="w-full text-sm text-left">
              <caption className="sr-only">기준일별 팔로워와 팔로잉 수</caption>
              <thead>
                <tr>
                  <th scope="col" className="py-2">
                    기준일
                  </th>
                  <th scope="col">팔로워</th>
                  <th scope="col">팔로잉</th>
                </tr>
              </thead>
              <tbody>
                {records.map((h) => (
                  <tr key={h.id} className="border-t border-white/10">
                    <th scope="row" className="py-3 font-normal">
                      {h.snapshotDate}
                    </th>
                    <td>{h.followers.length.toLocaleString()}</td>
                    <td>{h.following.length.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </div>
    </>
  );
}
