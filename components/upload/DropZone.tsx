'use client';
import { useId, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';
interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
}
export function DropZone({ files, onFilesChange }: Props) {
  const id = useId();
  const [hover, setHover] = useState(false);
  const add = (incoming: File[]) => onFilesChange([...files, ...incoming]);
  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          add(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          'block cursor-pointer rounded-3xl p-6 border-2 border-dashed text-center focus-within:outline focus-within:outline-2 focus-within:outline-brand focus-within:outline-offset-4',
          hover ? 'border-brand bg-brand-soft' : 'border-slate-300 bg-white/70',
        )}
      >
        <Upload className="mx-auto mb-3 text-brand" aria-hidden />
        <span className="font-semibold">인스타그램 파일을 선택하세요</span>
        <span className="block text-sm text-slate-600 mt-2">
          ZIP 압축을 푼 뒤 following.json과 모든 followers 파일을 선택하거나 끌어놓으세요.
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            add(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <span
          aria-hidden
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-soft px-6 text-sm font-semibold text-brand"
        >
          {files.length ? '파일 더 선택하기' : '파일 선택하기'}
        </span>
      </label>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="선택한 파일">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm"
            >
              <span className="min-w-0 flex-1 break-all">
                {file.name}{' '}
                <span className="text-slate-600">({(file.size / 1024).toFixed(0)}KB)</span>
              </span>
              <button
                type="button"
                className="p-3 rounded-lg hover:bg-slate-100"
                aria-label={`${file.name} 제거`}
                onClick={() => onFilesChange(files.filter((_, j) => i !== j))}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
