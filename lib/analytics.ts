'use client';

import { track } from '@vercel/analytics/react';
import type { BeforeSendEvent } from '@vercel/analytics/next';

export type SafeAnalyticsEvent =
  | 'analysis_completed'
  | 'download_guide_viewed'
  | 'home_screen_launch'
  | 'install_prompt_accepted'
  | 'share_button_clicked';

export function trackSafeEvent(name: SafeAnalyticsEvent) {
  if (process.env.NODE_ENV !== 'production') return;
  track(name);
}

export function removeAnalyticsUrlDetails(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url, window.location.origin);
    url.search = '';
    url.hash = '';
    return { ...event, url: url.toString() };
  } catch {
    return { ...event, url: event.url.split(/[?#]/, 1)[0] };
  }
}
