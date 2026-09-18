// components/common/LoadingSpinner.tsx
'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 64, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #FCAF45, #F77737, #E1306C, #833AB4, #FCAF45)',
            mask: 'radial-gradient(circle, transparent 56%, black 58%)',
            WebkitMask: 'radial-gradient(circle, transparent 56%, black 58%)',
          }}
        />
      </motion.div>
      {label && <p className="text-sm text-slate-600">{label}</p>}
    </div>
  );
}
