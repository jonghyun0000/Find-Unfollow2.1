# Unfollow Lens · 인스타그램 언팔러 분석 PWA

> **모든 분석은 당신의 브라우저 안에서만 일어납니다. 서버 전송, 광고, 트래커 일체 없음.**

Next.js 14 (App Router) + TypeScript + TailwindCSS + Framer Motion + Zustand + Recharts 로 만든 풀 PWA 입니다.
인스타그램에서 받은 `following.json` / `followers_1.json` 두 파일을 업로드하면 즉시 분석합니다.

---

## ✨ 주요 기능

- **언팔러 추적** : 내가 팔로우 했지만 나를 안 따르는 사람 (following − followers)
- **외사랑 추적** : 나를 팔로우 하지만 내가 안 따른 사람 (followers − following)
- **맞팔 친구만 모아보기**
- **최근 언팔 / 새 팔로워 추적** (이전 분석과 비교)
- **팔로워 변화 추이 차트** (Recharts)
- **검색** · **CSV 다운로드** · **다크/라이트 모드**
- **PWA** — 홈화면 추가 / 오프라인 지원 / 앱처럼 실행
- **드래그앤드롭 파일 업로드**
- **샘플 데이터로 즉시 체험 가능**
- **분석 기록 자동 저장** (localStorage, 최대 10개)

## 🎨 디자인

- 보라(#833AB4) · 핑크(#E1306C) · 블랙(#08070D) 글래스모피즘
- 인스타그램 그라데이션 + Apple 스타일 미니멀 타이포
- Pretendard Variable 한국어 폰트
- 모바일 퍼스트, 하단 네비게이션, SafeArea 대응

---

## 🚀 빠른 시작

```bash
# 1) 패키지 설치
npm install

# 2) 개발 서버
npm run dev
# → http://localhost:3000

# 3) 프로덕션 빌드
npm run build && npm run start

# 4) 타입 체크
npm run type-check
```

Node.js 18.18+ 필요.

## 📦 의존성

| 카테고리 | 패키지 |
|---|---|
| 프레임워크 | `next@14.2`, `react@18`, `typescript@5` |
| 스타일 | `tailwindcss@3.4`, `clsx`, `tailwind-merge` |
| 모션 | `framer-motion@11` |
| 상태 | `zustand@4` |
| 차트 | `recharts@2.12` |
| 아이콘 | `lucide-react` |

---

## 📁 프로젝트 구조

```
insta-analyzer/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (다크모드, 하단 네비, PWA 메타)
│   ├── page.tsx                  # 1) 랜딩 페이지
│   ├── upload/page.tsx           # 2) 파일 업로드 (드래그앤드롭, 샘플 체험)
│   ├── dashboard/page.tsx        # 3) 분석 결과 대시보드
│   ├── unfollowers/page.tsx      # 4) 언팔러 / 외사랑 리스트 (세그먼트)
│   ├── mutual/page.tsx           # 5) 맞팔 친구 리스트
│   ├── stats/page.tsx            # 6) 통계 페이지 (차트 + 비율)
│   ├── settings/page.tsx         # 7) 설정 (테마, 데이터 삭제, 프라이버시)
│   ├── guide/page.tsx            # 인스타 데이터 다운로드 가이드
│   ├── history/page.tsx          # 분석 기록 보기
│   └── globals.css               # 글래스모피즘, 폰트, 다크모드
│
├── components/
│   ├── analysis/
│   │   ├── SearchBar.tsx
│   │   └── UserList.tsx          # UserCard + UserList (그라디언트 아바타)
│   ├── common/
│   │   ├── LoadingSpinner.tsx    # 인스타 그라데이션 스피너
│   │   ├── PrivacyBadge.tsx      # "내 데이터는 저장되지 않습니다"
│   │   ├── StoreHydrator.tsx     # localStorage → zustand 부팅 시 동기화
│   │   └── ThemeProvider.tsx     # 다크/라이트 토글
│   ├── layout/
│   │   ├── BottomNav.tsx         # 모바일 하단 5탭 네비
│   │   └── PageHeader.tsx        # 공통 헤더(뒤로가기 + 제목 + 우측 액션)
│   ├── stats/
│   │   ├── FollowerChart.tsx     # Recharts AreaChart
│   │   └── StatCard.tsx          # 변화량 + 그라데이션 강조
│   ├── ui/
│   │   ├── EmptyState.tsx        # 빈 상태 UI (아이콘 + CTA)
│   │   ├── GlassCard.tsx
│   │   ├── GradientButton.tsx
│   │   └── Skeleton.tsx          # 로딩 스켈레톤
│   └── upload/
│       └── DropZone.tsx          # 드래그앤드롭 + 클릭 업로드
│
├── lib/
│   ├── analyzer.ts               # 핵심 차집합/교집합 + diff 로직
│   ├── csv.ts                    # CSV 다운로드 (UTF-8 BOM)
│   ├── parser.ts                 # JSON 파싱 + 파일 타입 자동 감지
│   ├── storage.ts                # localStorage 래퍼 (서버 전송 없음)
│   ├── sample-data.ts            # 샘플 체험용 더미 데이터
│   └── cn.ts                     # className 유틸 (clsx + tailwind-merge)
│
├── store/
│   └── useAnalysisStore.ts       # Zustand 전역 상태
│
├── types/
│   └── index.ts                  # 인스타 JSON 스키마 + 내부 타입
│
├── public/
│   ├── manifest.webmanifest      # PWA 매니페스트
│   ├── sw.js                     # 서비스 워커 (offline 지원)
│   ├── robots.txt
│   └── icons/                    # 192/512 SVG 앱 아이콘
│
├── tailwind.config.ts            # 인스타 그라데이션, 글래스, 애니메이션
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🧠 분석 로직 (lib/analyzer.ts)

```text
following  = JSON 안의 relationships_following 배열
followers  = JSON 안의 relationships_followers 배열 (또는 그냥 배열)

unfollowers = following − followers   ← 내가 팔로우, 상대는 안 따름
fans        = followers − following   ← 상대만 팔로우 (내가 외사랑 받는 중)
mutuals     = following ∩ followers   ← 진짜 친구

(이전 분석과 비교)
lostFollowers = prev.followers − curr.followers   ← 최근 언팔러
newFollowers  = curr.followers − prev.followers   ← 새 팔로워
```

`username` 기준 `Map` 인덱싱으로 O(n) 비교. 유저 1만명도 100ms 내 처리됩니다.

---

## 🛡️ 보안 / 프라이버시

- 업로드된 JSON은 `FileReader`로 읽어 메모리에서만 처리. **서버 전송 없음.**
- 분석 결과는 `localStorage` 키 `insta-analyzer:v1` 에만 저장 (최대 10개)
- 외부 API 호출 일체 없음 (트래커, 광고 SDK, 분석 도구 모두 미설치)
- 설정 페이지에서 한 번에 모든 기록 삭제 가능

---

## 📲 PWA 설치

1. iPhone Safari : 공유 → "홈화면에 추가"
2. Android Chrome : 우측 상단 메뉴 → "앱 설치"
3. 데스크탑 Chrome : 주소창 우측 설치 아이콘

홈화면 아이콘에서 실행하면 풀스크린 앱처럼 동작하고, 한 번 방문 후엔 오프라인에서도 열립니다.

---

## ☁️ Vercel 배포

```bash
# 1) GitHub에 푸시
git init && git add . && git commit -m "init: unfollow lens"
git remote add origin https://github.com/<your>/insta-analyzer.git
git push -u origin main

# 2) Vercel 연결
#    https://vercel.com/new → GitHub 저장소 import
#    Framework: Next.js (자동 인식)
#    Build Command: npm run build (기본값)
#    Output Directory: .next (기본값)
#    환경변수: 없음
```

또는 CLI:

```bash
npm i -g vercel
vercel
```

배포 후 자동으로 HTTPS가 적용되어 PWA 설치 조건을 만족합니다.

---

## 🧪 샘플 데이터 체험

업로드 페이지에서 "샘플 데이터로 체험해보기" 버튼을 누르면 미리 준비된 더미 JSON으로 즉시 분석을 볼 수 있습니다. (이 결과는 localStorage에 저장되지 않습니다.)

---

## 🛣️ 추후 확장 아이디어

| 영역 | 아이디어 |
|---|---|
| 분석 | 차단 목록(`blocked_accounts.json`) 비교, 가까운 친구 분석, 휴면 계정 감지 |
| 시각화 | 관계 네트워크 그래프 (D3 force-directed), 워드클라우드 |
| UX | 그룹 라벨링 (지인/회사/관심사), 즐겨찾기 |
| 자동화 | 주기적 알림 ("매주 일요일 분석 리마인더" - Notification API) |
| 공유 | 결과 카드 이미지 내보내기 (html-to-image), 익명화된 통계만 공유 |
| 다국어 | i18n (next-intl), 영어/일본어 |
| 보관 | IndexedDB 마이그레이션 (10개 제한 → 무제한) |

---

## 📄 라이선스

MIT License — 자유롭게 수정/배포 가능합니다.

---

## 💌 만든 사람

Made with 💗 for clean Instagram lists.
