// lib/csv.ts
// 사용자 목록을 CSV로 내보내는 헬퍼.
// 한글이 엑셀에서 깨지지 않도록 UTF-8 BOM을 붙인다.

import type { InstaUser } from '@/types';

function escapeCell(val: string): string {
  // CSV 규칙: " -> "" / 콤마/줄바꿈 포함 시 따옴표 감싸기
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function usersToCSV(users: InstaUser[]): string {
  const header = ['username', 'profile_url', 'followed_at_iso'];
  const rows = users.map((u) => [
    escapeCell(u.username),
    escapeCell(u.href),
    escapeCell(u.followedAt ? new Date(u.followedAt * 1000).toISOString() : ''),
  ]);
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * 브라우저에서 즉시 다운로드 트리거.
 * SSR 환경에서 호출하면 그냥 무시.
 */
export function downloadCSV(users: InstaUser[], fileName: string): void {
  if (typeof window === 'undefined') return;
  const csv = usersToCSV(users);
  const BOM = '\uFEFF'; // 엑셀 한글 깨짐 방지
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
