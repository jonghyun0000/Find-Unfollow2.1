import type { InstaUser } from '@/types';

export type AccountFilters = {
  hallym: boolean;
  official: boolean;
  keywords: string;
  unavailable: ReadonlySet<string>;
};

export function exclusionReasons(user: InstaUser, filters: AccountFilters): string[] {
  const name = user.username.toLowerCase();
  const reasons: string[] = [];
  if (filters.hallym && name.includes('hallym')) reasons.push('한림대 키워드: hallym');
  if (filters.official && name.includes('official')) reasons.push('키워드: official');
  const words = filters.keywords
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
  if (words.some((word) => name.includes(word))) reasons.push('직접 입력한 제외 단어');
  if (filters.unavailable.has(user.username)) reasons.push('직접 확인 불가로 표시');
  return reasons;
}
