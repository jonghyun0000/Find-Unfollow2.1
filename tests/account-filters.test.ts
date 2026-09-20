import test from 'node:test';
import assert from 'node:assert/strict';
import { exclusionReasons } from '../lib/account-filters';
const user = (username: string) => ({ username, href: `https://www.instagram.com/${username}/` });
const base = { hallym: false, official: false, keywords: '', unavailable: new Set<string>() };
test('campus and official keywords are opt-in and case insensitive', () => {
  assert.deepEqual(exclusionReasons(user('hallym_official'), base), []);
  assert.equal(
    exclusionReasons(user('HALLYM_OFFICIAL'), { ...base, hallym: true, official: true }).length,
    2,
  );
  assert.equal(exclusionReasons(user('student'), { ...base, hallym: true }).length, 0);
});
test('custom keywords and manual review are reversible and never mutate source accounts', () => {
  const account = user('club_alpha');
  const before = structuredClone(account);
  assert.equal(exclusionReasons(account, { ...base, keywords: 'university, CLUB' }).length, 1);
  assert.equal(
    exclusionReasons(account, { ...base, unavailable: new Set(['club_alpha']) }).length,
    1,
  );
  assert.deepEqual(exclusionReasons(account, base), []);
  assert.deepEqual(account, before);
});
