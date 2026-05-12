// store/useAnalysisStore.ts
// 전역 분석 결과 상태. localStorage 와 동기화된다.
// 페이지 간 이동 시 다시 분석하지 않도록 메모리에 유지.

'use client';

import { create } from 'zustand';
import type { AnalysisResult, DiffResult } from '@/types';
import { loadHistory, loadLatest, loadPrevious, saveAnalysis, clearAll, deleteOne } from '@/lib/storage';
import { diff } from '@/lib/analyzer';

interface AnalysisStore {
  // 데이터
  current: AnalysisResult | null;
  previous: AnalysisResult | null;
  history: AnalysisResult[];
  diffResult: DiffResult | null;

  // 액션
  hydrate: () => void;
  setCurrent: (result: AnalysisResult, options?: { persist?: boolean }) => void;
  resetAll: () => void;
  removeFromHistory: (id: string) => void;
  loadFromHistory: (id: string) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  current: null,
  previous: null,
  history: [],
  diffResult: null,

  /**
   * 첫 페이지 마운트 시 호출. localStorage에 있던 분석 기록을 메모리로 끌어올림.
   */
  hydrate: () => {
    const history = loadHistory();
    const current = loadLatest();
    const previous = loadPrevious();
    set({
      history,
      current,
      previous,
      diffResult: current ? diff(previous, current) : null,
    });
  },

  /**
   * 새 분석 결과를 저장. (옵션) localStorage에도 영구 저장.
   */
  setCurrent: (result, options = { persist: true }) => {
    const previous = loadLatest(); // 직전 최신을 "이전"으로
    if (options.persist !== false) {
      saveAnalysis(result);
    }
    const history = options.persist !== false ? loadHistory() : [result, ...get().history].slice(0, 10);
    set({
      current: result,
      previous,
      history,
      diffResult: diff(previous, result),
    });
  },

  resetAll: () => {
    clearAll();
    set({ current: null, previous: null, history: [], diffResult: null });
  },

  removeFromHistory: (id) => {
    deleteOne(id);
    const history = loadHistory();
    const current = loadLatest();
    const previous = loadPrevious();
    set({
      history,
      current,
      previous,
      diffResult: current ? diff(previous, current) : null,
    });
  },

  loadFromHistory: (id) => {
    const target = get().history.find((h) => h.id === id);
    if (!target) return;
    set({
      current: target,
      // history 상에서의 직전 항목을 previous로 사용
      previous: get().history[get().history.findIndex((h) => h.id === id) + 1] ?? null,
      diffResult: diff(
        get().history[get().history.findIndex((h) => h.id === id) + 1] ?? null,
        target,
      ),
    });
  },
}));
