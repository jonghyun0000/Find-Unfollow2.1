// components/stats/FollowerChart.tsx
'use client';

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { AnalysisResult } from '@/types';

interface Props {
  history: AnalysisResult[]; // 최신이 [0]
}

export function FollowerChart({ history }: Props) {
  // 시간순(과거→현재)로 뒤집어서 차트 데이터로 변환
  const data = [...history].reverse().map((h) => ({
    date: h.snapshotDate,
    followers: h.followers.length,
    following: h.following.length,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gFollowers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--instagram-pink)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--instagram-pink)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gFollowing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-secondary)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 5" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fontSize: 11 }}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--glass-bg-strong)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--glass-shadow)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Area
            type="monotone"
            dataKey="followers"
            name="팔로워"
            stroke="var(--instagram-pink)"
            strokeWidth={2.5}
            isAnimationActive={false}
            fill="url(#gFollowers)"
          />
          <Area
            type="monotone"
            dataKey="following"
            name="팔로잉"
            stroke="var(--chart-secondary)"
            strokeWidth={2.5}
            isAnimationActive={false}
            fill="url(#gFollowing)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
