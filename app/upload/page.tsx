// app/upload/page.tsx — 파일 업로드 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, FlaskConical } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DropZone } from '@/components/upload/DropZone';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { detectFileKind, parseFollowers, parseFollowing, safeParseJSON } from '@/lib/parser';
import { analyze } from '@/lib/analyzer';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { SAMPLE_FOLLOWERS_JSON, SAMPLE_FOLLOWING_JSON } from '@/lib/sample-data';

export default function UploadPage() {
  const router = useRouter();
  const setCurrent = useAnalysisStore((s) => s.setCurrent);

  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  /**
   * 파일을 텍스트로 읽어 JSON 으로 파싱.
   */
  const readFile = (f: File) =>
    new Promise<unknown>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(safeParseJSON(String(reader.result ?? ''))); }
        catch (e) { reject(e); }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(f);
    });

  const runAnalysis = async () => {
    setError(null);
    if (!followingFile || !followersFile) {
      setError('두 파일을 모두 업로드해주세요. (following.json, followers_1.json)');
      return;
    }

    setRunning(true);
    try {
      const [rawA, rawB] = await Promise.all([
        readFile(followingFile),
        readFile(followersFile),
      ]);

      // 사용자가 두 슬롯을 바꿔 넣더라도 자동 보정
      const kindA = detectFileKind(rawA, followingFile.name);
      const kindB = detectFileKind(rawB, followersFile.name);

      let followingRaw: unknown = rawA;
      let followersRaw: unknown = rawB;
      if (kindA === 'followers' && kindB === 'following') {
        followingRaw = rawB;
        followersRaw = rawA;
      } else if (kindA === 'unknown' || kindB === 'unknown') {
        // 그냥 신뢰: 사용자가 올린 슬롯 위치를 따름
      }

      const following = parseFollowing(followingRaw);
      const followers = parseFollowers(followersRaw);

      if (!following.length && !followers.length) {
        setError('파일 형식을 인식할 수 없습니다. 인스타그램에서 받은 JSON 파일이 맞는지 확인해주세요.');
        setRunning(false);
        return;
      }

      // 시각적으로 분석 중인 게 보이도록 살짝 지연
      await new Promise((r) => setTimeout(r, 700));
      const result = analyze(following, followers);
      setCurrent(result);
      router.push('/dashboard');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      setError(msg);
      setRunning(false);
    }
  };

  const runSample = async () => {
    setRunning(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    const following = parseFollowing(SAMPLE_FOLLOWING_JSON);
    const followers = parseFollowers(SAMPLE_FOLLOWERS_JSON);
    const result = analyze(following, followers);
    setCurrent(result, { persist: false }); // 샘플은 저장하지 않음
    router.push('/dashboard');
  };

  return (
    <>
      <PageHeader title="파일 업로드" subtitle="JSON 두 개를 올려주세요" back />

      <div className="mx-auto max-w-md px-5 py-6 space-y-5">
        <PrivacyBadge />

        <AnimatePresence>
          {running ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-3xl p-10 flex flex-col items-center"
            >
              <LoadingSpinner size={72} label="분석 중... 잠시만요" />
              <p className="mt-3 text-[12px] text-white/45 text-center">
                서버로 업로드되지 않습니다. 모든 처리는 이 기기에서만 일어납니다.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <DropZone
                label="following.json"
                hint="내가 팔로우 한 사람 목록"
                file={followingFile}
                onFileChange={setFollowingFile}
              />
              <DropZone
                label="followers_1.json"
                hint="나를 팔로우 한 사람 목록"
                file={followersFile}
                onFileChange={setFollowersFile}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-start glass rounded-2xl p-4 border border-rose-500/30"
                >
                  <AlertTriangle size={16} className="text-rose-300 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-rose-200">{error}</p>
                </motion.div>
              )}

              <GradientButton onClick={runAnalysis} size="lg" className="w-full" disabled={!followingFile || !followersFile}>
                <Sparkles size={18} /> 분석 시작
              </GradientButton>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] uppercase tracking-widest text-white/40 bg-ink-950">
                    또는
                  </span>
                </div>
              </div>

              <GradientButton onClick={runSample} size="md" variant="ghost" className="w-full">
                <FlaskConical size={16} /> 샘플 데이터로 체험해보기
              </GradientButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
