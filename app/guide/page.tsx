// app/guide/page.tsx — 인스타 데이터 다운로드 가이드
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Download, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';

const steps = [
  {
    title: '인스타그램 → 설정 진입',
    desc: '프로필 → 우측 상단 메뉴(≡) → "내 활동" 또는 "Accounts Center" → "내 정보 및 권한"',
  },
  {
    title: '"정보 다운로드" 선택',
    desc: '"정보 다운로드" → "정보 다운로드 요청" 클릭',
  },
  {
    title: '항목 / 형식 선택',
    desc: '"일부 정보 선택" → "팔로워 및 팔로잉" 만 체크 → 형식은 반드시 JSON, 기간은 "전체 기간"',
  },
  {
    title: '요청 후 이메일 대기',
    desc: '인스타그램이 ZIP 파일을 메일로 보내줍니다. 보통 몇 분 ~ 몇 시간 소요',
  },
  {
    title: 'ZIP 압축 풀기',
    desc: 'ZIP 안 connections/followers_and_following/ 폴더에 두 파일이 있어요',
  },
  {
    title: '두 파일 업로드',
    desc: 'following.json + followers_1.json 을 이 앱에 그대로 업로드',
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader title="데이터 다운로드 방법" back />

      <div className="mx-auto max-w-md px-5 py-5 space-y-4">
        <PrivacyBadge />

        <GlassCard>
          <div className="flex gap-3 items-start">
            <div className="grid place-items-center w-11 h-11 rounded-2xl bg-ig-soft text-ig-pink shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold">인스타에서 JSON 받는 법</h2>
              <p className="text-[12.5px] text-white/55 mt-1">
                약 6단계, 평균 5~30분이면 받아볼 수 있어요.
              </p>
            </div>
          </div>
        </GlassCard>

        <ol className="space-y-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 flex gap-3"
            >
              <div className="grid place-items-center w-8 h-8 rounded-full ig-border ig-text font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{s.title}</p>
                <p className="text-[12.5px] text-white/55 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* 팁 */}
        <GlassCard>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Check size={14} className="text-emerald-300" /> 꼭 확인하세요
          </h3>
          <ul className="mt-3 space-y-2 text-[13px] text-white/65">
            <li className="flex gap-2"><span className="text-ig-pink">•</span> 형식은 <b className="text-white">반드시 JSON</b>이어야 합니다 (HTML 아님)</li>
            <li className="flex gap-2"><span className="text-ig-pink">•</span> 항목은 "팔로워 및 팔로잉" 만 선택하면 충분해요</li>
            <li className="flex gap-2"><span className="text-ig-pink">•</span> 팔로워가 많으면 followers_2.json, _3.json 식으로 나뉠 수 있어요. 1번 파일만 사용해도 분석은 가능합니다</li>
          </ul>
        </GlassCard>

        {/* 경고 */}
        <GlassCard className="border border-amber-500/20">
          <div className="flex gap-3 items-start">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div className="text-[12.5px] text-white/65 leading-relaxed">
              <b className="text-white">절대 다른 앱에 인스타 비밀번호를 입력하지 마세요.</b><br />
              이 앱은 비밀번호도, 로그인도 요구하지 않습니다. 오직 당신이 직접 받은 JSON 파일만 사용해요.
            </div>
          </div>
        </GlassCard>

        {/* 플랫폼 */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4 text-center">
            <Smartphone size={20} className="mx-auto text-ig-pink" />
            <p className="mt-2 text-[13px] font-semibold">앱에서</p>
            <p className="text-[11.5px] text-white/55">iOS · Android</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Globe size={20} className="mx-auto text-accent-purple" />
            <p className="mt-2 text-[13px] font-semibold">웹에서</p>
            <p className="text-[11.5px] text-white/55">accountscenter.instagram.com</p>
          </GlassCard>
        </div>

        <Link href="/upload" className="block">
          <GradientButton size="lg" className="w-full">
            준비 완료, 분석하기 <ArrowRight size={18} />
          </GradientButton>
        </Link>
      </div>
    </>
  );
}
