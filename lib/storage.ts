import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from 'idb';
import type { AnalysisResult, InstaUser, Snapshot } from '@/types';
import { analyze } from '@/lib/analyzer';
import { MAX_USERS, normalizeUsername } from '@/lib/parser';
import { isLocalAccount } from '@/lib/account-label';

const LEGACY_KEY = 'insta-analyzer:v1';
const MAX_HISTORY = 10;
interface Database extends DBSchema {
  snapshots: { key: string; value: Snapshot };
}
const db = () =>
  openDB<Database>('unfollow-lens', 1, {
    upgrade(database) {
      database.createObjectStore('snapshots', { keyPath: 'id' });
    },
  });

async function atomic(
  database: IDBPDatabase<Database>,
  write: (tx: IDBPTransaction<Database, ['snapshots'], 'readwrite'>) => Promise<void>,
) {
  const tx = database.transaction('snapshots', 'readwrite');
  // Observe aborts immediately, including quota failures before tx.done is awaited.
  void tx.done.catch(() => {});
  try {
    await write(tx);
    await tx.done;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* The transaction may already be aborted. */
    }
    await tx.done.catch(() => {});
    throw error;
  }
}

function cleanUsers(value: unknown): InstaUser[] {
  if (!Array.isArray(value) || value.length > MAX_USERS)
    throw new Error('저장된 목록 형식이 올바르지 않습니다.');
  return value.map((user) => {
    if (!user || typeof user !== 'object') throw new Error('저장된 계정 형식이 올바르지 않습니다.');
    const username = normalizeUsername(user.username);
    const followedAt = user.followedAt;
    if (
      followedAt !== undefined &&
      (typeof followedAt !== 'number' ||
        !Number.isFinite(followedAt) ||
        followedAt < 0 ||
        followedAt > 8.64e12)
    )
      throw new Error('저장된 날짜가 올바르지 않습니다.');
    return { username, href: `https://www.instagram.com/${username}/`, followedAt };
  });
}
export function restoreSnapshot(value: unknown, legacy = false): AnalysisResult {
  if (!value || typeof value !== 'object') throw new Error('저장된 기록 형식이 올바르지 않습니다.');
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== 'string' ||
    !v.id ||
    typeof v.createdAt !== 'number' ||
    !Number.isFinite(v.createdAt) ||
    v.createdAt < 0 ||
    v.createdAt > 8.64e15
  )
    throw new Error('저장된 기록 형식이 올바르지 않습니다.');
  if (!legacy && v.version !== 2) throw new Error('지원하지 않는 기록 버전입니다.');
  const snapshotDate = legacy ? new Date(v.createdAt).toISOString().slice(0, 10) : v.snapshotDate;
  if (
    typeof snapshotDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate) ||
    new Date(snapshotDate).toISOString().slice(0, 10) !== snapshotDate
  )
    throw new Error('저장된 기준일이 올바르지 않습니다.');
  return analyze(cleanUsers(v.following), cleanUsers(v.followers), {
    id: v.id,
    createdAt: v.createdAt,
    snapshotDate,
    account:
      legacy || v.account === null
        ? null
        : isLocalAccount(v.account)
          ? v.account
          : normalizeUsername(v.account),
  });
}
function compact(result: AnalysisResult): Snapshot {
  const { version, id, createdAt, account, snapshotDate, followers, following } = result;
  return { version, id, createdAt, account, snapshotDate, followers, following };
}

export async function loadHistory(): Promise<{
  history: AnalysisResult[];
  warning: string | null;
}> {
  const database = await db();
  let warning: string | null = null;
  try {
    // Old records lack account/export dates, so retain them for viewing only.
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LEGACY_KEY) : null;
      if (raw) {
        const old = JSON.parse(raw);
        if (!Array.isArray(old.history)) throw new Error('invalid legacy history');
        const converted = old.history.map((record: unknown) => restoreSnapshot(record, true));
        await atomic(database, async (tx) => {
          for (const result of converted) await tx.store.put(compact(result));
        });
        window.localStorage.removeItem(LEGACY_KEY);
      }
    } catch {
      warning =
        '이전 버전의 기록을 옮기지 못했습니다. 기존 데이터는 보존되며, 설정에서 삭제할 수 있습니다.';
    }
    const history: AnalysisResult[] = [];
    for (const value of await database.getAll('snapshots')) {
      try {
        history.push(restoreSnapshot(value));
      } catch {
        warning =
          '읽을 수 없는 기록이 있습니다. 파일을 다시 분석하거나 설정에서 기록을 삭제해주세요.';
      }
    }
    return { history: history.sort((a, b) => b.createdAt - a.createdAt), warning };
  } finally {
    database.close();
  }
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  if (result.isSample) return;
  const database = await db();
  try {
    await atomic(database, async (tx) => {
      const all = await tx.store.getAll();
      const sameAccount = all.filter((h) => h.account === result.account && h.id !== result.id);
      // A second import of the same account/date replaces that day's snapshot.
      const retained = sameAccount
        .filter((h) => h.snapshotDate !== result.snapshotDate)
        .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate));
      const remove = sameAccount.filter(
        (h) => h.snapshotDate === result.snapshotDate || retained.indexOf(h) >= MAX_HISTORY - 1,
      );
      for (const h of remove) await tx.store.delete(h.id);
      await tx.store.put(compact(result));
    });
  } finally {
    database.close();
  }
}
export async function deleteOne(id: string) {
  const database = await db();
  try {
    await database.delete('snapshots', id);
  } finally {
    database.close();
  }
}
export async function clearAll() {
  const database = await db();
  try {
    await database.clear('snapshots');
  } finally {
    database.close();
  }
  if (typeof window !== 'undefined') window.localStorage.removeItem(LEGACY_KEY);
}
