import { ShareService } from '@/components/common/ShareService';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, History, Download, ScanLine } from 'lucide-react';
import { InstallGuide } from '@/components/common/InstallGuide';
const features = [
  { icon: Users, title: '맞팔 관계 한눈에', body: '나를 팔로우하지 않는 계정부터 맞팔까지.' },
  { icon: History, title: '달라진 팔로워 확인', body: '지난 기록과 비교해 변화를 확인해요.' },
  { icon: Download, title: '찾고, 저장하고', body: '아이디로 검색하고 목록을 파일로 저장하세요.' },
];
export default function LandingPage() {
  return (
    <div className="page-shell pb-8 pt-7">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl brand-mark text-white">
            <ScanLine size={21} />
          </span>
          Unfollow Lens
        </Link>
        <Link href="/guide" className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600">
          사용 가이드
        </Link>
      </header>
      <section className="landing-hero pb-8 pt-12 sm:pb-10 sm:pt-16">
        <p className="flex items-center gap-2 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          무료로, 로그인 없이
        </p>
        <h1 className="mt-5 text-[38px] font-bold leading-[1.25] tracking-[-0.04em] sm:text-5xl">
          내 팔로우 관계,
          <br />
          <span className="text-brand">한눈에 깔끔하게.</span>
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          인스타그램 데이터를 올리면
          <br />
          맞팔 목록과 팔로워 변화를 정리해드려요.
        </p>
        <Link
          href="/upload"
          className="primary-action mt-7 flex min-h-14 items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold"
        >
          내 데이터 분석하기 <ArrowRight size={18} />
        </Link>
        <Link
          href="/guide"
          className="mt-3 flex min-h-11 items-center justify-center gap-1 text-sm text-slate-600"
        >
          파일이 아직 없나요? <span className="font-semibold text-brand">다운로드 방법</span>
          <ArrowRight size={14} />
        </Link>
      </section>
      <InstallGuide />
      <div className="mt-3">
        <ShareService />
      </div>
      <section className="mt-8" aria-labelledby="features">
        <h2 id="features" className="mb-4 text-sm font-semibold">
          필요한 정보만, 간단하게
        </h2>
        <div className="glass overflow-hidden rounded-3xl">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="flex items-center gap-4 border-b border-slate-100 p-5 last:border-0"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-brand">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="mt-6 flex gap-2 px-1">
        <ShieldCheck size={18} className="shrink-0 text-emerald-700" />
        <p className="text-xs leading-relaxed text-slate-600">
          파일은 이 기기에서만 분석해요. 비밀번호를 요구하지 않고, 기록은 저장을 선택할 때만
          브라우저에 보관합니다.
        </p>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-slate-600">
        현재 맞팔 여부만으로 과거의 언팔을 알 수는 없습니다. 기록에서 계정이 사라지는 원인에는
        아이디 변경·삭제·비활성화도 있습니다. Instagram 또는 Meta와 제휴한 서비스가 아닙니다.
      </p>
      <footer className="mt-5 flex gap-5 text-xs text-slate-600">
        <Link className="underline underline-offset-4" href="/privacy">
          데이터 처리 안내
        </Link>
        <a
          className="underline underline-offset-4"
          href="https://github.com/jonghyun0000/Find-Unfollow2.1/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          문제 제보 (새 탭)
        </a>
      </footer>
    </div>
  );
}
