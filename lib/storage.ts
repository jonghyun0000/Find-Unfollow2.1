// lib/storage.ts
// 모든 분석 결과는 브라우저 localStorage에만 저장한다.
// 서버 전송, 외부 API 호출 일체 없음.

import type { AnalysisResult } from '@/types';

const KEY = 'insta-analyzer:v1';
const MAX_HISTORY = 10; // 최근 10개까지만 유지

interface StoredData {
  history: AnalysisResult[]; // 가장 최신이 [0]
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadAll(): StoredData {
  if (!isBrowser()) return { history: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { history: [] };
    const data = JSON.parse(raw) as StoredData;
    if (!Array.isArray(data.history)) return { history: [] };
    return data;
  } catch {
    return { history: [] };
  }
}

export function saveAnalysis(result: AnalysisResult): void {
  if (!isBrowser()) return;
  const data = loadAll();
  const next: StoredData = {
    history: [result, ...data.history].slice(0, MAX_HISTORY),
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadHistory(): AnalysisResult[] {
  return loadAll().history;
}

export function loadLatest(): AnalysisResult | null {
  return loadAll().history[0] ?? null;
}

export function loadPrevious(): AnalysisResult | null {
  return loadAll().history[1] ?? null;
}

export function clearAll(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

export function deleteOne(id: string): void {
  if (!isBrowser()) return;
  const data = loadAll();
  const next: StoredData = {
    history: data.history.filter((h) => h.id !== id),
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
