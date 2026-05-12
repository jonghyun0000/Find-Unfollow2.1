// lib/analyzer.ts
// 핵심 분석 로직.
//   1) 차집합/교집합으로 unfollowers / fans / mutuals 산출
//   2) 각 그룹에 분류기(classifier) 적용하여 verdict 첨부
//   3) 이전 분석과의 diff 계산

import type {
  AnalysisResult,
  ClassificationSummary,
  DiffResult,
  InstaUser,
} from '@/types';
import {
  annotate,
  classificationSummary,
  type ClassifyOptions,
} from '@/lib/classifier';

/**
 * username 기준 Set 인덱스를 만들어 O(n) 비교가 가능하게 함.
 */
function indexByUsername(users: InstaUser[]): Map<string, InstaUser> {
  const map = new Map<string, InstaUser>();
  for (const u of users) {
    const existing = map.get(u.username);
    if (!existing) {
      map.set(u.username, u);
      continue;
    }
    if ((u.followedAt ?? 0) > (existing.followedAt ?? 0)) {
      map.set(u.username, u);
    }
  }
  return map;
}

const byRecent = (a: InstaUser, b: InstaUser) =>
  (b.followedAt ?? 0) - (a.followedAt ?? 0) || a.username.localeCompare(b.username);

/**
 * 메인 분석.
 *   - unfollowers: following − followers (내가 일방 팔로우, 무응답 페널티 적용)
 *   - fans:        followers − following (상대만 팔로우, 무응답 페널티 X)
 *   - mutuals:     intersection         (맞팔, 무응답 페널티 X)
 */
export function analyze(
  following: InstaUser[],
  followers: InstaUser[],
  customOfficialKeywords: string[] = [],
): AnalysisResult {
  const followingMap = indexByUsername(following);
  const followersMap = indexByUsername(followers);

  const unfollowers: InstaUser[] = [];
  const mutuals: InstaUser[] = [];
  const fans: InstaUser[] = [];

  for (const [name, user] of followingMap) {
    if (followersMap.has(name)) mutuals.push(user);
    else unfollowers.push(user);
  }
  for (const [name, user] of followersMap) {
    if (!followingMap.has(name)) fans.push(user);
  }

  // 분류기 적용 — unfollowers 만 무응답 페널티 적용
  const opts: ClassifyOptions = { customOfficialKeywords };
  const annotatedUnfollowers = annotate(unfollowers, { ...opts, applyAgePenalty: true }).sort(byRecent);
  const annotatedFans     = annotate(fans,     { ...opts, applyAgePenalty: false }).sort(byRecent);
  const annotatedMutuals  = annotate(mutuals,  { ...opts, applyAgePenalty: false }).sort(byRecent);

  // 통계 — unfollowers 기준 ("정리 추천" 의 모집단)
  const summary: ClassificationSummary = classificationSummary(unfollowers, {
    ...opts,
    applyAgePenalty: true,
  });

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    followers: [...followersMap.values()].sort(byRecent),
    following: [...followingMap.values()].sort(byRecent),
    unfollowers: annotatedUnfollowers,
    notFollowingBack: annotatedUnfollowers,
    fans: annotatedFans,
    mutuals: annotatedMutuals,
    classificationSummary: summary,
  };
}

/**
 * 이전 vs 현재 비교. (최근 언팔/새 팔로워 추적)
 */
export function diff(prev: AnalysisResult | null, curr: AnalysisResult): DiffResult {
  if (!prev) {
    return { newFollowers: [], lostFollowers: [], newFollowing: [], unfollowedByMe: [] };
  }

  const prevFollowers = new Set(prev.followers.map((u) => u.username));
  const prevFollowing = new Set(prev.following.map((u) => u.username));
  const currFollowers = new Set(curr.followers.map((u) => u.username));
  const currFollowing = new Set(curr.following.map((u) => u.username));

  return {
    newFollowers: curr.followers.filter((u) => !prevFollowers.has(u.username)),
    lostFollowers: prev.followers.filter((u) => !currFollowers.has(u.username)),
    newFollowing: curr.following.filter((u) => !prevFollowing.has(u.username)),
    unfollowedByMe: prev.following.filter((u) => !currFollowing.has(u.username)),
  };
}

/**
 * 텍스트 검색.
 */
export function searchUsers(users: InstaUser[], query: string): InstaUser[] {
  const q = query.trim().toLowerCase();
  if (!q) return users;
  return users.filter((u) => u.username.toLowerCase().includes(q));
}

/**
 * 그룹 필터.
 *   - 'all'      : 모두
 *   - 'official' : 공식 계정만 (학교/공공/브랜드/연예인/크리에이터)
 *   - 'inactive' : 비활성 의심만 (정리 후보)
 *   - 'normal'   : 일반 사용자만
 */
export type GroupFilter = 'all' | 'official' | 'inactive' | 'normal';

export function filterByGroup(users: InstaUser[], group: GroupFilter): InstaUser[] {
  if (group === 'all') return users;
  return users.filter((u) => u.verdict?.kind === group);
}
