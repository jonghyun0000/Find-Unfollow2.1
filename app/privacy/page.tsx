import { PageHeader } from '@/components/layout/PageHeader';
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="데이터 처리 안내" back />
      <article className="page-shell py-6 space-y-6 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">파일은 기기에서 분석합니다</h2>
          <p className="mt-2">
            선택한 인스타그램 JSON 파일과 계정 아이디는 브라우저 안에서만 처리합니다. 파일 내용이나
            분석 결과를 서비스 서버로 업로드하지 않습니다. 이 사이트에서 인스타그램 로그인이나
            비밀번호 입력을 요구하지 않습니다. 인스타그램에서 원본 파일을 받을 때는 로그인이
            필요합니다.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">저장은 선택할 수 있습니다</h2>
          <p className="mt-2">
            업로드 화면에서 기록 저장을 선택하면 아이디, 데이터 기준일, 팔로워·팔로잉 목록을 이
            브라우저에 계정별로 최대 10개 기록을 보관합니다. 이전 버전에서 저장한 기록은 가능한 경우
            자동으로 옮깁니다. 공용 기기에서는 저장하지 않는 것을 권장합니다.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">삭제와 보관</h2>
          <p className="mt-2">
            분석 기록 화면에서 개별 기록을 삭제하거나 설정에서 모든 기록을 삭제할 수 있습니다.
            브라우저의 사이트 데이터를 삭제해도 지워집니다. 브라우저가 공간 확보를 위해 기록을
            제거할 수 있으므로 원본 내보내기 파일은 따로 보관하세요. 다운로드한 CSV 파일은 기기에서
            직접 삭제해야 합니다.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">익명 사용 통계</h2>
          <p className="mt-2">
            서비스 개선을 위해 Vercel Web Analytics로 방문 페이지, 접속 경로, 브라우저·기기 종류,
            국가 수준의 대략적인 지역과 분석 완료·공유 버튼·설치 수락·홈 화면 실행 여부를 확인할 수
            있습니다. 제3자 광고 쿠키를 사용하지 않으며 통계로 개인을 식별하려고 하지 않습니다.
            인스타그램 아이디, 파일 이름과 내용, 팔로워·팔로잉 목록, 분석 인원수와 결과는 통계에
            보내지 않습니다. 주소의 검색어와 해시 값도 전송 전에 제거합니다. 자세한 처리 방식은{' '}
            <a
              className="underline"
              href="https://vercel.com/docs/analytics/privacy-policy"
              rel="noopener noreferrer"
              target="_blank"
            >
              Vercel Web Analytics 개인정보 안내 (새 탭)
            </a>
            에서 확인할 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">네트워크 연결</h2>
          <p className="mt-2">
            웹페이지와 앱 파일을 받기 위해 호스팅 서버에 연결합니다. 요청에 따른 일반적인 접속
            정보는 호스팅 환경에서 처리될 수 있습니다. 외부 폰트는 사용하지 않습니다. 계정 링크를
            누르면 Instagram이 새 탭에서 열리며 해당 사이트의 정책이 적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">결과의 한계</h2>
          <p className="mt-2">
            분석은 제공한 파일에만 의존하며 실시간 정보가 아닙니다. 기록에서 사라진 계정은 언팔
            외에도 아이디 변경·삭제·비활성화일 수 있습니다. 계정 활동 여부나 공식 인증 여부를
            추정하지 않습니다. Instagram 또는 Meta와 제휴한 서비스가 아닙니다.
          </p>
        </section>
        <p>
          문제 제보:{' '}
          <a
            className="underline"
            href="https://github.com/jonghyun0000/Find-Unfollow2.1/issues"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub 이슈 (새 탭)
          </a>
          . 원본 JSON이나 다른 사람의 아이디를 공개 이슈에 첨부하지 마세요.
        </p>
      </article>
    </>
  );
}
