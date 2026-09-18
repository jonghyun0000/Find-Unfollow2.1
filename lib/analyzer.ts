import type { AnalysisResult, DiffResult, InstaUser, Snapshot } from '@/types';
import { normalizeUsername } from '@/lib/parser';

function unique(users: InstaUser[]) {
  const map = new Map<string, InstaUser>();
  for (const user of users) {
    const username = normalizeUsername(user.username);
    const existing = map.get(username);
    if (!existing || (user.followedAt ?? 0) > (existing.followedAt ?? 0)) {
      map.set(username, {
        username,
        href: `https://www.instagram.com/${username}/`,
        followedAt: user.followedAt,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.username.localeCompare(b.username));
}

export function analyze(
  following: InstaUser[],
  followers: InstaUser[],
  metadata?: Partial<Omit<Snapshot, 'followers' | 'following' | 'version'>>,
): AnalysisResult {
  const normalizedFollowing = unique(following);
  const normalizedFollowers = unique(followers);
  const followingNames = new Set(normalizedFollowing.map((u) => u.username));
  const followerNames = new Set(normalizedFollowers.map((u) => u.username));
  return {
    version: 2,
    id: metadata?.id ?? crypto.randomUUID(),
    createdAt: metadata?.createdAt ?? Date.now(),
    account: metadata?.account ?? null,
    snapshotDate: metadata?.snapshotDate ?? new Date().toISOString().slice(0, 10),
    following: normalizedFollowing,
    followers: normalizedFollowers,
    unfollowers: normalizedFollowing.filter((u) => !followerNames.has(u.username)),
    fans: normalizedFollowers.filter((u) => !followingNames.has(u.username)),
    mutuals: normalizedFollowing.filter((u) => followerNames.has(u.username)),
  };
}

export function previousFor(
  history: AnalysisResult[],
  current: AnalysisResult,
): AnalysisResult | null {
  if (!current.account || current.isSample) return null;
  return (
    history
      .filter(
        (h) =>
          h.id !== current.id &&
          !h.isSample &&
          h.account === current.account &&
          h.snapshotDate < current.snapshotDate,
      )
      .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))[0] ?? null
  );
}

export function diff(prev: AnalysisResult | null, curr: AnalysisResult): DiffResult {
  const empty = { newFollowers: [], lostFollowers: [], newFollowing: [], unfollowedByMe: [] };
  if (
    !prev ||
    !curr.account ||
    prev.account !== curr.account ||
    prev.snapshotDate >= curr.snapshotDate ||
    curr.isSample ||
    prev.isSample
  )
    return empty;
  const pf = new Set(prev.followers.map((u) => u.username));
  const pg = new Set(prev.following.map((u) => u.username));
  const cf = new Set(curr.followers.map((u) => u.username));
  const cg = new Set(curr.following.map((u) => u.username));
  return {
    newFollowers: curr.followers.filter((u) => !pf.has(u.username)),
    lostFollowers: prev.followers.filter((u) => !cf.has(u.username)),
    newFollowing: curr.following.filter((u) => !pg.has(u.username)),
    unfollowedByMe: prev.following.filter((u) => !cg.has(u.username)),
  };
}
export function searchUsers(users: InstaUser[], query: string) {
  const q = query.trim().replace(/^@/, '').toLowerCase();
  return q ? users.filter((u) => u.username.includes(q)) : users;
}
