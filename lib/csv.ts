import type { InstaUser } from '@/types';
function escapeCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function usersToCSV(users: InstaUser[]): string {
  return [
    ['username', 'profile_url', 'followed_at_iso'].join(','),
    ...users.map((u) =>
      [
        u.username,
        `https://www.instagram.com/${encodeURIComponent(u.username)}/`,
        u.followedAt !== undefined ? new Date(u.followedAt * 1000).toISOString() : '',
      ]
        .map(escapeCell)
        .join(','),
    ),
  ].join('\r\n');
}
export function downloadCSV(users: InstaUser[], fileName: string) {
  const url = URL.createObjectURL(
    new Blob(['\uFEFF' + usersToCSV(users)], { type: 'text/csv;charset=utf-8;' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
