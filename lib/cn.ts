// lib/cn.ts
// className을 안전하게 합쳐주는 유틸. (Tailwind 충돌 정리 포함)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
