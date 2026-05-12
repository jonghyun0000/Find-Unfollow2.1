// lib/parser.ts
// 인스타그램 다운로드 JSON을 InstaUser[] 로 정규화한다.
// 파일 형태가 두 가지로 갈리기 때문에 (배열 / 객체) 둘 다 받는다.

import type {
  FollowersFile,
  FollowingFile,
  InstaUser,
  InstagramRelationItem,
} from '@/types';

function itemToUser(item: InstagramRelationItem): InstaUser | null {
  const data = item.string_list_data?.[0];
  if (!data?.value) return null;

  return {
    username: data.value.trim(),
    href: data.href || `https://www.instagram.com/${data.value.trim()}`,
    followedAt: data.timestamp,
  };
}

/**
 * following.json 파싱.
 * 인스타는 보통 { relationships_following: [...] } 형태로 내려준다.
 */
export function parseFollowing(raw: unknown): InstaUser[] {
  const obj = raw as FollowingFile | InstagramRelationItem[];

  // 배열로 직접 들어온 경우
  if (Array.isArray(obj)) {
    return obj.map(itemToUser).filter((u): u is InstaUser => u !== null);
  }

  // 객체 안에 relationships_following 키가 있는 경우 (정상 형태)
  if (obj && typeof obj === 'object' && 'relationships_following' in obj) {
    return (obj.relationships_following ?? [])
      .map(itemToUser)
      .filter((u): u is InstaUser => u !== null);
  }

  return [];
}

/**
 * followers_1.json 파싱.
 * 형태가 가장 헷갈리는 파일: 보통 배열이지만 객체로 감싼 경우도 있음.
 */
export function parseFollowers(raw: unknown): InstaUser[] {
  const obj = raw as FollowersFile;

  if (Array.isArray(obj)) {
    return obj.map(itemToUser).filter((u): u is InstaUser => u !== null);
  }

  if (obj && typeof obj === 'object' && 'relationships_followers' in obj) {
    return (obj.relationships_followers ?? [])
      .map(itemToUser)
      .filter((u): u is InstaUser => u !== null);
  }

  return [];
}

/**
 * 사용자가 어떤 파일을 올렸는지 자동 판별.
 * 키 이름 / 데이터 형태로 추론한다.
 */
export type DetectedFileKind = 'following' | 'followers' | 'unknown';

export function detectFileKind(raw: unknown, fileName?: string): DetectedFileKind {
  // 1) 파일 이름 기반 빠른 판별
  const name = fileName?.toLowerCase() ?? '';
  if (name.includes('follower')) return 'followers';
  if (name.includes('following')) return 'following';

  // 2) 객체 키 기반
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if ('relationships_following' in raw) return 'following';
    if ('relationships_followers' in raw) return 'followers';
  }

  // 3) 배열만 들어오면 일반적으로 followers_1.json
  if (Array.isArray(raw)) return 'followers';

  return 'unknown';
}

/**
 * 텍스트(파일 내용)를 받아 안전하게 JSON으로 파싱.
 */
export function safeParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('JSON 파일을 읽을 수 없습니다. 파일이 손상되지 않았는지 확인해주세요.');
  }
}
