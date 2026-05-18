import { useState } from 'react';
import {
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, useActiveWorkspace } from '../store';
import StepBar from '../components/StepBar';
import TaskCard from '../components/TaskCard';
import FairnessProgressBar from '../components/FairnessProgressBar';
import Confetti from '../components/Confetti';

const DAY_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTH_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const workspace = useActiveWorkspace();
  const { setStep, toggleTaskDone, reassignTask, completeWorkspace, reopenWorkspace } = useStore();

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [endCelebrate, setEndCelebrate] = useState(false);

  if (!workspace) return null;
  const tasks = workspace.tasks;
  const members = workspace.members;

  const weekDates = getWeekDates(weekAnchor);

  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  };

  // Compute member scores
  const scores: Record<string, number> = {};
  members.forEach((m) => (scores[m.id] = 0));
  tasks.forEach((t) => {
    if (t.assignedTo && scores[t.assignedTo] !== undefined) {
      scores[t.assignedTo] += t.effortScore;
    }
  });

  const scoreValues = Object.values(scores);
  const maxScore = Math.max(...scoreValues, 1);
  const groupAvg = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : 0;
  const isBalanced = Math.max(...scoreValues) - Math.min(...scoreValues) <= 2;

  const visibleTasks = showAll
    ? tasks
    : tasks.filter((t) => !t.dueDate || t.dueDate === selectedDate);

  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.dueDate) tasksByDate[t.dueDate] = (tasksByDate[t.dueDate] ?? 0) + 1;
  });

  const selectedDateObj = weekDates.find((d) => toISODate(d) === selectedDate);

  const cardStyle = {
    backgroundColor: 'rgba(var(--fg),0.03)',
    border: '1px solid rgba(var(--fg),0.08)',
  };

  const allDone = tasks.length > 0 && tasks.every((t) => t.done);
  const isCompleted = workspace.status === 'completed';

  const handleEndProject = () => {
    if (!workspace) return;
    setEndCelebrate(true);
    completeWorkspace(workspace.id);
    setTimeout(() => {
      setStep('list');
      setEndCelebrate(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8">
      <Confetti trigger={endCelebrate} />
      <div className="w-full max-w-md">
        {/* Nav */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <button
            onClick={() => setStep('list')}
            className="flex items-center gap-1 transition text-sm flex-shrink-0"
            style={{ color: 'rgba(var(--fg),0.5)' }}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">โปรเจกต์ทั้งหมด</span>
            <span className="sm:hidden">กลับ</span>
          </button>
          <span className="text-sm sm:text-base font-bold truncate text-center" style={{ color: 'rgba(var(--fg),0.95)' }}>
            {workspace.name}
          </span>
          <div className="w-12 sm:w-24 flex-shrink-0" />
        </div>

        <StepBar current="dashboard" />

        {/* Completed badge if workspace ended */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.18))',
              border: '1px solid rgba(16,185,129,0.35)',
              color: '#10b981',
            }}
          >
            <Trophy size={16} strokeWidth={2.3} />
            <span className="text-sm font-bold">โปรเจกต์เสร็จสมบูรณ์แล้ว</span>
          </motion.div>
        )}

        {/* Fairness card */}
        <div className="rounded-2xl p-5 mb-4 backdrop-blur-sm" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(var(--fg),0.6)' }}>
              ภาระงาน
            </h2>
            {isBalanced ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: 'rgba(16,185,129,0.95)',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <CheckCircle2 size={12} strokeWidth={2.5} />
                สมดุล
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: 'rgba(245,158,11,0.95)',
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <AlertTriangle size={12} strokeWidth={2.5} />
                ไม่สมดุล
              </span>
            )}
          </div>

          <div className="space-y-4">
            {members.map((m) => {
              const memberTasks = tasks.filter((t) => t.assignedTo === m.id);
              const doneTasks = memberTasks.filter((t) => t.done).length;
              return (
                <FairnessProgressBar
                  key={m.id}
                  name={m.name}
                  score={scores[m.id] ?? 0}
                  color={m.color}
                  groupMax={maxScore}
                  groupAverage={groupAvg}
                  doneCount={doneTasks}
                  totalCount={memberTasks.length}
                />
              );
            })}
          </div>
        </div>

        {/* Day strip */}
        <div className="rounded-2xl p-3 sm:p-4 mb-4 backdrop-blur-sm" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevWeek}
              className="p-1 transition"
              style={{ color: 'rgba(var(--fg),0.4)' }}
              aria-label="สัปดาห์ก่อน"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'rgba(var(--fg),0.85)' }}>
              {MONTH_TH[weekDates[0].getMonth()]} – {MONTH_TH[weekDates[6].getMonth()]} {weekDates[0].getFullYear()}
            </span>
            <button
              onClick={nextWeek}
              className="p-1 transition"
              style={{ color: 'rgba(var(--fg),0.4)' }}
              aria-label="สัปดาห์ถัดไป"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex justify-between gap-0.5">
            {weekDates.map((d) => {
              const iso = toISODate(d);
              const isSelected = iso === selectedDate;
              const isToday = toISODate(new Date()) === iso;
              const hasTasks = (tasksByDate[iso] ?? 0) > 0;
              return (
                <button
                  key={iso}
                  onClick={() => { setSelectedDate(iso); setShowAll(false); }}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                    boxShadow: isSelected ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isSelected ? 'rgba(var(--fg),0.85)' : 'rgba(var(--fg),0.4)',
                    }}
                  >
                    {DAY_TH[d.getDay()]}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isSelected
                        ? '#fff'
                        : isToday
                          ? '#a5b4fc'
                          : 'rgba(var(--fg),0.8)',
                    }}
                  >
                    {d.getDate()}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: hasTasks
                        ? (isSelected ? 'rgba(var(--fg),0.7)' : '#6366f1')
                        : 'transparent',
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(var(--fg),0.06)' }}>
            <span className="text-xs font-light" style={{ color: 'rgba(var(--fg),0.4)' }}>
              {selectedDateObj ? `${selectedDateObj.getDate()} ${MONTH_TH[selectedDateObj.getMonth()]}` : ''}
            </span>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs font-medium hover:underline"
              style={{ color: '#a5b4fc' }}
            >
              {showAll ? 'ดูตามวัน' : 'ดูงานทั้งหมด'}
            </button>
          </div>
        </div>

        {/* Task list by member */}
        <div className="space-y-4">
          {members.map((member) => {
            const memberTasks = visibleTasks.filter((t) => t.assignedTo === member.id);
            if (!memberTasks.length) return null;

            return (
              <div
                key={member.id}
                className="rounded-2xl overflow-hidden backdrop-blur-sm"
                style={cardStyle}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{
                    background: `linear-gradient(90deg, ${member.color}25, ${member.color}10)`,
                    borderBottom: '1px solid rgba(var(--fg),0.06)',
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: member.color,
                      boxShadow: `0 0 8px ${member.color}80`,
                    }}
                  />
                  <span
                    className="font-semibold text-sm"
                    style={{ color: 'rgba(var(--fg),0.95)' }}
                  >
                    {member.name}
                  </span>
                  <span
                    className="text-xs font-light ml-auto"
                    style={{ color: 'rgba(var(--fg),0.4)' }}
                  >
                    {memberTasks.filter((t) => t.done).length}/{memberTasks.length} เสร็จ
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  {memberTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{
                        id: task.id,
                        name: task.name,
                        effortScore: task.effortScore,
                        dueDate: task.dueDate,
                        recurring: task.recurring,
                        done: task.done,
                      }}
                      onToggleDone={() => toggleTaskDone(task.id)}
                      rightSlot={
                        <div className="relative">
                          <button
                            onClick={() =>
                              setReassigning(reassigning === task.id ? null : task.id)
                            }
                            className="flex items-center gap-0.5 text-xs transition"
                            style={{ color: 'rgba(var(--fg),0.3)' }}
                          >
                            <RotateCcw size={13} />
                            <ChevronDown size={11} />
                          </button>
                          {reassigning === task.id && (
                            <div
                              className="absolute right-0 top-6 z-10 rounded-xl overflow-hidden min-w-36"
                              style={{
                                backgroundColor: '#1a1a2e',
                                border: '1px solid rgba(var(--fg),0.1)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              }}
                            >
                              {members
                                .filter((m) => m.id !== member.id)
                                .map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      reassignTask(task.id, m.id);
                                      setReassigning(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs transition hover:bg-white/5"
                                    style={{ color: 'rgba(var(--fg),0.85)' }}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: m.color }}
                                    />
                                    {m.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {visibleTasks.length === 0 && (
            <div
              className="text-center py-10 rounded-2xl"
              style={{
                ...cardStyle,
                color: 'rgba(var(--fg),0.4)',
              }}
            >
              <p className="text-sm">ไม่มีงานในวันที่เลือก</p>
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 font-medium hover:underline text-xs"
                style={{ color: '#a5b4fc' }}
              >
                ดูงานทั้งหมด →
              </button>
            </div>
          )}
        </div>

        {/* End Project CTA — appears when all tasks done */}
        <AnimatePresence>
          {allDone && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="mt-6 rounded-2xl p-5 relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15), rgba(99,102,241,0.15))',
                border: '1.5px solid rgba(16,185,129,0.35)',
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}
              />
              <div className="relative flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Trophy size={32} style={{ color: '#10b981' }} strokeWidth={2.3} />
                </motion.div>
                <div className="text-center">
                  <p className="text-base font-bold" style={{ color: 'rgba(var(--fg),0.95)' }}>
                    ทุกคนทำงานเสร็จแล้ว
                  </p>
                  <p className="text-xs font-light mt-0.5" style={{ color: 'rgba(var(--fg),0.6)' }}>
                    ขอแสดงความยินดี กดสิ้นสุดเพื่อปิดโปรเจกต์
                  </p>
                </div>
                <motion.button
                  onClick={handleEndProject}
                  whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(16,185,129,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-white rounded-xl font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
                  }}
                >
                  <PartyPopper size={18} strokeWidth={2.3} />
                  สิ้นสุดงาน
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reopen if completed */}
        {isCompleted && (
          <button
            onClick={() => reopenWorkspace(workspace.id)}
            className="mt-4 subtle-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          >
            <RotateCcw size={15} />
            เปิดโปรเจกต์อีกครั้ง
          </button>
        )}

        {/* Edit tasks (only when active) */}
        {!isCompleted && (
          <button
            onClick={() => setStep('tasks')}
            className="mt-4 subtle-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
          >
            <RotateCcw size={15} />
            แก้ไขงาน
          </button>
        )}
      </div>
    </div>
  );
}
