# Instagram Color × Liquid Glass 디자인 적용

## 범위와 구조

Next.js App Router, Tailwind, 기존 라우트와 Zustand 상태 관리 구조를 유지한 UI 리디자인입니다. 파서, Worker, 관계 분석, 필터 함수, CSV 생성, 저장 스키마, 통계 이벤트는 수정하지 않았습니다. 기존 문구와 화면의 기능도 유지합니다. 기존 앱은 라이트 모드 전용이므로 새 다크 모드는 추가하지 않았습니다.

## 디자인 토큰과 공통 스타일

- `app/globals.css`: `--instagram-pink/magenta/purple/red/orange/yellow`, `--brand`, `--brand-soft`, `--brand-gradient`, `--cta-gradient`.
- 소재: `--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-highlight`, `--glass-shadow`, `--glass-blur`.
- 가독성: `--surface-primary/secondary`, `--text-primary/secondary`, `--line`, `--chart-secondary`.
- 재사용 스타일: `.glass`, `.glass-strong`, `.glass-control`, `.primary-action`, `.brand-mark`, `.surface-row`, `.page-shell`.
- 기존 `GlassCard`, `GradientButton`, `StatCard`, `PageHeader`, `BottomNav`를 재사용합니다. 목록 행은 블러를 반복하지 않는 가벼운 표면으로 구분합니다.
- 모바일 블러 10px, 기본 16px. 투명도 감소 설정과 블러 미지원 환경은 흰색 표면으로 대체합니다. 모션 감소 설정을 지원하고 버튼 전환은 200ms로 제한합니다.
- Pretendard v1.3.9 가변 글꼴을 자체 호스팅합니다. 출처: https://github.com/orioncactus/pretendard/tree/v1.3.9. SIL OFL 원문을 함께 보관합니다.

## 변경 파일

- 테마: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `public/manifest.webmanifest`.
- 글꼴: `app/fonts/PretendardVariable.woff2`, `app/fonts/OFL.txt`.
- 페이지: `app/page.tsx`, `app/dashboard/page.tsx`, `app/guide/page.tsx`, `app/history/page.tsx`, `app/privacy/page.tsx`, `app/settings/page.tsx`, `app/stats/page.tsx`, `app/upload/page.tsx`.
- 레이아웃: `components/layout/BottomNav.tsx`, `components/layout/PageHeader.tsx`.
- 분석·통계: `components/analysis/AnalysisList.tsx`, `components/analysis/UserList.tsx`, `components/stats/StatCard.tsx`, `components/stats/FollowerChart.tsx`.
- 공통 UI: `components/ui/GradientButton.tsx`, `components/ui/EmptyState.tsx`, `components/upload/DropZone.tsx`, `components/common/InstallGuide.tsx`, `components/common/LoadingSpinner.tsx`, `components/common/ServiceWorker.tsx`, `components/common/StoreHydrator.tsx`.

## 영향과 확인 항목

- 컨테이너 최대 폭이 448px에서 672px로 넓어졌습니다. 작은 화면의 긴 아이디, 파일명, 날짜와 큰 숫자의 줄바꿈을 확인합니다.
- 하단 메뉴는 기존 경로와 선택 판정을 유지합니다. iOS 안전 영역, 브라우저 키보드와 설치창이 열린 상태의 조작을 실기기에서도 확인합니다.
- 글꼴은 약 2MB이며 최초 다운로드 및 오프라인 캐시 용량이 증가합니다. `font-display: swap`으로 시스템 글꼴을 먼저 표시하며 외부 폰트 서버는 호출하지 않습니다.
- 유리 효과는 브라우저에 따라 다릅니다. 저사양 실기기의 스크롤 부드러움과 투명도 감소 설정을 확인합니다.
- 기존 데이터에 없는 프로필 사진·언팔 발생 시점은 추가하지 않았습니다. 계정의 원형 이니셜과 기존 상태 정보를 유지합니다.

## 검증

- 린트·타입 검사·프로덕션 빌드 성공, 단위 테스트 21개 통과.
- Chromium 및 iPhone WebKit에서 기존 E2E 22개 통과: 분석, 파일 오류, 필터, CSV, 저장, 삭제, 기록 비교, 설치 안내, 오프라인 복원, 접근성.
- 360px, 768px, 1440px에서 홈·업로드·가이드·설정·개인정보 화면 가로 넘침 없음. 설치창의 화면 내 배치, 샘플 분석과 런타임 오류 확인.
- 실제 모바일 설치 및 저사양 하드웨어 성능은 브라우저 에뮬레이션만으로 확정할 수 없습니다.
