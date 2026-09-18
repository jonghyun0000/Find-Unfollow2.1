import { EmptyState } from '@/components/ui/EmptyState';
export function ResultEmpty({ hydrated }: { hydrated: boolean }) {
  return (
    <div className="mx-auto max-w-md p-6">
      {hydrated ? (
        <EmptyState
          icon={<span aria-hidden>↗</span>}
          title="먼저 데이터를 분석해주세요"
          description="인스타그램에서 받은 JSON 파일로 관계를 확인할 수 있습니다."
          ctaLabel="데이터 분석하기"
          ctaHref="/upload"
        />
      ) : (
        <p role="status" className="py-12 text-center text-slate-600">
          이 기기의 기록을 불러오는 중…
        </p>
      )}
    </div>
  );
}
