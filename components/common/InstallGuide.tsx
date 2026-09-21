'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowDownToLine, Check, Plus, Share, Smartphone, X } from 'lucide-react';
import { trackSafeEvent } from '@/lib/analytics';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
type Platform = 'ios' | 'android' | 'desktop';

function subscribeStandalone(callback: () => void) {
  const media = window.matchMedia('(display-mode: standalone)');
  media.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    media.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}
function getStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone
  );
}

export function InstallGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const deferred = useRef<InstallEvent | null>(null);
  const [available, setAvailable] = useState(false);
  const standalone = useSyncExternalStore(subscribeStandalone, getStandalone, () => false);
  const [justInstalled, setInstalled] = useState(false);
  const installed = standalone || justInstalled;
  const [platform, setPlatform] = useState<Platform>('ios');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault();
      deferred.current = event as InstallEvent;
      setAvailable(true);
    };
    const done = () => {
      setInstalled(true);
      deferred.current = null;
      setAvailable(false);
      dialog.current?.close();
    };
    window.addEventListener('beforeinstallprompt', ready);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('beforeinstallprompt', ready);
      window.removeEventListener('appinstalled', done);
    };
  }, []);

  function openGuide() {
    const ua = navigator.userAgent;
    setPlatform(
      /iPhone|iPad|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        ? 'ios'
        : /Android/.test(ua)
          ? 'android'
          : 'desktop',
    );
    dialog.current?.showModal();
  }

  async function install() {
    const event = deferred.current;
    if (!event) return;
    setPending(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'accepted') trackSafeEvent('install_prompt_accepted');
      setMessage(
        choice.outcome === 'accepted'
          ? '설치를 요청했습니다. 기기의 홈 화면이나 앱 목록을 확인해주세요.'
          : '나중에 브라우저 메뉴에서 다시 추가할 수 있어요.',
      );
    } catch {
      setMessage('브라우저 메뉴에서 직접 추가해주세요. 아래 방법을 참고하세요.');
    } finally {
      deferred.current = null;
      setAvailable(false);
      setPending(false);
    }
  }

  const steps =
    platform === 'ios'
      ? [
          'Safari에서 이 사이트를 열어주세요.',
          '공유 버튼을 누른 뒤 “홈 화면에 추가”를 선택하세요.',
          '“웹 앱으로 열기”가 보이면 켜고, “추가”를 누르세요.',
        ]
      : platform === 'android'
        ? [
            'Chrome에서 이 사이트를 열어주세요.',
            '오른쪽 위 메뉴(⋮)를 누르세요.',
            '“홈 화면에 추가” 또는 “앱 설치”를 선택하세요.',
          ]
        : [
            'Chrome 또는 Edge에서 이 사이트를 열어주세요.',
            '주소창의 설치 아이콘 또는 브라우저 메뉴를 확인하세요.',
            '“앱 설치”를 선택하세요. 지원하지 않으면 북마크로 저장할 수 있어요.',
          ];

  return (
    <>
      <button
        ref={trigger}
        onClick={openGuide}
        className="flex w-full items-center gap-3 rounded-2xl glass-control p-4 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand">
          <Smartphone size={23} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">
            {installed ? '홈 화면에서 사용 중이에요' : '홈 화면에 추가하기'}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-600">
            홈 화면의 아이콘을 눌러 바로 열 수 있어요.
          </span>
        </span>
        {installed ? (
          <Check size={20} className="text-brand" />
        ) : (
          <Plus size={20} className="text-brand" />
        )}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="install-title"
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const r = dialog.current.getBoundingClientRect();
            if (
              event.clientX < r.left ||
              event.clientX > r.right ||
              event.clientY < r.top ||
              event.clientY > r.bottom
            )
              dialog.current.close();
          }
        }}
        className="w-[calc(100%-32px)] max-w-md max-h-[85dvh] rounded-3xl p-6 text-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Smartphone size={26} />
          </span>
          <button
            autoFocus
            aria-label="안내 닫기"
            onClick={() => dialog.current?.close()}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="install-title" className="mt-5 text-xl font-bold">
          홈 화면에 바로가기 추가
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          홈 화면에 추가하면 다음부터 주소를 입력하지 않고 바로 열 수 있어요.
        </p>
        {installed ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            이미 앱 화면으로 사용하고 있습니다.
          </p>
        ) : (
          available && (
            <button
              disabled={pending}
              onClick={install}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl primary-action p-3 font-semibold text-white disabled:opacity-50"
            >
              <ArrowDownToLine size={18} />
              {pending ? '설치 확인 중…' : '앱 설치하기'}
            </button>
          )
        )}
        <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1" aria-label="기기별 설치 방법">
          {(['ios', 'android', 'desktop'] as const).map((key) => (
            <button
              key={key}
              aria-pressed={platform === key}
              onClick={() => setPlatform(key)}
              className={`min-h-11 flex-1 rounded-lg px-2 text-xs font-semibold ${platform === key ? 'bg-white text-brand shadow-sm' : 'text-slate-600'}`}
            >
              {key === 'ios' ? 'iPhone · iPad' : key === 'android' ? 'Android' : '컴퓨터'}
            </button>
          ))}
        </div>
        <ol className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {index + 1}
              </span>
              <span>
                {step}
                {platform === 'ios' && index === 1 && (
                  <Share className="ml-1 inline text-brand" size={16} aria-label="공유 아이콘" />
                )}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          인스타그램·카카오톡 안에서 열었다면 Safari나 Chrome으로 다시 열어주세요. 메뉴 이름은
          기기와 브라우저에 따라 다를 수 있어요.
        </p>
        <p role="status" className="mt-3 text-sm text-brand">
          {message}
        </p>
      </dialog>
    </>
  );
}
