// components/ui/Skeleton.tsx
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-11 h-11 rounded-full skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 skeleton" />
        <div className="h-3 w-1/3 skeleton" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass rounded-3xl p-5 space-y-3">
      <div className="h-3 w-1/3 skeleton" />
      <div className="h-8 w-1/2 skeleton" />
      <div className="h-3 w-2/3 skeleton" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-3xl p-5 space-y-3">
      <div className="h-4 w-2/5 skeleton" />
      <div className="h-40 w-full skeleton" />
    </div>
  );
}
