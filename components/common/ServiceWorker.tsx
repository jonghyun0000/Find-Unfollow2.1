'use client';
import { useEffect, useState } from 'react';
export function ServiceWorker() {
  const [update, setUpdate] = useState<ServiceWorkerRegistration | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let controlled = !!navigator.serviceWorker.controller;
    const reload = () => {
      setUpdate(null);
      if (controlled) window.location.reload();
      controlled = true;
    };
    const check = () => {
      if (registration?.waiting && navigator.serviceWorker.controller && !disposed)
        setUpdate(registration);
    };
    const found = () => registration?.installing?.addEventListener('statechange', check);
    navigator.serviceWorker.addEventListener('controllerchange', reload);
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        if (disposed) return;
        registration = reg;
        check();
        reg.addEventListener('updatefound', found);
      })
      .catch(() => {
        /* Online analysis still works when offline installation is unavailable. */
      });
    return () => {
      disposed = true;
      registration?.removeEventListener('updatefound', found);
      navigator.serviceWorker.removeEventListener('controllerchange', reload);
    };
  }, []);
  return update ? (
    <aside className="mx-auto max-w-md px-5 py-3 text-sm" role="status">
      새 버전을 사용할 수 있습니다. 저장하지 않은 결과는 새로고침하면 사라집니다.{' '}
      <button
        className="mt-2 rounded-lg bg-white/10 p-3 font-semibold"
        onClick={() => update.waiting?.postMessage({ type: 'SKIP_WAITING' })}
      >
        새 버전으로 새로고침
      </button>
    </aside>
  ) : null;
}
