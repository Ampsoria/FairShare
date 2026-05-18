/**
 * FairnessProgressBar
 * ────────────────────────────────────────────────────────────────────────────
 * Visually represents one member's accumulated effort vs the group average.
 *
 *   • Bar fills proportionally to score / groupMax with animated width.
 *   • Shimmer sweeps across the fill to draw the eye.
 *   • A subtle average marker shows where the group average sits.
 *   • Score number animates up from 0 → final value (count-up).
 *   • Color is per-member (their assigned color) for at-a-glance scanning.
 *
 * Layout: Flexbox for the row, relative container for marker overlay.
 */

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import Avatar from './Avatar';

interface Props {
  name: string;
  score: number;
  color: string;
  groupMax: number;
  groupAverage: number;
  doneCount?: number;
  totalCount?: number;
}

export default function FairnessProgressBar({
  name,
  score,
  color,
  groupMax,
  groupAverage,
  doneCount,
  totalCount,
}: Props) {
  const fillPct = groupMax > 0 ? (score / groupMax) * 100 : 0;
  const avgMarkerPct = groupMax > 0 ? (groupAverage / groupMax) * 100 : 0;
  const delta = score - groupAverage;

  // Count-up animation for the score number
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on('change', setDisplayScore);
    return () => {
      controls.stop();
      unsub();
    };
  }, [score, count, rounded]);

  return (
    <div className="space-y-1.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={name} color={color} size={26} glow />
          <span className="text-sm font-semibold truncate" style={{ color: 'rgba(var(--fg),0.92)' }}>
            {name}
          </span>
          {typeof doneCount === 'number' && typeof totalCount === 'number' && (
            <span
              className="text-xs font-light tabular-nums flex-shrink-0"
              style={{ color: 'rgba(var(--fg),0.35)' }}
            >
              {doneCount}/{totalCount}
            </span>
          )}
        </div>
        <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color }}>
          {displayScore} <span className="text-xs font-light opacity-60">pts</span>
        </span>
      </div>

      {/* Bar with marker overlay */}
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(var(--fg),0.06)' }}
      >
        {/* Animated fill */}
        <motion.div
          className="relative h-full rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 16px ${color}80`,
          }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer" />
        </motion.div>

        {/* Average marker */}
        {groupMax > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${avgMarkerPct}%`,
              backgroundColor: 'rgba(var(--fg),0.5)',
              boxShadow: '0 0 6px rgba(var(--fg),0.5)',
            }}
          >
            <div
              className="absolute -top-1 -left-0.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(var(--fg),0.7)' }}
            />
          </div>
        )}
      </div>

      {/* Delta from average */}
      <div className="flex items-center justify-between text-xs font-light tabular-nums">
        <span style={{ color: 'rgba(var(--fg),0.3)' }}>
          ค่าเฉลี่ย {groupAverage.toFixed(1)}
        </span>
        <span
          style={{
            color:
              Math.abs(delta) <= 1
                ? 'rgba(16,185,129,0.7)'
                : delta > 0
                  ? 'rgba(245,158,11,0.7)'
                  : 'rgba(var(--fg),0.35)',
          }}
        >
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)} {Math.abs(delta) <= 1 && '✓'}
        </span>
      </div>
    </div>
  );
}
