// lib/classifier.ts
// 사용자 계정 분류 로직.
//
// 핵심 통찰: 인스타에서 "내가 일방 팔로우" 한 계정은 두 가지로 갈린다.
//   A. 의도하고 따른 공식/브랜드/셀럽 계정 — 정리 대상이 아님
//   B. 봇/유령/오래된 무응답 계정 — 정리 후보
//
// 그래서 분류는 두 단계:
//   1) "공식" 카테고리 매칭 (키워드 화이트리스트)
//   2) 공식이 아닌 경우에만 비활성 휴리스틱 점수 적용
//
// 키워드는 한국어 + 영어 둘 다 커버. 사용자 정의 키워드도 받는다.

import type { InstaUser } from '@/types';

/* ============================================================
 * 1) 공식/브랜드/셀럽 카테고리 키워드 매핑
 * ============================================================ */

export type OfficialCategory =
  | 'school'      // 학교
  | 'public'      // 공공기관
  | 'brand'       // 브랜드/공식 스토어
  | 'celeb'       // 연예인/셀럽
  | 'influencer'; // 크리에이터

/**
 * 카테고리별 키워드.
 * 부분 문자열 매칭 (username 정규화 후 includes).
 */
export const OFFICIAL_KEYWORDS: Record<OfficialCategory, string[]> = {
  school: [
    'school', 'academy', 'campus', 'univ', 'university', 'college',
    '초등', '중학교', '고등', '대학교', '대학', '학교', '학생회', '총학생회', '교육청',
  ],
  public: [
    'city', 'county', 'district', 'gov', 'office', 'public', 'hall',
    '구청', '시청', '군청', '주민센터', '행정', '지자체', '공공', '도청', '읍사무소', '면사무소',
  ],
  brand: [
    'official', 'promo', 'promotion', 'marketing', 'brand', 'event',
    'agency', 'press', 'global', 'shop', 'store', 'goods', 'advert', 'pr',
    '공식', '홍보', '브랜드', '이벤트', '스토어', '샵', '마케팅', '오피셜',
  ],
  celeb: [
    'actor', 'actress', 'singer', 'idol', 'artist', 'rapper',
    'comedian', 'celeb', 'star', 'dj',
    '배우', '가수', '아이돌', '연예인', '코미디언', '아티스트', '셀럽', '래퍼',
  ],
  influencer: [
    'influencer', 'creator', 'creater', 'model', 'youtuber',
    'blogger', 'streamer', 'tiktoker', 'reviewer',
    '크리에이터', '인플루언서', '모델', '유튜버', '블로거', '스트리머', '리뷰어',
  ],
};

export const CATEGORY_LABELS: Record<OfficialCategory, string> = {
  school: '학교',
  public: '공공기관',
  brand: '브랜드/공식',
  celeb: '연예인',
  influencer: '크리에이터',
};

export const CATEGORY_COLORS: Record<OfficialCategory, string> = {
  school: 'sky',
  public: 'sky',
  brand: 'sky',
  celeb: 'fuchsia',
  influencer: 'fuchsia',
};

/* ============================================================
 * 2) 정규화 / 매칭 헬퍼
 * ============================================================ */

/**
 * 비교 직전 username을 소문자 + ASCII 숫자/문자만 남기는 식으로 정규화.
 * 한국어는 그대로 둔다 (한글 키워드 매칭을 위해).
 */
function normalize(name: string): string {
  return name.toLowerCase();
}

/**
 * 단일 username 에 대해 어떤 공식 카테고리에 속하는지 판정.
 * 여러 카테고리에 동시 매칭될 수 있다 (예: artist_celeb_official → celeb + brand).
 */
export function detectOfficial(
  username: string,
  customKeywords: string[] = [],
): { categories: OfficialCategory[]; customMatches: string[] } {
  const norm = normalize(username);

  const categories: OfficialCategory[] = [];
  for (const cat of Object.keys(OFFICIAL_KEYWORDS) as OfficialCategory[]) {
    const hit = OFFICIAL_KEYWORDS[cat].some((kw) =>
      norm.includes(kw.toLowerCase()),
    );
    if (hit) categories.push(cat);
  }

  const customMatches = customKeywords
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
    .filter((k) => norm.includes(k));

  return { categories, customMatches };
}

/**
 * 가장 대표적인 카테고리 하나만 (UI에 단일 배지 표시용).
 * 우선순위: public > school > brand > celeb > influencer
 */
export function primaryCategory(cats: OfficialCategory[]): OfficialCategory | null {
  const order: OfficialCategory[] = ['public', 'school', 'brand', 'celeb', 'influencer'];
  for (const c of order) if (cats.includes(c)) return c;
  return null;
}

/* ============================================================
 * 3) 비활성/봇 휴리스틱
 *    (이전 inactivity.ts 의 개선판)
 * ============================================================ */

const VOWELS = /[aeiou]/i;

interface InactivityComponents {
  score: number;
  reasons: string[];
}

/**
 * username 패턴 기반 봇 점수 (0 ~ 70).
 * 주의:
 *   - "official" 키워드 자체는 더 이상 봇 신호가 아니다.
 *     공식 카테고리 매칭으로 처리되기 때문.
 *   - 대신 "랜덤 문자열 + 숫자" 패턴은 그대로 유지.
 */
function scoreFromUsername(name: string): InactivityComponents {
  const lower = name.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // 1) 4자리 이상 연속 숫자 — 자동 생성 흔적
  if (/\d{4,}/.test(lower)) {
    score += 35;
    reasons.push('숫자 4자리+');
  } else if (/\d{2,3}$/.test(lower)) {
    score += 12;
    reasons.push('숫자로 끝남');
  }

  // 2) 비정상적으로 긴 ID
  if (lower.length >= 22) {
    score += 18;
    reasons.push('너무 긴 ID');
  }

  // 3) 모음 없음 (영문 6자 이상)
  const asciiOnly = lower.replace(/[^a-z]/g, '');
  if (asciiOnly.length >= 6 && !VOWELS.test(asciiOnly)) {
    score += 25;
    reasons.push('모음 없는 랜덤 문자열');
  }

  // 4) 자동생성 패턴: name_숫자, _숫자_
  if (/^[a-z]+_\d{2,}$/i.test(lower) || /_\d{2,}_/.test(lower)) {
    score += 22;
    reasons.push('자동생성 패턴');
  }

  // 5) "bot" 직접 포함 (드물지만 명확)
  if (/\bbot\b/i.test(lower) || /_bot/i.test(lower) || /^bot/i.test(lower)) {
    score += 35;
    reasons.push('"bot" 키워드');
  }

  // 6) 점 너무 많음 (3개 이상)
  const dots = (lower.match(/\./g) ?? []).length;
  if (dots >= 3) {
    score += 12;
    reasons.push('점 너무 많음');
  }

  // 7) 자음 5개+ 연속 (랜덤 키스매시)
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(asciiOnly)) {
    score += 15;
    reasons.push('자음 연속');
  }

  // 8) 글자가 모두 숫자 (인스타에서 매우 드문 패턴)
  if (/^\d+$/.test(lower)) {
    score += 30;
    reasons.push('숫자만으로 구성');
  }

  return { score: Math.min(70, score), reasons };
}

/**
 * 무응답 기간 점수 (0 ~ 30).
 */
function scoreFromAge(followedAt?: number): InactivityComponents {
  if (!followedAt) return { score: 0, reasons: [] };
  const days = (Date.now() / 1000 - followedAt) / 86400;
  if (days < 0) return { score: 0, reasons: [] };

  if (days >= 730) return { score: 30, reasons: ['2년+ 무응답'] };
  if (days >= 365) return { score: 22, reasons: ['1년+ 무응답'] };
  if (days >= 180) return { score: 10, reasons: ['6개월+ 무응답'] };
  return { score: 0, reasons: [] };
}

/* ============================================================
 * 4) 통합 분류기
 * ============================================================ */

export type AccountKind = 'official' | 'inactive' | 'normal';
export type InactivityLevel = 'healthy' | 'suspect' | 'strong';

export interface ClassificationVerdict {
  /** 최상위 분류 — UI 배지 결정에 사용 */
  kind: AccountKind;

  /** 공식 계정인 경우 매칭된 카테고리들 */
  officialCategories: OfficialCategory[];
  /** 사용자가 직접 추가한 키워드 매칭 */
  customMatches: string[];

  /** 비활성 점수 (0~100) — 공식이 아닐 때만 의미 있음 */
  inactivityScore: number;
  inactivityLevel: InactivityLevel;
  inactivityReasons: string[];
}

export interface ClassifyOptions {
  /** unfollowers 처럼 "나만 따르는" 그룹에서만 무응답 페널티 적용 */
  applyAgePenalty?: boolean;
  /** 사용자가 직접 추가한 보호 키워드 (이 키워드 매칭 시 official 처리) */
  customOfficialKeywords?: string[];
}

/**
 * 통합 분류:
 *   1) 공식 카테고리 키워드 매칭 → 매칭되면 kind='official' (비활성 점수 무시)
 *   2) 매칭 없으면 비활성 휴리스틱 적용 → 50점 이상이면 kind='inactive'
 *   3) 둘 다 아니면 kind='normal'
 */
export function classify(
  user: InstaUser,
  opts: ClassifyOptions = {},
): ClassificationVerdict {
  const { applyAgePenalty = true, customOfficialKeywords = [] } = opts;

  const { categories, customMatches } = detectOfficial(
    user.username,
    customOfficialKeywords,
  );
  const isOfficial = categories.length > 0 || customMatches.length > 0;

  // 공식 매칭 시 비활성 판정은 건너뜀 (false positive 방지)
  if (isOfficial) {
    return {
      kind: 'official',
      officialCategories: categories,
      customMatches,
      inactivityScore: 0,
      inactivityLevel: 'healthy',
      inactivityReasons: [],
    };
  }

  // 공식이 아닐 때만 비활성 점수 계산
  const u = scoreFromUsername(user.username);
  const a = applyAgePenalty ? scoreFromAge(user.followedAt) : { score: 0, reasons: [] };
  const score = Math.min(100, u.score + a.score);
  const level: InactivityLevel = score >= 75 ? 'strong' : score >= 50 ? 'suspect' : 'healthy';

  return {
    kind: score >= 50 ? 'inactive' : 'normal',
    officialCategories: [],
    customMatches: [],
    inactivityScore: score,
    inactivityLevel: level,
    inactivityReasons: [...u.reasons, ...a.reasons],
  };
}

/**
 * 배열 일괄 분류. 결과 객체에 verdict 첨부.
 */
export function annotate<T extends InstaUser>(
  users: T[],
  opts?: ClassifyOptions,
): Array<T & { verdict: ClassificationVerdict }> {
  return users.map((u) => ({ ...u, verdict: classify(u, opts) }));
}

/**
 * 그룹 통계 (대시보드/통계 페이지용).
 */
export function classificationSummary(
  users: InstaUser[],
  opts?: ClassifyOptions,
) {
  let official = 0;
  let inactiveStrong = 0;
  let inactiveSuspect = 0;
  let normal = 0;

  for (const u of users) {
    const v = classify(u, opts);
    if (v.kind === 'official') official++;
    else if (v.inactivityLevel === 'strong') inactiveStrong++;
    else if (v.inactivityLevel === 'suspect') inactiveSuspect++;
    else normal++;
  }

  return {
    official,
    inactiveStrong,
    inactiveSuspect,
    inactiveTotal: inactiveStrong + inactiveSuspect,
    normal,
    total: users.length,
  };
}
