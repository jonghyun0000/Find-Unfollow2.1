import { test, expect } from '@playwright/test';

test('filters show reasons, restore hidden accounts, and export only visible results', async ({
  page,
}) => {
  const row = (value: string) => ({ string_list_data: [{ value, timestamp: 1700000000 }] });
  await page.goto('/upload');
  await page.locator('input[type=file]').setInputFiles([
    {
      name: 'following.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          relationships_following: ['hallym_club', 'artist_official', 'friend', 'student'].map(row),
        }),
      ),
    },
    { name: 'followers_1.json', mimeType: 'application/json', buffer: Buffer.from('[]') },
  ]);
  await page.getByRole('checkbox', { name: /전체 기간/ }).check();
  await page.getByRole('button', { name: '분석 시작', exact: true }).click();
  await page.getByRole('link', { name: /팔로우 관계 전체 보기/ }).click();
  await page.getByRole('checkbox', { name: /hallym이 포함된/ }).check();
  await page.getByRole('checkbox', { name: /official이/ }).check();
  await expect(page.getByRole('link', { name: /@hallym_club/ })).toHaveCount(0);
  await page.getByLabel('숨길 아이디에 포함된 단어').fill('student');
  await expect(page.getByRole('link', { name: /@friend/ })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '현재 목록 저장 (CSV)' }).click();
  const stream = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('friend');
  expect(csv).not.toContain('hallym_club');
  await page.getByRole('button', { name: 'friend 확인 불가로 표시', exact: true }).click();
  await page.getByRole('button', { name: '숨긴 계정 보기 (4명)' }).click();
  await expect(page.getByText('한림대 키워드: hallym', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'friend 확인 불가 표시 취소', exact: true }).click();
  await page.getByRole('button', { name: '결과 목록으로 돌아가기' }).click();
  await expect(page.getByRole('link', { name: /@friend/ })).toBeVisible();
  await page.getByRole('button', { name: '필터 모두 초기화' }).click();
  await expect(page.getByRole('link', { name: /@hallym_club/ })).toBeVisible();
});

test('shared link contains campaign attribution but no account data', async ({ page }) => {
  await page.goto('/?account=private_name');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        (window as Window & { shared?: ShareData }).shared = data;
      },
    });
  });
  await page.getByRole('button', { name: '친구에게 링크 공유하기' }).click();
  const data = await page.evaluate(() => (window as Window & { shared?: ShareData }).shared);
  expect(data?.url).toContain('utm_source=hallym');
  expect(JSON.stringify(data)).not.toContain('private_name');
});
