import assert from 'node:assert/strict';
import test from 'node:test';
import { removeAnalyticsUrlDetails, type SafeAnalyticsEvent } from '../lib/analytics';

test('analytics URLs discard queries and fragments', () => {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://example.com' } },
  });

  try {
    assert.deepEqual(
      removeAnalyticsUrlDetails({
        type: 'pageview',
        url: 'https://example.com/upload?account=private#result',
      }),
      { type: 'pageview', url: 'https://example.com/upload' },
    );
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('safe analytics events are property-free product actions', () => {
  const events = [
    'analysis_completed',
    'download_guide_viewed',
    'home_screen_launch',
    'install_prompt_accepted',
    'share_button_clicked',
  ] satisfies SafeAnalyticsEvent[];

  assert.equal(new Set(events).size, 5);
});
