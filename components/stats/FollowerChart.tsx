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
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gFollowers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6554C0" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#6554C0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gFollowing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#168477" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#168477" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#475569' }}
          />
          <Area
            type="monotone"
            dataKey="followers"
            name="팔로워"
            stroke="#6554C0"
            strokeWidth={2}
            fill="url(#gFollowers)"
          />
          <Area
            type="monotone"
            dataKey="following"
            name="팔로잉"
            stroke="#168477"
            strokeWidth={2}
            fill="url(#gFollowing)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
