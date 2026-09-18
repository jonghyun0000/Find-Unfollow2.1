// components/ui/GlassCard.tsx
import { cn } from '@/lib/cn';

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('glass rounded-3xl p-5', className)} {...props}>
      {children}
    </div>
  );
}
