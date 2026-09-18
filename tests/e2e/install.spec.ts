import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home screen guide is accessible, device specific, and can be reopened', async ({
  page,
  isMobile,
}, testInfo) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /홈 화면에 추가하기/ });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole('button', { name: isMobile ? 'iPhone · iPad' : '컴퓨터', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Android', exact: true }).click();
  await expect(dialog).toContainText('오른쪽 위 메뉴');
  await page.getByRole('button', { name: 'iPhone · iPad', exact: true }).click();
  await expect(dialog).toContainText('공유 버튼');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('install-guide.png') });
  await page.getByRole('button', { name: '안내 닫기' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.goto('/settings');
  await page.getByRole('button', { name: /홈 화면에 추가하기/ }).click();
  await expect(dialog).toBeVisible();
});

test('native install prompt is consumed once and installed state updates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /홈 화면에 추가하기/ }).click();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, {
      prompt: async () => {},
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });
    window.dispatchEvent(event);
  });
  await page.getByRole('button', { name: '앱 설치하기', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('나중에 브라우저 메뉴');
  await expect(page.getByRole('button', { name: '앱 설치하기', exact: true })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /홈 화면에서 사용 중/ })).toBeVisible();
});
