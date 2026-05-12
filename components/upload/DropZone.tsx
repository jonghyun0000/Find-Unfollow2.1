// components/upload/DropZone.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileJson, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  hint?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
}

/**
 * 드래그앤드롭 + 클릭 업로드 모두 지원하는 단일 파일 입력.
 */
export function DropZone({ label, hint, file, onFileChange, accept = '.json,application/json' }: Props) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setHover(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileChange(f);
    },
    [onFileChange],
  );

  return (
    <motion.label
      whileHover={{ y: -2 }}
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={handleDrop}
      className={cn(
        'block cursor-pointer rounded-3xl p-5 transition-all',
        'border-2 border-dashed',
        hover
          ? 'border-ig-pink bg-ig-soft'
          : file
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-white/15 bg-white/[0.03] hover:border-white/30',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      <div className="flex items-center gap-4">
        <div
          className={cn(
            'grid place-items-center w-12 h-12 rounded-2xl shrink-0',
            file ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-white/70',
          )}
        >
          {file ? <FileJson size={22} /> : <Upload size={22} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[12.5px] text-white/55 truncate">
            {file ? file.name : hint ?? 'JSON 파일을 드래그하거나 탭하여 선택'}
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFileChange(null); }}
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
            aria-label="파일 제거"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </motion.label>
  );
}
