import React from 'react'

export default function KvRow({ label, value, right }: { label: string; value: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr_140px] gap-3 px-4 py-2.5 border-t-2 border-text items-center max-sm:grid-cols-[120px_1fr]">
      <div className="font-mono tracking-widest text-text text-[13px]">{label}</div>
      <div className="text-[15px] text-text overflow-hidden">{value}</div>
      <div className="flex justify-end gap-2.5 items-center max-sm:justify-start">{right}</div>
    </div>
  );
}
