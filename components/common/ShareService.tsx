'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
export function ShareService() {
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState('');
  async function share() {
    const url = new URL(
      '/?utm_source=hallym&utm_medium=share&utm_campaign=campus_launch',
      window.location.origin,
    ).href;
    setMessage('');
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Unfollow Lens',
          text: '인스타 맞팔 관계, 내 기기에서 확인해봐. 로그인 없이 사용할 수 있어!',
          url,
        });
        setMessage('공유한 앱에서 링크가 전송됐는지 확인해주세요.');
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('서비스 링크를 복사했어요. 친구에게 붙여넣어 보내주세요.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setFallback(url);
      setMessage('아래 링크를 복사해 공유해주세요.');
    }
  }
  return (
    <section className="glass rounded-2xl p-4">
      <button
        type="button"
        onClick={share}
        className="flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-brand"
      >
        <Share2 size={18} />
        친구에게 링크 공유하기
      </button>
      <p className="mt-1 text-center text-xs text-slate-600">
        내 아이디와 분석 결과는 공유되지 않아요.
      </p>
      {message && (
        <p role="status" className="mt-2 text-xs text-slate-600">
          {message}
        </p>
      )}
      {fallback && (
        <input
          aria-label="복사할 서비스 링크"
          className="field mt-2 text-xs"
          readOnly
          value={fallback}
          onFocus={(e) => e.target.select()}
        />
      )}
    </section>
  );
}
