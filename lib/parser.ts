import type { InstaUser } from '@/types';

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
export const MAX_USERS = 200_000;
export const MAX_FILES = 100;
export type DetectedFileKind = 'following' | 'followers' | 'unknown';
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export function normalizeUsername(value: unknown): string {
  if (typeof value !== 'string') throw new Error('계정 아이디가 문자열이 아닙니다.');
  const name = value.trim().replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(name)) throw new Error('올바른 인스타그램 아이디를 입력해주세요.');
  return name;
}

function nameFromURL(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname))
      return;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === '_u') parts.shift();
    if (parts.length === 1) return normalizeUsername(parts[0]);
  } catch {
    /* An untrusted URL is never used as a profile link. */
  }
}

function itemToUser(item: unknown, index: number): InstaUser {
  if (
    !object(item) ||
    !Array.isArray(item.string_list_data) ||
    item.string_list_data.length !== 1 ||
    !object(item.string_list_data[0])
  ) {
    throw new Error(
      `${index + 1}번째 계정의 형식이 올바르지 않습니다. 새 JSON 파일을 내려받아주세요.`,
    );
  }
  const data = item.string_list_data[0];
  const rawName = data.value || item.title || nameFromURL(data.href);
  const username = normalizeUsername(rawName);
  const timestamp = data.timestamp;
  if (
    timestamp !== undefined &&
    (typeof timestamp !== 'number' ||
      !Number.isFinite(timestamp) ||
      timestamp < 0 ||
      timestamp > 8.64e12)
  ) {
    throw new Error(`${index + 1}번째 계정의 날짜가 올바르지 않습니다.`);
  }
  return {
    username,
    href: `https://www.instagram.com/${username}/`,
    ...(timestamp !== undefined ? { followedAt: timestamp as number } : {}),
  };
}

function parseRelations(raw: unknown, kind: 'following' | 'followers'): InstaUser[] {
  const key = `relationships_${kind}`;
  const items = Array.isArray(raw) ? raw : object(raw) ? raw[key] : undefined;
  if (!Array.isArray(items))
    throw new Error(
      `${kind === 'following' ? '팔로잉' : '팔로워'} JSON 구조를 인식할 수 없습니다. 파일을 확인해주세요.`,
    );
  if (items.length > MAX_USERS)
    throw new Error(`한 목록은 최대 ${MAX_USERS.toLocaleString()}명까지 분석할 수 있습니다.`);
  return items.map(itemToUser);
}
export const parseFollowing = (raw: unknown) => parseRelations(raw, 'following');
export const parseFollowers = (raw: unknown) => parseRelations(raw, 'followers');

export function detectFileKind(raw: unknown, fileName = ''): DetectedFileKind {
  if (object(raw)) {
    if ('relationships_following' in raw && 'relationships_followers' in raw) return 'unknown';
    if ('relationships_following' in raw) return 'following';
    if ('relationships_followers' in raw) return 'followers';
    return 'unknown';
  }
  if (Array.isArray(raw)) {
    if (/^following(?:_\d+)?\.json$/i.test(fileName)) return 'following';
    if (/^followers(?:_\d+)?\.json$/i.test(fileName)) return 'followers';
  }
  return 'unknown';
}

export function safeParseJSON(text: string): unknown {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('JSON 파일을 읽을 수 없습니다. ZIP을 풀고 JSON 파일을 선택해주세요.');
  }
}

export function validateFileSelection(files: readonly { name: string; size: number }[]) {
  if (!files.length || files.length > MAX_FILES)
    throw new Error(`JSON 파일을 1~${MAX_FILES}개 선택해주세요.`);
  if (new Set(files.map((f) => f.name.toLowerCase())).size !== files.length)
    throw new Error('같은 이름의 파일이 중복되어 있습니다. 한 번의 내보내기 파일만 선택해주세요.');
  if (files.some((f) => !/\.json$/i.test(f.name) || !f.size || f.size > MAX_FILE_BYTES))
    throw new Error('비어 있지 않은 JSON 파일만 가능합니다. 파일당 최대 20MB입니다.');
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES)
    throw new Error('전체 파일 크기는 최대 50MB입니다.');
}

export function parseExport(files: readonly { name: string; raw: unknown }[]) {
  let following: InstaUser[] = [];
  let followers: InstaUser[] = [];
  let followingCount = 0;
  const followerNames: string[] = [];
  for (const file of files) {
    const kind = detectFileKind(file.raw, file.name);
    try {
      if (kind === 'following') {
        following = following.concat(parseFollowing(file.raw));
        followingCount++;
      } else if (kind === 'followers') {
        followers = followers.concat(parseFollowers(file.raw));
        followerNames.push(file.name);
      } else
        throw new Error(
          '팔로워/팔로잉 파일이 아닙니다. following.json과 followers 파일만 선택해주세요.',
        );
      if (following.length > MAX_USERS || followers.length > MAX_USERS)
        throw new Error('목록은 각각 최대 20만 명까지 가능합니다.');
    } catch (error) {
      throw new Error(`${file.name}: ${error instanceof Error ? error.message : '파일 오류'}`);
    }
  }
  if (followingCount !== 1 || !followerNames.length)
    throw new Error('following.json 1개와 모든 followers JSON 파일이 필요합니다.');
  const numbered = followerNames
    .map((n) => /^followers_(\d+)\.json$/i.exec(n))
    .filter(Boolean)
    .map((m) => Number(m![1]))
    .sort((a, b) => a - b);
  if (
    numbered.length &&
    (numbered.length !== followerNames.length || numbered.some((n, i) => n !== i + 1))
  ) {
    throw new Error(
      '팔로워 파일 번호가 중복되거나 빠져 있습니다. followers_1.json부터 모든 파일을 선택해주세요.',
    );
  }
  if (following.length > MAX_USERS || followers.length > MAX_USERS)
    throw new Error(`팔로워와 팔로잉은 각각 최대 ${MAX_USERS.toLocaleString()}명까지 가능합니다.`);
  return { following, followers };
}
