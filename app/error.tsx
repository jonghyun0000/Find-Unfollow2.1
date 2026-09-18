'use client';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">화면을 불러오지 못했습니다</h1>
      <p className="mt-3 text-slate-600">
        다시 시도하거나 페이지를 새로고침해주세요. 원본 파일은 변경되지 않습니다.
      </p>
      <button className="mt-5 rounded-xl bg-brand text-white px-5 py-3" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
