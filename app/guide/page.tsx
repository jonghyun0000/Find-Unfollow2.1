import Link from 'next/link';
import { ExternalLink, FolderOpen, FileJson, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

function Step({
  number,
  title,
  children,
  id,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="glass scroll-mt-24 rounded-2xl p-5">
      <h2 className="flex items-start gap-3 font-semibold">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm text-brand">
          {number}
        </span>
        <span className="pt-0.5">{title}</span>
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <>
      <PageHeader title="인스타그램 파일 다운로드" back />
      <div className="mx-auto max-w-md space-y-5 px-5 py-6">
        <section>
          <h2 className="text-xl font-bold">처음부터 차근차근 따라 해보세요</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            인스타그램에서 내 팔로워·팔로잉 목록을 파일로 받은 뒤, 이 사이트에서 선택하면 됩니다.
            파일 준비에는 시간이 걸릴 수 있어요.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            다운로드할 때는 인스타그램에 로그인해야 합니다. 이 사이트에는 비밀번호를 입력하지
            않습니다.
          </p>
          <nav
            aria-label="다운로드 안내 바로가기"
            className="mt-4 flex flex-wrap gap-2 text-xs font-medium"
          >
            <a className="rounded-full border border-slate-200 bg-white px-3 py-3" href="#request">
              파일 요청하기
            </a>
            <a className="rounded-full border border-slate-200 bg-white px-3 py-3" href="#download">
              이미 요청했어요
            </a>
            <a className="rounded-full border border-slate-200 bg-white px-3 py-3" href="#unzip">
              이미 받았어요
            </a>
          </nav>
        </section>
        <Step number={1} title="인스타그램의 계정 센터를 여세요" id="request">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              인스타그램 앱을 열고 <strong>오른쪽 아래 내 프로필 사진</strong>을 누르세요.
            </li>
            <li>
              프로필 화면 <strong>오른쪽 위 ☰ 메뉴</strong>를 누르세요.
            </li>
            <li>
              설정 화면에서 <strong>계정 센터</strong>를 선택하세요.
            </li>
          </ol>
          <a
            href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-soft px-3 py-3 font-semibold text-brand"
          >
            정보 다운로드 페이지 열기 <ExternalLink size={16} />
            <span className="sr-only">(새 탭)</span>
          </a>
          <p className="text-xs leading-6">
            바로가기에서 로그인 화면이 뜨거나 원하는 메뉴가 안 보이면 위의 앱 경로를 따라가세요.
            컴퓨터에서는 인스타그램의 더 보기 → 설정 → 계정 센터에서 찾을 수 있습니다.
          </p>
        </Step>
        <Step number={2} title="다운로드할 인스타그램 계정을 선택하세요">
          <p>
            <strong>내 정보 및 권한 → 내 정보 내보내기</strong>를 누르세요. 화면에 따라{' '}
            <strong>정보 다운로드</strong> 또는 <strong>정보 다운로드 또는 전송</strong>으로 표시될
            수 있습니다.
          </p>
          <p>
            <strong>내보내기 만들기</strong> 또는 <strong>다운로드 요청</strong>으로 진행한 뒤,
            분석할 <strong>인스타그램 계정</strong>을 선택하세요. 여러 계정이 있으면 아이디를
            확인하세요.
          </p>
          <p>
            저장 위치를 물으면 <strong>기기로 내보내기</strong> 또는{' '}
            <strong>기기에 다운로드</strong>를 선택하세요.
          </p>
        </Step>
        <Step number={3} title="팔로워·팔로잉만 선택하세요">
          <p>
            <strong>정보 맞춤 설정</strong> 또는 <strong>일부 정보</strong>를 여세요. 선택된 항목을
            해제한 뒤, 연결 관계 항목에서 <strong>팔로워 및 팔로잉</strong>을 선택하세요.
          </p>
          <p>
            사진·메시지는 이 분석에 필요하지 않습니다. 항목 선택 화면과 저장 위치 화면의 순서는 앱
            버전에 따라 다를 수 있어요.
          </p>
        </Step>
        <Step number={4} title="기간과 형식을 바꾸고 요청하세요">
          <dl className="overflow-hidden rounded-xl border border-brand/15 bg-brand-soft">
            <div className="flex justify-between border-b border-brand/15 px-4 py-3">
              <dt>날짜 범위</dt>
              <dd className="font-bold text-brand">전체 기간</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt>파일 형식</dt>
              <dd className="font-bold text-brand">JSON</dd>
            </div>
          </dl>
          <p>
            <strong>JSON</strong>은 이 사이트에서 읽을 수 있는 파일 형식입니다. 기본값이{' '}
            <strong>HTML</strong>이면 JSON으로 바꿔주세요.
          </p>
          <p>
            완료 알림을 받을 이메일 등 화면의 요청 내용을 확인한 뒤 <strong>내보내기 시작</strong>{' '}
            또는 <strong>파일 만들기</strong>를 누르세요.
          </p>
          <p className="text-xs leading-6">
            전체 기간을 선택하지 않으면 팔로워가 누락되어 결과가 부정확할 수 있습니다.
          </p>
        </Step>
        <Step number={5} title="준비 완료 알림이 오면 다운로드하세요" id="download">
          <p>
            요청 직후에는 파일이 없을 수 있습니다. 인스타그램 알림이나 이메일로 준비 완료 안내가
            오면, <strong>계정 센터의 같은 다운로드 메뉴</strong>로 돌아가세요.
          </p>
          <p>
            요청한 계정의 파일에서 <strong>다운로드</strong>를 누르세요. 인스타그램이 비밀번호
            확인을 요청할 수 있습니다. 다운로드 가능 기간은 해당 화면의 안내를 확인하세요.
          </p>
          <p>
            보통 파일 이름이 <strong>.zip</strong>으로 끝나는 압축 파일이 저장됩니다. 내려받은
            파일은 다음 단계에서 압축을 풀어주세요.
          </p>
        </Step>
        <Step number={6} title="받은 ZIP 파일의 압축을 푸세요" id="unzip">
          <details className="rounded-xl border border-slate-200 p-3" open>
            <summary className="cursor-pointer font-semibold text-slate-900">
              아이폰 · 아이패드
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong>파일</strong> 앱을 열고 아래쪽 <strong>둘러보기</strong>를 누르세요.
              </li>
              <li>
                <strong>iCloud Drive → 다운로드</strong>를 확인하세요. 없으면{' '}
                <strong>나의 iPhone → 다운로드</strong>나 Safari의 다운로드 목록을 확인하세요.
              </li>
              <li>
                다운로드한 <strong>ZIP 파일을 한 번 누르세요.</strong> 같은 위치에 압축이 풀린
                폴더가 생깁니다.
              </li>
              <li>새로 생긴 폴더를 열고 아래 7단계로 진행하세요.</li>
            </ol>
          </details>
          <details className="rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              안드로이드 · 갤럭시
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong>내 파일</strong> 또는 <strong>Files by Google</strong> 앱을 여세요.
              </li>
              <li>
                <strong>다운로드</strong> 폴더에서 받은 ZIP 파일을 찾으세요.
              </li>
              <li>
                ZIP 파일을 누르고 <strong>압축 풀기</strong> 또는 <strong>추출</strong>을
                선택하세요.
              </li>
              <li>압축을 푼 폴더를 여세요. 메뉴 이름은 사용하는 파일 앱에 따라 다릅니다.</li>
            </ol>
          </details>
          <details className="rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer font-semibold text-slate-900">컴퓨터</summary>
            <p className="mt-3">
              다운로드 폴더에서 ZIP 파일을 찾으세요. Windows에서는 마우스 오른쪽 버튼 → 모두 압축
              풀기, Mac에서는 파일을 두 번 클릭하세요.
            </p>
          </details>
        </Step>
        <Step number={7} title="이 파일들을 선택하면 준비 끝이에요">
          <p>
            압축을 푼 폴더에서 <strong>connections → followers_and_following</strong> 폴더를 차례로
            여세요. 폴더 구조가 다르면 압축을 푼 폴더 안에서 <strong>followers</strong> 또는{' '}
            <strong>following</strong>을 검색하세요.
          </p>
          <div
            className="rounded-xl bg-slate-50 p-4 text-xs leading-7"
            aria-label="선택할 파일 예시"
          >
            <p className="flex items-center gap-2 font-semibold">
              <FolderOpen size={16} />
              followers_and_following
            </p>
            <p className="mt-2 flex items-center gap-2 break-all">
              <FileJson size={16} className="shrink-0" />
              following.json <span className="ml-auto shrink-0 text-brand">팔로잉</span>
            </p>
            <p className="flex items-center gap-2 break-all">
              <FileJson size={16} className="shrink-0" />
              followers_1.json <span className="ml-auto shrink-0 text-brand">팔로워</span>
            </p>
            <p className="mt-2 text-slate-600">
              followers_2.json, followers_3.json 등이 있으면 빠짐없이 함께 선택하세요.
              followers.json처럼 번호 없는 파일일 수도 있습니다.
            </p>
          </div>
          <p>
            아래 <strong>파일 선택하러 가기</strong>를 누른 뒤 <strong>파일 선택하기</strong>에서
            이 파일들을 고르세요. 여러 개를 한 번에 선택하기 어렵다면 버튼을 다시 눌러 하나씩 추가할
            수 있습니다.
          </p>
          <p>
            <strong>인스타그램에서 파일을 만든 날짜</strong>를 확인하고, 모든 파일을 선택했는지
            확인한 뒤 <strong>분석 시작</strong>을 누르세요.
          </p>
        </Step>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-semibold">분석 전에 한 번 더 확인하세요</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-700">
            {[
              '같은 계정에서 한 번에 받은 파일인가요?',
              '기간은 전체 기간, 형식은 JSON인가요?',
              'following 파일과 모든 followers 파일을 골랐나요?',
            ].map((text) => (
              <li className="flex gap-2" key={text}>
                <Check size={18} className="shrink-0 text-emerald-700" />
                {text}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold">여기서 막혔나요?</h2>
          {[
            [
              'JSON 파일이 안 보여요',
              'ZIP 파일의 압축을 먼저 풀었는지 확인하세요. 파일 이름이 .html로 끝나면 인스타그램에서 형식을 JSON으로 바꿔 다시 요청해야 합니다. 이름만 .json으로 바꾸면 읽을 수 없습니다.',
            ],
            [
              '팔로워 파일이 여러 개예요',
              'followers_1.json부터 마지막 번호까지 모두 필요합니다. 하나라도 빠지면 나를 팔로우하는 계정이 결과에서 잘못 표시될 수 있습니다.',
            ],
            [
              '파일을 요청했는데 아직 없어요',
              '인스타그램이 파일을 준비하는 중일 수 있습니다. 준비 완료 안내를 기다린 뒤 같은 다운로드 메뉴를 확인하세요. 이 사이트에서는 준비 시간을 앞당길 수 없습니다.',
            ],
            [
              '파일을 선택할 수 없어요',
              '인스타그램이나 카카오톡 안에서 보고 있다면 Safari 또는 Chrome으로 이 사이트를 여세요. ZIP이나 HTML은 선택할 수 없고 JSON 파일만 선택할 수 있습니다.',
            ],
            [
              '다운로드 메뉴 이름이 달라요',
              '계정 센터 → 내 정보 및 권한에서 다운로드 또는 내보내기 항목을 찾으세요. 언어·앱 버전·계정에 따라 메뉴 이름과 순서가 달라질 수 있습니다.',
            ],
          ].map(([title, body]) => (
            <details key={title} className="glass rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </details>
          ))}
        </section>
        <Link
          href="/upload"
          className="block rounded-2xl primary-action p-4 text-center font-semibold text-white"
        >
          파일 선택하러 가기
        </Link>
        <p className="text-xs leading-6 text-slate-600">
          파일당 20MB, 전체 50MB, 최대 100개 파일을 선택할 수 있습니다. 팔로워와 팔로잉은 각각 최대
          20만 명까지 분석합니다.
        </p>
        <footer className="space-y-2 text-xs leading-6 text-slate-600">
          <p>공식 도움말</p>
          <a
            className="block underline"
            href="https://help.instagram.com/181231772500920"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram 정보 다운로드 안내 (새 탭)
          </a>
          <a
            className="block underline"
            href="https://support.apple.com/ko-kr/102532"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple ZIP 파일 열기 (새 탭)
          </a>
          <a
            className="block underline"
            href="https://support.google.com/files/answer/9048509?hl=ko"
            target="_blank"
            rel="noopener noreferrer"
          >
            Files by Google 압축 해제 (새 탭)
          </a>
        </footer>
      </div>
    </>
  );
}
