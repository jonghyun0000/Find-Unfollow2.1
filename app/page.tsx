// app/page.tsx — 랜딩 페이지
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Eye, BarChart3, Heart, Search } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  { icon: Eye,        title: '언팔러 자동 추적',     desc: '나를 안 따르는 사람을 한 번에 확인' },
  { icon: Heart,      title: '맞팔 친구 모아보기',   desc: '진짜 친구들만 따로 정리' },
  { icon: BarChart3,  title: '증감 통계',            desc: '팔로워 변화 추이를 그래프로' },
  { icon: Search,     title: '빠른 검색',            desc: '아이디로 즉시 필터링' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 히어로 */}
      <section className="relative px-5 pt-12 pb-10 overflow-hidden">
        {/* 배경 블롭 */}
        <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-ig-pink/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full bg-accent-purple/30 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-md"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11.5px] font-medium text-white/75 mb-5">
            <Sparkles size={12} className="text-ig-pink" />
            v1.0 · 100% 무료 · 광고 없음
          </div>

          <h1 className="text-[40px] leading-[1.05] font-bold tracking-tight">
            나를 안 따르는 사람,
            <br />
            <span className="ig-text">한 번에 보세요.</span>
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-white/65">
            인스타그램에서 받은 데이터 JSON 두 개만 올리면, 언팔러 · 맞팔 · 변화 추이를 즉시 분석합니다.
            <br />
            모든 처리는 당신의 브라우저 안에서만 일어납니다.
          </p>

          <div className="mt-7 flex gap-3">
            <Link href="/upload" className="flex-1">
              <GradientButton size="lg" className="w-full">
                지금 분석하기 <ArrowRight size={18} />
              </GradientButton>
            </Link>
            <Link href="/guide">
              <GradientButton size="lg" variant="ghost">
                다운로드 방법
              </GradientButton>
            </Link>
          </div>

          {/* 프라이버시 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 glass-strong rounded-2xl p-4 flex items-start gap-3"
          >
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-[13px] leading-relaxed">
              <p className="font-semibold">내 데이터는 어디로도 전송되지 않습니다.</p>
              <p className="text-white/55">
                업로드한 JSON은 서버에 저장되지 않고, 분석은 모두 당신의 기기에서만 진행됩니다.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 기능 카드 */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-md">
          <h2 className="text-sm font-semibold text-white/55 uppercase tracking-widest mb-4">
            무엇을 알 수 있나요
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <GlassCard className="p-4 h-full">
                  <Icon size={20} className="text-ig-pink" />
                  <p className="mt-3 text-[14px] font-semibold">{title}</p>
                  <p className="mt-1 text-[12.5px] text-white/55 leading-relaxed">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 흐름 */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-md">
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/55 uppercase tracking-widest">
              3단계로 끝
            </h2>
            <ol className="mt-4 space-y-4">
              {[
                ['인스타그램 데이터 다운로드 요청', 'JSON 형식으로 신청, 메일로 받음'],
                ['JSON 두 개 업로드', 'following.json + followers_1.json'],
                ['결과 확인', '언팔러 · 맞팔 · 통계가 즉시 표시'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <div className="grid place-items-center w-7 h-7 shrink-0 rounded-full ig-border text-xs font-bold ig-text">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">{t}</p>
                    <p className="text-[12.5px] text-white/55 mt-0.5">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/guide" className="block mt-5">
              <GradientButton variant="outline" size="md" className="w-full">
                자세한 다운로드 가이드 보기
              </GradientButton>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
