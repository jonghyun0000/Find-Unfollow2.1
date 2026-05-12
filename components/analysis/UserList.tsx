// components/analysis/UserList.tsx
'use client';

import { ExternalLink, AlertTriangle, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InstaUser } from '@/types';
import { CATEGORY_LABELS } from '@/lib/classifier';
import { cn } from '@/lib/cn';

interface UserCardProps {
  user: InstaUser;
  index?: number;
  badge?: string;
  badgeColor?: 'pink' | 'emerald' | 'amber' | 'purple';
  /** 분류 정보 표시 여부 (공식 배지, 비활성 경고). 기본 true. */
  showClassification?: boolean;
}

const badgeColors = {
  pink: 'bg-ig-pink/15 text-ig-pink border-ig-pink/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  purple: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
};

/**
 * 카드 시각 차이:
 *   공식 계정 → 파란색 강조 + 인증 아이콘 + 카테고리 배지
 *   비활성 의심 → 황색 강조 + 경고 아이콘 + 점수 + 사유 칩
 *   일반     → 표준 카드
 */
export function UserCard({
  user,
  index = 0,
  badge,
  badgeColor = 'pink',
  showClassification = true,
}: UserCardProps) {
  const initial = user.username.charAt(0).toUpperCase();
  const verdict = showClassification ? user.verdict : undefined;

  const isOfficial = verdict?.kind === 'official';
  const isInactive = verdict?.kind === 'inactive';
  const isStrongInactive = isInactive && verdict.inactivityLevel === 'strong';

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.4), duration: 0.25 }}
      className={cn(
        'glass rounded-2xl p-3',
        isOfficial && 'border-sky-500/25 bg-sky-500/[0.04]',
        isInactive && 'border-amber-500/20 bg-amber-500/[0.04]',
      )}
    >
      <div className="flex items-center gap-3">
        {/* 아바타 */}
        <div className="relative shrink-0">
          <div
            className="grid place-items-center w-11 h-11 rounded-full text-white text-sm font-bold"
            style={{
              background: `conic-gradient(from ${(user.username.charCodeAt(0) % 360)}deg, #FCAF45, #E1306C, #833AB4, #FCAF45)`,
            }}
          >
            <span className="grid place-items-center w-[38px] h-[38px] rounded-full bg-ink-900">
              {initial}
            </span>
          </div>
          {isOfficial && (
            <span
              className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-4 h-4 rounded-full bg-sky-500 ring-2 ring-ink-950"
              aria-label="공식 계정"
            >
              <BadgeCheck size={11} className="text-white" strokeWidth={3} />
            </span>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <a
            href={user.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold hover:underline inline-flex items-center gap-1.5 truncate"
          >
            @{user.username}
            <ExternalLink size={12} className="text-white/45 shrink-0" />
            {isInactive && (
              <AlertTriangle
                size={12}
                className={isStrongInactive ? 'text-rose-300 shrink-0' : 'text-amber-300 shrink-0'}
              />
            )}
          </a>

          {user.followedAt && (
            <p className="text-[11.5px] text-white/45 mt-0.5">
              {new Date(user.followedAt * 1000).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}

          {/* 공식 카테고리 칩 */}
          {isOfficial && verdict.officialCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {verdict.officialCategories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/12 text-sky-300 border border-sky-500/25"
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
              {verdict.customMatches.slice(0, 2).map((kw) => (
                <span
                  key={`c:${kw}`}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent-purple/12 text-accent-purple border border-accent-purple/25"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* 비활성 사유 칩 */}
          {isInactive && verdict.inactivityReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {verdict.inactivityReasons.slice(0, 3).map((r) => (
                <span
                  key={r}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-200/85 border border-amber-500/20"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 우측 배지 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isOfficial && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 inline-flex items-center gap-0.5">
              <BadgeCheck size={9} strokeWidth={3} />
              공식
            </span>
          )}
          {isInactive && (
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full border',
                isStrongInactive
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
              )}
              title={`비활성 점수 ${verdict.inactivityScore}/100`}
            >
              {verdict.inactivityScore}
            </span>
          )}
          {badge && (
            <span className={cn('text-[10.5px] font-semibold px-2 py-1 rounded-full border', badgeColors[badgeColor])}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}

interface UserListProps {
  users: InstaUser[];
  badge?: string;
  badgeColor?: UserCardProps['badgeColor'];
  showClassification?: boolean;
}

export function UserList({ users, badge, badgeColor, showClassification }: UserListProps) {
  return (
    <ul className="space-y-2">
      {users.map((u, i) => (
        <UserCard
          key={u.username}
          user={u}
          index={i}
          badge={badge}
          badgeColor={badgeColor}
          showClassification={showClassification}
        />
      ))}
    </ul>
  );
}
