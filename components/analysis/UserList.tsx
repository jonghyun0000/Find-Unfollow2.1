'use client';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { InstaUser } from '@/types';
export function UserCard({ user, badge }: { user: InstaUser; badge?: string }) {
  return (
    <li className="glass rounded-2xl p-4 flex items-center gap-3">
      <span
        aria-hidden
        className="grid place-items-center size-10 shrink-0 rounded-full bg-brand text-white font-semibold"
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
      {badge && <span className="text-xs text-slate-600 shrink-0">{badge}</span>}
    </li>
  );
}
export function UserList({ users, badge }: { users: InstaUser[]; badge?: string }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(users.length / 50));
  const current = Math.min(page, pageCount - 1);
  return (
    <>
      <ul className="space-y-2">
        {users.slice(current * 50, (current + 1) * 50).map((user) => (
          <UserCard key={user.username} user={user} badge={badge} />
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
