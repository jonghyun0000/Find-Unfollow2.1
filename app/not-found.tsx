import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <Link className="mt-5 inline-block rounded-xl bg-ig-gradient px-5 py-3" href="/">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
