import { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Zap,
  ClipboardList,
  Calendar,
  Repeat,
  Gauge,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, useActiveWorkspace } from '../store';
import type { Task } from '../types';
import StepBar from '../components/StepBar';

const EFFORT_LABELS: Record<number, string> = {
  1: 'ง่ายมาก',
  2: 'ง่าย',
  3: 'ปานกลาง',
  4: 'ยาก',
  5: 'หนักมาก',
};

const EFFORT_COLORS: Record<number, string> = {
  1: '#10b981',
  2: '#84cc16',
  3: '#f59e0b',
  4: '#f97316',
  5: '#f43f5e',
};

const RECURRING_LABELS: Record<string, string> = {
  none: 'ไม่มี',
  weekly: 'รายสัปดาห์',
  monthly: 'รายเดือน',
};

const TASK_SUGGESTIONS = [
  'ทำสไลด์พรีเซนต์',
  'เขียนรายงาน',
  'ค้นคว้าข้อมูล',
  'เขียน abstract',
  'ออกแบบ poster',
  'ทำ literature review',
  'ตรวจการอ้างอิง',
  'เขียนสคริปต์พรีเซนต์',
  'อัดวิดีโอนำเสนอ',
];

export default function TaskInput() {
  const workspace = useActiveWorkspace();
  const { addTask, removeTask, setStep, assignTasks } = useStore();
  const tasks = workspace?.tasks ?? [];

  if (!workspace) return null;

  const [name, setName] = useState('');
  const [effort, setEffort] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState<Task['recurring']>('none');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addTask({ name: trimmed, effortScore: effort, dueDate: dueDate || undefined, recurring });
    setName('');
    setEffort(3);
    setDueDate('');
    setRecurring('none');
  };

  const handleGenerate = () => {
    assignTasks();
    setStep('review');
  };

  const totalScore = tasks.reduce((sum, t) => sum + t.effortScore, 0);
  const randomPlaceholder = TASK_SUGGESTIONS[tasks.length % TASK_SUGGESTIONS.length];

  return (
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        {/* Nav */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <button
            onClick={() => setStep('setup')}
            className="flex items-center gap-1 transition text-sm hover:opacity-100"
            style={{ color: 'rgba(var(--fg),0.5)' }}
          >
            <ArrowLeft size={16} />
            ย้อนกลับ
          </button>
        </div>

        <StepBar current="tasks" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="modern-card space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'rgba(var(--fg),0.95)' }}>
              เพิ่มงานในโปรเจกต์
            </h2>
            <p className="text-sm mt-1 font-light" style={{ color: 'rgba(var(--fg),0.7)' }}>
              กำหนดระดับความยากของแต่ละงาน
            </p>
          </div>

          {/* Task name with icon prefix */}
          <div className="space-y-1">
            <label className="modern-label">
              <ClipboardList size={14} />
              ชื่องาน
            </label>
            <input
              type="text"
              placeholder={`เช่น ${randomPlaceholder}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="modern-input"
            />
          </div>

          {/* Effort score */}
          <div className="space-y-2">
            <label className="modern-label">
              <Gauge size={14} />
              ระดับความยาก
              <span className="font-bold normal-case ml-1" style={{ color: EFFORT_COLORS[effort] }}>
                {EFFORT_LABELS[effort]}
              </span>
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <motion.button
                  key={n}
                  onClick={() => setEffort(n)}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: effort === n ? EFFORT_COLORS[n] : 'rgba(var(--fg),0.04)',
                    border: `1.5px solid ${effort === n ? EFFORT_COLORS[n] : 'rgba(var(--fg),0.1)'}`,
                    color: effort === n ? '#fff' : 'rgba(var(--fg),0.5)',
                    boxShadow: effort === n ? `0 6px 20px ${EFFORT_COLORS[n]}60` : 'none',
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-xs font-light mt-1" style={{ color: 'rgba(var(--fg),0.6)' }}>
              <span>ง่าย</span>
              <span>หนักมาก</span>
            </div>
          </div>

          {/* Date + Recurring grid */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1">
              <label className="modern-label">
                <Calendar size={14} />
                Deadline
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="modern-input"
              />
            </div>

            <div className="space-y-1">
              <label className="modern-label">
                <Repeat size={14} />
                ความถี่
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as Task['recurring'])}
                className="modern-input cursor-pointer"
              >
                {Object.entries(RECURRING_LABELS).map(([val, label]) => (
                  <option key={val} value={val} style={{ backgroundColor: '#0a0a14' }}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add button */}
          <motion.button
            onClick={handleAdd}
            disabled={!name.trim()}
            whileHover={name.trim() ? { y: -2, boxShadow: '0 8px 24px rgba(20, 184, 166, 0.4)' } : {}}
            whileTap={name.trim() ? { scale: 0.98 } : {}}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold transition text-sm"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #14b8a6, #06b6d4)'
                : 'rgba(var(--fg),0.06)',
              boxShadow: name.trim() ? '0 4px 16px rgba(20, 184, 166, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
              color: name.trim() ? '#ffffff' : 'rgba(var(--fg),0.45)',
              border: name.trim() ? '1px solid transparent' : '1px solid rgba(var(--fg),0.18)',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={16} />
            เพิ่มงาน
          </motion.button>
        </motion.div>

        {/* Task list */}
        <AnimatePresence>
          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 modern-card !p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(var(--fg),0.8)' }}
                >
                  งานทั้งหมด ({tasks.length})
                </h3>
                <span
                  className="text-xs font-light tabular-nums"
                  style={{ color: 'rgba(var(--fg),0.65)' }}
                >
                  รวม {totalScore} คะแนน
                </span>
              </div>

              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                    className="flex items-center gap-3 p-3 rounded-2xl group"
                    style={{
                      backgroundColor: 'rgba(var(--fg),0.03)',
                      border: '1px solid rgba(var(--fg),0.06)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'rgba(var(--fg),0.9)' }}
                      >
                        {task.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                i < task.effortScore ? EFFORT_COLORS[task.effortScore] : 'rgba(var(--fg),0.1)',
                              boxShadow:
                                i < task.effortScore
                                  ? `0 0 4px ${EFFORT_COLORS[task.effortScore]}`
                                  : 'none',
                            }}
                          />
                        ))}
                        {task.recurring !== 'none' && (
                          <span
                            className="inline-flex items-center gap-1 ml-2 text-xs"
                            style={{ color: 'rgba(var(--fg),0.45)' }}
                          >
                            <Repeat size={10} />
                            {RECURRING_LABELS[task.recurring]}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className="inline-flex items-center gap-1 ml-2 text-xs"
                            style={{ color: 'rgba(var(--fg),0.45)' }}
                          >
                            <Calendar size={10} />
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => removeTask(task.id)}
                      whileHover={{ scale: 1.15, color: '#f43f5e' }}
                      whileTap={{ scale: 0.9 }}
                      className="transition flex-shrink-0"
                      style={{ color: 'rgba(var(--fg),0.35)' }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <motion.button
          onClick={handleGenerate}
          disabled={tasks.length === 0}
          whileHover={tasks.length > 0 ? { y: -2, boxShadow: '0 12px 32px rgba(99,102,241,0.45)' } : {}}
          whileTap={tasks.length > 0 ? { scale: 0.98 } : {}}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-semibold transition text-sm"
          style={{
            background:
              tasks.length > 0
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)'
                : 'rgba(var(--fg),0.06)',
            boxShadow: tasks.length > 0 ? '0 8px 24px rgba(99,102,241,0.35)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
            color: tasks.length > 0 ? '#ffffff' : 'rgba(var(--fg),0.45)',
            border: tasks.length > 0 ? '1px solid transparent' : '1px solid rgba(var(--fg),0.18)',
            cursor: tasks.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          <Zap size={16} />
          แบ่งงานอย่างยุติธรรม
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
