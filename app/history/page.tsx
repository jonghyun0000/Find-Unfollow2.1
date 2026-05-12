// app/history/page.tsx — 분석 기록 목록
'use client';

import { useRouter } from 'next/navigation';
import { History as HistoryIcon, Trash2, ArrowRight, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function HistoryPage() {
  const router = useRouter();
  const history = useAnalysisStore((s) => s.history);
  const remove = useAnalysisStore((s) => s.removeFromHistory);
  const load = useAnalysisStore((s) => s.loadFromHistory);

  if (!history.length) {
    return (
      <>
        <PageHeader title="분석 기록" back />
        <div className="px-5 py-12 mx-auto max-w-md">
          <EmptyState
            icon={<Inbox size={26} />}
            title="저장된 기록이 없어요"
            description="분석을 한 번 진행하면 자동으로 여기에 저장됩니다."
            ctaLabel="업로드 하러 가기"
            ctaHref="/upload"
          />
        </div>
      </>
    );
  }

  const open = (id: string) => {
    load(id);
    router.push('/dashboard');
  };

  return (
    <>
      <PageHeader title="분석 기록" subtitle={`${history.length}개 저장됨`} back />
      <div className="mx-auto max-w-md px-5 py-5 space-y-3">
        {history.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <GlassCard className="flex items-center gap-3 p-4">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-ig-soft text-ig-pink shrink-0">
                <HistoryIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate">
                  {new Date(h.createdAt).toLocaleString('ko-KR')}
                </p>
                <p className="text-[12px] text-white/55 mt-0.5">
                  팔로워 {h.followers.length} · 팔로잉 {h.following.length} · 언팔러 {h.unfollowers.length}
                </p>
              </div>
              <button
                onClick={() => open(h.id)}
                className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
                aria-label="이 기록 열기"
              >
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => remove(h.id)}
                className="grid place-items-center w-9 h-9 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                aria-label="이 기록 삭제"
              >
                <Trash2 size={14} />
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </>
  );
}
