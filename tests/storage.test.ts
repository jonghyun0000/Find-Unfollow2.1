import 'fake-indexeddb/auto';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, previousFor } from '../lib/analyzer';
import { accountLabel } from '../lib/account-label';
import { clearAll, deleteOne, loadHistory, restoreSnapshot, saveAnalysis } from '../lib/storage';
import { useAnalysisStore } from '../store/useAnalysisStore';
const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    },
  },
  configurable: true,
});
const result = (day: string, account = 'owner') =>
  analyze([{ username: 'alice', href: 'https://evil.test' }], [], {
    account,
    snapshotDate: `2024-01-${day}`,
  });
beforeEach(async () => {
  memory.clear();
  await clearAll();
  useAnalysisStore.setState({
    current: null,
    previous: null,
    history: [],
    diffResult: null,
    hydrated: false,
    warning: null,
  });
});

test('stores compact records and restores derived relationships safely', async () => {
  const a = result('01');
  await saveAnalysis(a);
  const { history } = await loadHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].unfollowers[0].href, 'https://www.instagram.com/alice/');
  await deleteOne(a.id);
  assert.equal((await loadHistory()).history.length, 0);
});

test('anonymous groups survive storage and compare only when explicitly reused', async () => {
  const group = `local:${crypto.randomUUID()}`;
  const first = result('01', group);
  const separate = result('02', `local:${crypto.randomUUID()}`);
  await saveAnalysis(first);
  await saveAnalysis(separate);
  const loaded = await loadHistory();
  assert.equal(loaded.warning, null);
  assert.equal(loaded.history.length, 2);
  assert.equal(previousFor(loaded.history, separate), null);
  assert.equal(previousFor(loaded.history, result('03', group))?.id, first.id);
  assert.equal(accountLabel(group), '내 분석 기록');
  assert.equal(accountLabel('existing_user'), '@existing_user');
});

test('replaces same account/date and retains at most ten records per account', async () => {
  for (let i = 1; i <= 12; i++) await saveAnalysis(result(String(i).padStart(2, '0')));
  await saveAnalysis(result('12'));
  await saveAnalysis(result('01', 'other'));
  const { history } = await loadHistory();
  assert.equal(history.filter((h) => h.account === 'owner').length, 10);
  assert.equal(history.filter((h) => h.snapshotDate === '2024-01-12').length, 1);
  assert.equal(history.filter((h) => h.account === 'other').length, 1);
});

test('migrates old localStorage without treating unknown owners as comparable', async () => {
  const legacy = result('01');
  memory.set('insta-analyzer:v1', JSON.stringify({ history: [legacy] }));
  const { history } = await loadHistory();
  assert.equal(history[0].account, null);
  assert.equal(memory.has('insta-analyzer:v1'), false);
  assert.equal((await loadHistory()).history.length, 1);
});

test('invalid old data is preserved with a visible warning', async () => {
  memory.set('insta-analyzer:v1', 'broken');
  const loaded = await loadHistory();
  assert.ok(loaded.warning);
  assert.equal(memory.get('insta-analyzer:v1'), 'broken');
  assert.throws(() => restoreSnapshot({ ...result('01'), followers: [{ username: 'bad user' }] }));
});

test('sample results never persist, contaminate history, or compare with real records', async () => {
  await useAnalysisStore.getState().setCurrent(result('01'), { persist: true });
  const sample = { ...result('02'), isSample: true };
  await useAnalysisStore.getState().setCurrent(sample, { persist: true });
  assert.equal(useAnalysisStore.getState().history.length, 1);
  assert.equal(useAnalysisStore.getState().previous, null);
  assert.equal((await loadHistory()).history.length, 1);
});

test('storage failures preserve an in-memory analysis and show a warning', async () => {
  await useAnalysisStore.getState().hydrate();
  const original = globalThis.indexedDB;
  Object.defineProperty(globalThis, 'indexedDB', {
    value: {
      open() {
        throw new Error('denied');
      },
    },
    configurable: true,
  });
  try {
    const current = result('02');
    await useAnalysisStore.getState().setCurrent(current, { persist: true });
    assert.equal(useAnalysisStore.getState().current?.id, current.id);
    assert.match(useAnalysisStore.getState().warning ?? '', /저장하지 못했습니다/);
  } finally {
    Object.defineProperty(globalThis, 'indexedDB', { value: original, configurable: true });
  }
});

test('a failed replacement rolls back deletion of the previous snapshot', async () => {
  const original = result('01');
  await saveAnalysis(original);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function () {
    throw new DOMException('Storage full', 'QuotaExceededError');
  };
  try {
    await assert.rejects(saveAnalysis(result('01')), /Storage full/);
  } finally {
    IDBObjectStore.prototype.put = put;
  }
  const { history } = await loadHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].id, original.id);
});

test('deleting a baseline keeps the selected snapshot and recalculates its comparison', async () => {
  const first = result('01');
  const second = result('02');
  await useAnalysisStore.getState().setCurrent(first, { persist: true });
  await useAnalysisStore.getState().setCurrent(second, { persist: true });
  assert.equal(useAnalysisStore.getState().previous?.id, first.id);
  await useAnalysisStore.getState().removeFromHistory(first.id);
  assert.equal(useAnalysisStore.getState().current?.id, second.id);
  assert.equal(useAnalysisStore.getState().previous, null);
});
