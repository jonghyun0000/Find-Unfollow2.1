import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createServer, request } from 'node:http';
import type { AddressInfo } from 'node:net';
const item = (name: string) => ({
  string_list_data: [
    { value: name, href: `https://www.instagram.com/${name}/`, timestamp: 1700000000 },
  ],
});
const file = (name: string, raw: unknown) => ({
  name,
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify(raw)),
});
async function upload(
  page: Page,
  options: {
    following?: string[];
    followers?: string[];
    date?: string;
    persist?: boolean;
    parts?: boolean;
    account?: string;
    baseURL?: string;
  } = {},
) {
  const {
    following = ['alice', 'bob'],
    followers = ['alice'],
    date = '2024-02-01',
    persist = false,
    parts = false,
    account = 'owner',
    baseURL = '',
  } = options;
  await page.goto(`${baseURL}/upload`);
  const files = [
    file('following.json', { relationships_following: following.map(item) }),
    file('followers_1.json', (parts ? followers.slice(0, 1) : followers).map(item)),
  ];
  if (parts) files.push(file('followers_2.json', followers.slice(1).map(item)));
  await page.locator('input[type=file]').setInputFiles(files);
  await page.getByLabel(/내 인스타그램 아이디/).fill(account);
  await page.getByLabel(/데이터 기준일/).fill(date);
  await page.getByLabel(/전체 기간으로 요청한/).check();
  if (persist) await page.getByLabel(/이 기기에 분석 기록 저장/).check();
  await page.getByRole('button', { name: '분석 시작', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: '분석 결과', exact: true })).toBeVisible();
}

test('merges split files in the worker and shows only the actual non-mutual account', async ({
  page,
}) => {
  const outside: string[] = [];
  const payloads: string[] = [];
  page.on('request', (r) => {
    if (r.postData()) payloads.push(r.postData()!);
    if (new URL(r.url()).origin !== 'http://localhost:3100') outside.push(r.url());
  });
  await upload(page, {
    following: ['alice', 'bob', 'carol'],
    followers: ['alice', 'bob'],
    parts: true,
  });
  await page.getByRole('link', { name: /팔로우 관계 전체 보기/ }).click();
  await expect(page.getByRole('link', { name: /@carol/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /@bob/ })).toHaveCount(0);
  expect(outside).toEqual([]);
  expect(payloads).toEqual([]);
});

test('rejects malformed files and missing follower parts without creating a result', async ({
  page,
}) => {
  await page.goto('/upload');
  await page
    .locator('input[type=file]')
    .setInputFiles([
      file('following.json', { relationships_following: [item('alice')] }),
      file('followers_1.json', {}),
    ]);
  await page.getByLabel(/내 인스타그램 아이디/).fill('owner');
  await page.getByLabel(/전체 기간으로 요청한/).check();
  await page.getByRole('button', { name: '분석 시작', exact: true }).click();
  await expect(page.getByRole('alert', { name: '파일 분석 오류' })).toContainText(
    '팔로워/팔로잉 파일이 아닙니다',
  );
  await page.reload();
  await page
    .locator('input[type=file]')
    .setInputFiles([
      file('following.json', { relationships_following: [] }),
      file('followers_2.json', []),
    ]);
  await page.getByLabel(/내 인스타그램 아이디/).fill('owner');
  await page.getByLabel(/전체 기간으로 요청한/).check();
  await page.getByRole('button', { name: '분석 시작', exact: true }).click();
  await expect(page.getByRole('alert', { name: '파일 분석 오류' })).toContainText(
    '번호가 중복되거나 빠져',
  );
});

test('shows all lost followers, restores saved records, and isolates samples', async ({ page }) => {
  const names = Array.from({ length: 7 }, (_, i) => `person${i}`);
  await upload(page, { followers: names, date: '2024-01-01', persist: true });
  await upload(page, { followers: [], persist: true });
  await page.getByRole('link', { name: '변화 목록 전체 보기 →' }).click();
  await expect(page.getByRole('link', { name: /@person/ })).toHaveCount(7);
  await page.reload();
  await expect(page.getByRole('link', { name: /@person/ })).toHaveCount(7);
  await page.goto('/stats');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3);
  await expect(page.locator('.recharts-surface')).toBeVisible();
  await page.goto('/upload');
  await page.getByRole('button', { name: '샘플 데이터로 체험하기' }).click();
  await expect(page.getByRole('status')).toContainText('샘플 데이터');
  await expect(page.getByText('아직 비교할 기록이 없어요.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('link', { name: '변화 목록 전체 보기 →' }).click();
  await expect(page.getByRole('link', { name: /@person/ })).toHaveCount(7);
});

test('paginates, searches, and exports the entire matching result', async ({ page }) => {
  await upload(page, {
    following: Array.from({ length: 61 }, (_, i) => `person_${String(i).padStart(3, '0')}`),
    followers: [],
  });
  await page.getByRole('link', { name: /팔로우 관계 전체 보기/ }).click();
  await expect(page.getByRole('link', { name: /@person_/ })).toHaveCount(50);
  await page.getByRole('button', { name: '다음', exact: true }).click();
  await expect(page.getByRole('link', { name: /@person_/ })).toHaveCount(11);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: '현재 목록 저장 (CSV)' }).click();
  const download = await downloaded;
  const csv = await readFile((await download.path())!, 'utf8');
  expect(csv).toContain('person_000');
  expect(csv).toContain('person_060');
  await page.getByLabel('아이디 검색').fill('person_060');
  await expect(page.getByRole('link', { name: /@person_/ })).toHaveCount(1);
});

test('only saves with consent and deletes stored data', async ({ page }) => {
  await upload(page);
  await page.reload();
  await expect(page.getByText('먼저 데이터를 분석해주세요')).toBeVisible();
  await upload(page, { persist: true });
  await page.reload();
  await expect(page.getByRole('heading', { name: '분석 결과', exact: true })).toBeVisible();
  await page.goto('/settings');
  await page.getByRole('button', { name: '모든 기록 삭제', exact: true }).click();
  await page.getByRole('button', { name: '모든 기록 삭제 확인' }).click();
  await expect(page.getByRole('status')).toContainText('모든 분석 기록을 삭제했습니다');
  await page.goto('/dashboard');
  await expect(page.getByText('먼저 데이터를 분석해주세요')).toBeVisible();
});

test('installed app reloads saved analysis offline', async ({ page, context, browserName }) => {
  // A separate origin lets us physically disconnect the app without disrupting
  // parallel tests. WebKit setOffline rejects even minimal service-worker pages.
  const proxy = createServer((incoming, outgoing) => {
    const upstream = request(
      {
        hostname: '127.0.0.1',
        port: 3100,
        path: incoming.url,
        method: incoming.method,
        headers: { ...incoming.headers, host: 'localhost:3100' },
        agent: false,
      },
      (response) => {
        outgoing.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(outgoing);
      },
    );
    upstream.on('error', () => {
      outgoing.writeHead(502);
      outgoing.end();
    });
    incoming.pipe(upstream);
  });
  await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`;
  try {
    await upload(page, { persist: true, baseURL: origin });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await expect(page.getByRole('button', { name: '새 버전으로 새로고침' })).toHaveCount(0);
    proxy.closeAllConnections();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
    if (browserName === 'chromium') await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: '분석 결과', exact: true })).toBeVisible();
    await page.getByRole('link', { name: /팔로우 관계 전체 보기/ }).click();
    await expect(page.getByRole('link', { name: /@bob/ })).toBeVisible();
  } finally {
    proxy.closeAllConnections();
    proxy.close();
  }
});

test('main flows have accessible controls, no runtime errors, and fit the viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['/', '/upload', '/guide']) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await upload(page);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true });
  expect(errors).toEqual([]);
});
