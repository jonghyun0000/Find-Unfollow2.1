import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, History, Download } from 'lucide-react';
const features = [
  {
    icon: Users,
    title: '현재 팔로우 관계',
    body: '나를 안 따르는 계정, 내가 안 따르는 계정, 맞팔 목록을 확인하세요.',
  },
  {
    icon: History,
    title: '지난 기록과 비교',
    body: '같은 계정의 두 기준일을 비교해 새 팔로워와 사라진 팔로워를 찾으세요.',
  },
  {
    icon: Download,
    title: '전체 목록 내보내기',
    body: '빠르게 검색하고 모든 결과를 CSV로 내려받으세요.',
  },
];
export default function LandingPage() {
  return (
    <div className="mx-auto max-w-md px-5 pt-12 pb-8">
      <p className="inline-flex rounded-full glass px-3 py-2 text-xs text-white/75">
        Unfollow Lens · 무료 · 로그인 없이
      </p>
      <h1 className="mt-6 text-[38px] font-bold leading-tight tracking-tight">
        내 팔로우 관계,
        <br />
        <span className="ig-text">데이터로 확인하세요.</span>
      </h1>
      <p className="mt-5 text-base leading-relaxed text-white/70">
        인스타그램에서 내려받은 JSON 파일로 맞팔과 팔로워 변화를 확인하세요. 파일 내용은 서버로
        전송되지 않습니다.
      </p>
      <div className="mt-7 space-y-3">
        <Link
          href="/upload"
          className="flex justify-center items-center gap-2 rounded-2xl bg-ig-gradient p-4 font-semibold"
        >
          내 데이터 분석하기 <ArrowRight size={18} />
        </Link>
        <Link
          href="/guide"
          className="block rounded-2xl border border-white/20 p-4 text-center font-medium"
        >
          데이터 다운로드 방법
        </Link>
      </div>
      <div className="glass-strong mt-6 rounded-2xl p-4 flex gap-3">
        <ShieldCheck className="shrink-0 text-emerald-300" size={22} />
        <p className="text-sm leading-relaxed text-white/70">
          비밀번호를 요구하지 않습니다. 기록 저장을 선택한 경우에만 이 브라우저에 보관하고, 설정에서
          언제든 삭제할 수 있습니다.
        </p>
      </div>
      <section className="mt-10 space-y-3" aria-labelledby="features">
        <h2 id="features" className="text-lg font-semibold">
          확인할 수 있는 정보
        </h2>
        {features.map(({ icon: Icon, title, body }) => (
          <article key={title} className="glass rounded-2xl p-5">
            <Icon size={20} className="text-ig-pink" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
          </article>
        ))}
      </section>
      <p className="mt-6 text-xs leading-relaxed text-white/55">
        현재 맞팔하지 않는다는 사실만으로 과거의 언팔을 알 수는 없습니다. 기록 비교에서 계정이
        사라지는 원인에는 아이디 변경·삭제·비활성화도 있습니다. 이 서비스는 Instagram 또는 Meta와
        제휴한 서비스가 아닙니다.
      </p>
      <footer className="mt-6 flex gap-5 text-sm text-white/65">
        <Link className="underline" href="/privacy">
          데이터 처리 안내
        </Link>
        <a
          className="underline"
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
