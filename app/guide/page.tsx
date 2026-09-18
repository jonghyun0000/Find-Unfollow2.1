import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
const steps = [
  [
    '내 정보 내보내기 열기',
    '인스타그램 설정의 계정 센터에서 내 정보 및 권한 → 정보 다운로드 또는 내보내기를 찾으세요. 메뉴 이름은 앱 버전에 따라 다를 수 있습니다.',
  ],
  [
    '같은 계정의 전체 기간 선택',
    '분석할 계정을 선택하고 팔로워 및 팔로잉 항목을 요청하세요. 날짜 범위는 반드시 전체 기간, 파일 형식은 JSON으로 선택하세요.',
  ],
  [
    '파일 준비 후 다운로드',
    '인스타그램의 준비 완료 안내에 따라 파일을 기기에 내려받고 ZIP 압축을 풀어주세요. 준비 시간은 계정마다 다릅니다.',
  ],
  [
    '모든 관계 파일 선택',
    'connections/followers_and_following 폴더의 following.json과 followers_1.json, followers_2.json 등 모든 팔로워 파일을 함께 선택하세요.',
  ],
  [
    '계정과 데이터 기준일 확인',
    '내 아이디와 데이터가 생성된 날짜를 입력하세요. 이전 기록과 비교하려면 같은 아이디를 입력하고 이 기기에 기록 저장을 선택하세요.',
  ],
];
export default function GuidePage() {
  return (
    <>
      <PageHeader title="데이터 다운로드 방법" back />
      <div className="mx-auto max-w-md px-5 py-6 space-y-5">
        <ol className="space-y-4">
          {steps.map(([title, body], i) => (
            <li className="glass rounded-2xl p-5" key={title}>
              <h2 className="font-semibold">
                <span className="text-pink-700 mr-2">{i + 1}.</span>
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm leading-relaxed">
          <h2 className="font-semibold text-amber-700">파일이 빠지면 결과가 달라집니다</h2>
          <p className="mt-2 text-slate-600">
            팔로워가 여러 파일로 나뉘었다면 1번 파일만으로 분석하지 마세요. 누락된 팔로워가 나를 안
            따르는 계정으로 표시됩니다. 서로 다른 계정이나 날짜의 파일을 섞지 마세요. 앱은 마지막
            파일 누락이나 계정 소유자를 자동으로 확인할 수 없습니다.
          </p>
        </div>
        <p className="text-sm text-slate-600">
          JSON만 지원합니다. HTML·ZIP 파일은 먼저 올바른 형식으로 준비해주세요. 파일당 20MB, 전체
          50MB, 최대 100개 파일, 팔로워와 팔로잉 각각 20만 명까지 처리합니다.
        </p>
        <Link
          href="/upload"
          className="block rounded-2xl bg-brand text-white p-4 text-center font-semibold"
        >
          파일 준비 완료, 분석하기
        </Link>
      </div>
    </>
  );
}
