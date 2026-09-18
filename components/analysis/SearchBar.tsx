// components/analysis/SearchBar.tsx
'use client';

import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '아이디 검색' }: Props) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-11 pr-10 rounded-2xl glass text-sm placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-ig-pink/60"
        type="text"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full bg-white/8 hover:bg-white/15"
          aria-label="검색어 지우기"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
