/**
 * TaskCard
 * ────────────────────────────────────────────────────────────────────────────
 * Reusable task row used across the app.
 *
 *   • Done checkbox with spring animation
 *   • Effort score as colored dots + numeric badge
 *   • Optional assignee chip, due date, recurrence badges
 *   • Right-side slot for custom actions (drag handle, dropdown, etc.)
 *   • Hover: subtle lift + brighter border
 *   • Done state: strikethrough + faded
 *
 * Layout: Flexbox row, with internal flex-wrap for metadata badges.
 */

import { CheckCircle2, Circle, Calendar, Repeat } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const EFFORT_COLORS: Record<number, string> = {
  1: '#10b981',
  2: '#84cc16',
  3: '#f59e0b',
  4: '#f97316',
  5: '#f43f5e',
};

const RECURRING_LABELS: Record<string, string> = {
  none: '',
  weekly: 'รายสัปดาห์',
  monthly: 'รายเดือน',
};

export interface TaskCardData {
  id: string;
  name: string;
  effortScore: 1 | 2 | 3 | 4 | 5;
  dueDate?: string;
  recurring?: 'none' | 'weekly' | 'monthly';
  done: boolean;
}

export interface TaskCardAssignee {
  name: string;
  color: string;
}

interface Props {
  task: TaskCardData;
  assignee?: TaskCardAssignee;
  onToggleDone?: () => void;
  rightSlot?: ReactNode;
  hideCheckbox?: boolean;
}

export default function TaskCard({
  task,
  assignee,
  onToggleDone,
  rightSlot,
  hideCheckbox,
}: Props) {
  const effortColor = EFFORT_COLORS[task.effortScore];

  return (
    <motion.div
      className="flex items-start gap-3 p-3.5 rounded-2xl transition-all"
      style={{
        backgroundColor: task.done ? 'rgba(var(--fg),0.015)' : 'rgba(var(--fg),0.035)',
        border: `1px solid ${task.done ? 'rgba(var(--fg),0.04)' : 'rgba(var(--fg),0.07)'}`,
      }}
      whileHover={{
        backgroundColor: 'rgba(var(--fg),0.06)',
        borderColor: 'rgba(var(--fg),0.12)',
        y: -1,
        transition: { duration: 0.15 },
      }}
    >
      {/* Checkbox with spring animation */}
      {!hideCheckbox && (
        <motion.button
          onClick={onToggleDone}
          className="mt-0.5 flex-shrink-0 transition"
          whileTap={{ scale: 0.85 }}
          style={{
            color: task.done ? '#10b981' : 'rgba(var(--fg),0.3)',
            filter: task.done ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' : 'none',
          }}
          aria-label={task.done ? 'ยกเลิกทำเสร็จ' : 'ทำเสร็จ'}
        >
          <motion.div
            initial={false}
            animate={{ rotate: task.done ? 360 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {task.done ? <CheckCircle2 size={19} /> : <Circle size={19} />}
          </motion.div>
        </motion.button>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium transition-all"
          style={{
            color: task.done ? 'rgba(var(--fg),0.3)' : 'rgba(var(--fg),0.92)',
            textDecoration: task.done ? 'line-through' : 'none',
          }}
        >
          {task.name}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {/* Effort dots + score */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${effortColor}15`,
              border: `1px solid ${effortColor}30`,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    i < task.effortScore ? effortColor : 'rgba(var(--fg),0.08)',
                  boxShadow:
                    i < task.effortScore ? `0 0 4px ${effortColor}` : 'none',
                }}
              />
            ))}
            <span
              className="ml-1 text-xs font-bold tabular-nums"
              style={{ color: effortColor }}
            >
              {task.effortScore}
            </span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-light"
              style={{
                backgroundColor: 'rgba(var(--fg),0.04)',
                color: 'rgba(var(--fg),0.55)',
                border: '1px solid rgba(var(--fg),0.06)',
              }}
            >
              <Calendar size={11} />
              {task.dueDate}
            </span>
          )}

          {/* Recurring */}
          {task.recurring && task.recurring !== 'none' && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-light"
              style={{
                backgroundColor: 'rgba(var(--fg),0.04)',
                color: 'rgba(var(--fg),0.55)',
                border: '1px solid rgba(var(--fg),0.06)',
              }}
            >
              <Repeat size={11} />
              {RECURRING_LABELS[task.recurring]}
            </span>
          )}

          {/* Assignee chip */}
          {assignee && (
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${assignee.color}, ${assignee.color}dd)`,
                boxShadow: `0 2px 12px ${assignee.color}60`,
              }}
            >
              {assignee.name}
            </span>
          )}
        </div>
      </div>

      {/* Right slot */}
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </motion.div>
  );
}
