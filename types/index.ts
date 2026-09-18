export interface InstaUser {
  username: string;
  href: string;
  followedAt?: number;
}

export interface Snapshot {
  version: 2;
  id: string;
  createdAt: number;
  account: string | null;
  snapshotDate: string;
  followers: InstaUser[];
  following: InstaUser[];
}

export interface AnalysisResult extends Snapshot {
  unfollowers: InstaUser[];
  fans: InstaUser[];
  mutuals: InstaUser[];
  isSample?: boolean;
}

export interface DiffResult {
  newFollowers: InstaUser[];
  lostFollowers: InstaUser[];
  newFollowing: InstaUser[];
  unfollowedByMe: InstaUser[];
}
