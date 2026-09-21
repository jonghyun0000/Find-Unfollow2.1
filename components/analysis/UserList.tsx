'use client';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { InstaUser } from '@/types';
type ReviewProps = {
  onToggleUnavailable?: (username: string) => void;
  unavailable?: ReadonlySet<string>;
  reasonFor?: (user: InstaUser) => string;
};
export function UserCard({
  user,
  badge,
  onToggleUnavailable,
  unavailable,
  reasonFor,
}: { user: InstaUser; badge?: string } & ReviewProps) {
  return (
    <li className="surface-row rounded-2xl p-4 flex flex-wrap items-center gap-3">
      <span
        aria-hidden
        className="grid place-items-center size-11 shrink-0 rounded-full border border-white bg-brand-soft text-brand font-semibold"
      >
        {user.username[0].toUpperCase()}
      </span>
      <a
        className="min-w-0 flex-1 break-all text-sm font-semibold hover:underline"
        href={`https://www.instagram.com/${encodeURIComponent(user.username)}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        @{user.username}
        <ExternalLink className="inline ml-1.5" size={12} aria-hidden />
        <span className="sr-only"> (인스타그램, 새 탭)</span>
      </a>
      {onToggleUnavailable && (
        <div className="w-full border-t border-slate-100 pt-3">
          {reasonFor && <p className="mb-2 text-xs text-slate-600">{reasonFor(user)}</p>}
          <button
            type="button"
            onClick={() => onToggleUnavailable(user.username)}
            className="min-h-10 rounded-lg bg-slate-50 px-3 text-xs text-slate-600"
            aria-label={`${user.username} ${unavailable?.has(user.username) ? '확인 불가 표시 취소' : '확인 불가로 표시'}`}
          >
            {unavailable?.has(user.username) ? '확인 불가 표시 취소' : '확인 불가로 표시'}
          </button>
        </div>
      )}
      {badge && <span className="text-xs text-slate-600 shrink-0">{badge}</span>}
    </li>
  );
}
export function UserList({
  users,
  badge,
  ...review
}: { users: InstaUser[]; badge?: string } & ReviewProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(users.length / 50));
  const current = Math.min(page, pageCount - 1);
  return (
    <>
      <ul className="space-y-2">
        {users.slice(current * 50, (current + 1) * 50).map((user) => (
          <UserCard key={user.username} user={user} badge={badge} {...review} />
        ))}
      </ul>
      {pageCount > 1 && (
        <nav aria-label="결과 페이지" className="flex items-center justify-between gap-3 pt-4">
          <button
            className="rounded-xl bg-slate-100 p-3 text-sm disabled:opacity-30"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            이전
          </button>
          <span aria-live="polite" className="text-sm text-slate-600">
            {current + 1} / {pageCount} 페이지
          </span>
          <button
            className="rounded-xl bg-slate-100 p-3 text-sm disabled:opacity-30"
            disabled={current === pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            다음
          </button>
        </nav>
      )}
    </>
  );
}
