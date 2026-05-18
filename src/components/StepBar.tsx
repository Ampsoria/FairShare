import { Check } from 'lucide-react';
import type { AppStep } from '../types';

const STEPS: { key: AppStep; label: string }[] = [
  { key: 'setup', label: 'กลุ่ม' },
  { key: 'tasks', label: 'งาน' },
  { key: 'review', label: 'ตรวจสอบ' },
  { key: 'dashboard', label: 'ติดตาม' },
];

const ORDER: AppStep[] = ['setup', 'tasks', 'review', 'dashboard'];

interface Props {
  current: AppStep;
}

export default function StepBar({ current }: Props) {
  const currentIdx = ORDER.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-0 mb-5 sm:mb-6 px-1">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all"
                style={{
                  backgroundColor: done ? '#10b981' : active ? '#6366f1' : 'rgba(var(--fg),0.08)',
                  color: done || active ? '#fff' : 'rgba(var(--fg),0.4)',
                  boxShadow: active ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                {done ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className="text-[10px] sm:text-xs font-medium whitespace-nowrap"
                style={{
                  color: active
                    ? 'rgba(var(--fg),0.9)'
                    : done
                      ? 'rgba(16,185,129,0.9)'
                      : 'rgba(var(--fg),0.35)',
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="w-6 sm:w-10 h-0.5 mb-4 mx-1 transition-all flex-shrink-0"
                style={{
                  backgroundColor: idx < currentIdx ? '#10b981' : 'rgba(var(--fg),0.08)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
