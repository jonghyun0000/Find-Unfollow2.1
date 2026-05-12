// types/index.ts
// 인스타그램 데이터 다운로드 시 제공되는 JSON 구조 + 우리 앱 내부 타입

import type { ClassificationVerdict } from '@/lib/classifier';

/**
 * 인스타그램 다운로드 JSON 표준 항목.
 */
export interface InstagramRelationItem {
  title?: string;
  media_list_data?: unknown[];
  string_list_data: Array<{
    href: string;
    value: string;
    timestamp?: number;
  }>;
}

export interface FollowingFile {
  relationships_following: InstagramRelationItem[];
}

export type FollowersFile =
  | InstagramRelationItem[]
  | { relationships_followers: InstagramRelationItem[] };

/**
 * 정규화된 사용자 1명. 분석 후 verdict 가 첨부될 수 있다.
 */
export interface InstaUser {
  username: string;
  href: string;
  followedAt?: number; // unix seconds
  verdict?: ClassificationVerdict; // analyzer 가 채워넣음
}

/**
 * 분류 요약 통계.
 *   - official        : 공식/브랜드/셀럽 계정 수 (정리 대상이 아님)
 *   - inactiveStrong  : 강력 의심 (score ≥ 75)
 *   - inactiveSuspect : 의심 (50 ≤ score < 75)
 *   - inactiveTotal   : 비활성 의심 합계 = 정리 추천 모수
 *   - normal          : 일반 사용자
 *   - total           : 전체
 */
export interface ClassificationSummary {
  official: number;
  inactiveStrong: number;
  inactiveSuspect: number;
  inactiveTotal: number;
  normal: number;
  total: number;
}

/**
 * 분석 결과 한 묶음.
 */
export interface AnalysisResult {
  id: string;
  createdAt: number;

  followers: InstaUser[];
  following: InstaUser[];

  unfollowers: InstaUser[];
  notFollowingBack: InstaUser[]; // alias
  fans: InstaUser[];
  mutuals: InstaUser[];

  /** unfollowers 기준 분류 통계 */
  classificationSummary: ClassificationSummary;
}

/**
 * 변화 추적용 스냅샷 비교 결과.
 */
export interface DiffResult {
  newFollowers: InstaUser[];
  lostFollowers: InstaUser[];
  newFollowing: InstaUser[];
  unfollowedByMe: InstaUser[];
}
