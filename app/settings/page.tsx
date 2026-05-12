// app/settings/page.tsx — 설정 페이지
'use client';

import { useState } from 'react';
import { Trash2, ShieldCheck, BookOpen, Heart, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function SettingsPage() {
  const resetAll = useAnalysisStore((s) => s.resetAll);
  const history = useAnalysisStore((s) => s.history);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <PageHeader title="설정" />

      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        {/* 분석 기록 관리 */}
        <Link href="/history">
          <GlassCard className="flex items-center gap-3 hover:bg-white/[0.06] transition">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-ig-soft text-ig-pink">
              <HistoryIcon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">분석 기록</p>
              <p className="text-[12px] text-white/55">{history.length}개 저장됨 · 최대 10개까지 보관</p>
            </div>
          </GlassCard>
        </Link>

        {/* 가이드 */}
        <Link href="/guide">
          <GlassCard className="flex items-center gap-3 hover:bg-white/[0.06] transition">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple">
              <BookOpen size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">데이터 다운로드 방법</p>
              <p className="text-[12px] text-white/55">인스타그램에서 JSON 받는 법</p>
            </div>
          </GlassCard>
        </Link>

        {/* 프라이버시 안내 */}
        <GlassCard>
          <div className="flex items-start gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-[13px] leading-relaxed">
              <p className="font-semibold">프라이버시 정책</p>
              <p className="text-white/60 mt-1">
                · 업로드된 JSON 파일은 외부 서버로 전송되지 않습니다.<br />
                · 분석 결과는 브라우저 localStorage 에만 저장됩니다.<br />
                · 사용자 식별 정보 / 쿠키 / 트래커를 사용하지 않습니다.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 데이터 삭제 */}
        <GlassCard className="border border-rose-500/20">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">모든 기록 삭제</p>
              <p className="text-[12px] text-white/55 mb-3">localStorage 에 저장된 분석 기록을 모두 지웁니다.</p>
              {confirming ? (
                <div className="flex gap-2">
                  <GradientButton
                    size="sm"
                    onClick={() => { resetAll(); setConfirming(false); }}
                    className="bg-rose-500 shadow-none"
                  >
                    네, 삭제할게요
                  </GradientButton>
                  <GradientButton size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                    취소
                  </GradientButton>
                </div>
              ) : (
                <GradientButton size="sm" variant="ghost" onClick={() => setConfirming(true)}>
                  삭제하기
                </GradientButton>
              )}
            </div>
          </div>
        </GlassCard>

        {/* 푸터 */}
        <div className="text-center pt-4 pb-2 text-[12px] text-white/40 space-y-1">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-ig-pink" fill="currentColor" /> for clean Instagram lists
          </p>
          <p>v1.0 · Open source MIT</p>
        </div>
      </div>
    </>
  );
}
