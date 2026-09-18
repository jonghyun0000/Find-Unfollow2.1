'use client';
import { create } from 'zustand';
import type { AnalysisResult, DiffResult } from '@/types';
import { loadHistory, saveAnalysis, clearAll, deleteOne } from '@/lib/storage';
import { diff, previousFor } from '@/lib/analyzer';

interface AnalysisStore {
  current: AnalysisResult | null;
  previous: AnalysisResult | null;
  history: AnalysisResult[];
  diffResult: DiffResult | null;
  hydrated: boolean;
  warning: string | null;
  hydrate: () => Promise<void>;
  setCurrent: (result: AnalysisResult, options?: { persist?: boolean }) => Promise<void>;
  resetAll: () => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  loadFromHistory: (id: string) => void;
}
function selection(current: AnalysisResult | null, history: AnalysisResult[]) {
  const previous = current ? previousFor(history, current) : null;
  return { current, previous, diffResult: current ? diff(previous, current) : null };
}
let hydration: Promise<void> | null = null;
export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  current: null,
  previous: null,
  history: [],
  diffResult: null,
  hydrated: false,
  warning: null,
  hydrate: () => {
    if (get().hydrated) return Promise.resolve();
    if (hydration) return hydration;
    hydration = (async () => {
      try {
        const { history, warning } = await loadHistory();
        set({ history, warning, ...selection(history[0] ?? null, history), hydrated: true });
      } catch {
        set({
          hydrated: true,
          warning:
            '이 브라우저에서는 기록을 읽을 수 없습니다. 파일 분석은 계속 사용할 수 있습니다.',
        });
      } finally {
        hydration = null;
      }
    })();
    return hydration;
  },
  setCurrent: async (result, options) => {
    await get().hydrate();
    let history = get().history;
    let warning: string | null = null;
    if (options?.persist && !result.isSample) {
      try {
        await saveAnalysis(result);
        ({ history, warning } = await loadHistory());
      } catch {
        warning =
          '기록을 저장하지 못했습니다. 결과는 현재 화면에서 볼 수 있지만 새로고침하면 사라집니다. 저장 공간과 브라우저 설정을 확인해주세요.';
      }
    }
    set({ history, warning, ...selection(result, history) });
  },
  resetAll: async () => {
    try {
      await clearAll();
      set({ history: [], warning: null, ...selection(null, []) });
    } catch {
      set({
        warning: '기록을 모두 삭제하지 못했습니다. 브라우저의 사이트 데이터 설정에서 삭제해주세요.',
      });
    }
  },
  removeFromHistory: async (id) => {
    try {
      await deleteOne(id);
      const { history, warning } = await loadHistory();
      const current = get().current?.id === id ? (history[0] ?? null) : get().current;
      set({ history, warning, ...selection(current, history) });
    } catch {
      set({ warning: '기록을 삭제하지 못했습니다. 다시 시도해주세요.' });
    }
  },
  loadFromHistory: (id) => {
    const history = get().history;
    const current = history.find((h) => h.id === id);
    if (current) set(selection(current, history));
  },
}));
