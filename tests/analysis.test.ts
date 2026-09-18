import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseExport,
  parseFollowing,
  parseFollowers,
  safeParseJSON,
  validateFileSelection,
  MAX_FILE_BYTES,
} from '../lib/parser';
import { analyze, diff, previousFor } from '../lib/analyzer';
import { usersToCSV } from '../lib/csv';
const item = (value: string) => ({
  string_list_data: [{ value, href: `https://www.instagram.com/${value}/`, timestamp: 1700000000 }],
});
const users = (...names: string[]) => parseFollowers(names.map(item));

test('merges every follower part, normalizes case, and deduplicates before comparing', () => {
  const parsed = parseExport([
    {
      name: 'following.json',
      raw: { relationships_following: ['Alice', 'bob', 'carol'].map(item) },
    },
    { name: 'followers_2.json', raw: [item('bob'), item('alice')] },
    { name: 'followers_1.json', raw: [item('ALICE')] },
  ]);
  const result = analyze(parsed.following, parsed.followers);
  assert.deepEqual(
    result.unfollowers.map((u) => u.username),
    ['carol'],
  );
  assert.equal(result.mutuals.length, 2);
  assert.equal(result.followers.length, 2);
});

test('supports title-only following exports, safe URL fallback, and BOM', () => {
  const result = parseFollowing(
    safeParseJSON(
      '\uFEFF' +
        JSON.stringify({
          relationships_following: [
            {
              title: 'alice',
              string_list_data: [{ href: 'https://www.instagram.com/_u/alice', timestamp: 1 }],
            },
            { string_list_data: [{ href: 'https://www.instagram.com/bob/' }] },
          ],
        }),
    ),
  );
  assert.deepEqual(
    result.map((u) => u.username),
    ['alice', 'bob'],
  );
});

test('rejects malformed rows instead of silently dropping relationships', () => {
  for (const raw of [
    {},
    null,
    { relationships_followers: {} },
    [null],
    [item('=1+1')],
    [{ string_list_data: [{ value: 123 }] }],
    [{ string_list_data: [{ value: 'alice', timestamp: '1' }] }],
  ]) {
    assert.throws(() => parseFollowers(raw));
  }
  assert.throws(() =>
    parseExport([
      { name: 'following.json', raw: { relationships_following: [item('alice')] } },
      { name: 'followers_1.json', raw: {} },
    ]),
  );
});

test('accepts genuinely empty lists without treating invalid schemas as empty', () => {
  const parsed = parseExport([
    { name: 'following.json', raw: { relationships_following: [] } },
    { name: 'followers_1.json', raw: [] },
  ]);
  assert.equal(analyze(parsed.following, parsed.followers).unfollowers.length, 0);
});

test('rejects missing follower parts, duplicate following files, and oversized selections', () => {
  const following = { name: 'following.json', raw: { relationships_following: [] } };
  assert.throws(() => parseExport([following, { name: 'followers_2.json', raw: [] }]));
  assert.throws(() =>
    parseExport([
      following,
      { name: 'followers_1.json', raw: [] },
      { name: 'followers_3.json', raw: [] },
    ]),
  );
  assert.throws(() => parseExport([following, following, { name: 'followers_1.json', raw: [] }]));
  assert.throws(() =>
    validateFileSelection([{ name: 'followers_1.json', size: MAX_FILE_BYTES + 1 }]),
  );
  assert.throws(() => validateFileSelection([{ name: 'data.zip', size: 10 }]));
  assert.throws(() =>
    validateFileSelection([
      { name: 'followers_1.json', size: 1 },
      { name: 'followers_1.json', size: 1 },
    ]),
  );
});

test('never trusts imported profile links', () => {
  const [user] = parseFollowers([
    { string_list_data: [{ value: 'alice', href: 'javascript:alert(1)' }] },
  ]);
  assert.equal(user.href, 'https://www.instagram.com/alice/');
  assert.throws(() =>
    parseFollowers([{ string_list_data: [{ href: 'https://instagram.com.evil.test/alice' }] }]),
  );
});

test('comparisons require same account, older baseline, and non-sample records', () => {
  const prev = analyze(users('alice'), users('alice', 'bob'), {
    account: 'owner',
    snapshotDate: '2024-01-01',
  });
  const curr = analyze(users('carol'), users('alice', 'carol'), {
    account: 'owner',
    snapshotDate: '2024-02-01',
  });
  assert.deepEqual(
    diff(prev, curr).lostFollowers.map((u) => u.username),
    ['bob'],
  );
  assert.deepEqual(
    diff(prev, curr).newFollowers.map((u) => u.username),
    ['carol'],
  );
  assert.equal(
    previousFor(
      [{ ...prev, account: 'other' }, prev, { ...curr, id: 'future', snapshotDate: '2025-01-01' }],
      curr,
    )?.id,
    prev.id,
  );
  assert.equal(diff({ ...prev, account: 'other' }, curr).lostFollowers.length, 0);
  assert.equal(diff(curr, prev).lostFollowers.length, 0);
  assert.equal(diff(prev, { ...curr, isSample: true }).lostFollowers.length, 0);
  assert.equal(previousFor([prev], { ...curr, account: null }), null);
});

test('CSV escapes formulas and quotes, and always constructs Instagram links', () => {
  const csv = usersToCSV([
    { username: '=1+1', href: 'https://evil.test' },
    { username: 'a"b', href: '' },
  ]);
  assert.match(csv, /"'=1\+1"/);
  assert.match(csv, /"a""b"/);
  assert.doesNotMatch(csv, /evil.test/);
});

test('large valid files do not overflow the function argument stack', () => {
  const raw = Array.from({ length: 130_000 }, (_, i) => item(`person${i}`));
  const parsed = parseExport([
    { name: 'following.json', raw: { relationships_following: [] } },
    { name: 'followers_1.json', raw },
  ]);
  assert.equal(parsed.followers.length, 130_000);
});
