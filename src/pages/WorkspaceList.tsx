import { useState } from 'react';
import {
  Plus,
  Users,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, useActiveUser, useMyWorkspaces } from '../store';
import Hero from '../components/Hero';
import Avatar from '../components/Avatar';
import UserMenu from '../components/UserMenu';

export default function WorkspaceList() {
  const user = useActiveUser();
  const wsArray = useMyWorkspaces();
  const { createWorkspace, openWorkspace, deleteWorkspace } = useStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const active = wsArray.filter((w) => w.status === 'active');
  const completed = wsArray.filter((w) => w.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        {/* Top bar: user menu + project count */}
        {user && (
          <div className="flex items-center justify-between mb-5">
            <UserMenu />
            <div className="flex items-center gap-1.5">
              <span
                className="text-lg font-bold tabular-nums gradient-text"
              >
                {wsArray.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(var(--fg),0.45)' }}>
                โปรเจกต์
              </span>
            </div>
          </div>
        )}

        <Hero />

        {/* Create new */}
        <motion.button
          onClick={createWorkspace}
          whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(99,102,241,0.45)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-2xl font-semibold transition text-sm mb-5"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}
        >
          <Plus size={18} strokeWidth={2.4} />
          สร้างโปรเจกต์ใหม่
        </motion.button>

        {/* Active workspaces */}
        {active.length > 0 && (
          <div className="space-y-2 mb-5">
            <h3
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-1"
              style={{ color: 'rgba(var(--fg),0.55)' }}
            >
              <Briefcase size={12} />
              กำลังดำเนินงาน ({active.length})
            </h3>
            <AnimatePresence>
              {active.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  ws={ws}
                  currentUserId={user?.id}
                  confirmDelete={confirmDelete === ws.id}
                  onClick={() => openWorkspace(ws.id)}
                  onDelete={() => {
                    if (confirmDelete === ws.id) {
                      deleteWorkspace(ws.id);
                      setConfirmDelete(null);
                    } else {
                      setConfirmDelete(ws.id);
                      setTimeout(() => setConfirmDelete(null), 3000);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed workspaces */}
        {completed.length > 0 && (
          <div className="space-y-2">
            <h3
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-1"
              style={{ color: 'rgba(var(--fg),0.55)' }}
            >
              <CheckCircle2 size={12} />
              เสร็จแล้ว ({completed.length})
            </h3>
            <AnimatePresence>
              {completed.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  ws={ws}
                  currentUserId={user?.id}
                  confirmDelete={confirmDelete === ws.id}
                  onClick={() => openWorkspace(ws.id)}
                  onDelete={() => {
                    if (confirmDelete === ws.id) {
                      deleteWorkspace(ws.id);
                      setConfirmDelete(null);
                    } else {
                      setConfirmDelete(ws.id);
                      setTimeout(() => setConfirmDelete(null), 3000);
                    }
                  }}
                  completed
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {wsArray.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8 rounded-2xl modern-card"
          >
            <Sparkles
              size={28}
              className="mx-auto mb-2"
              style={{ color: 'rgba(var(--fg),0.4)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'rgba(var(--fg),0.7)' }}>
              ยังไม่มีโปรเจกต์
            </p>
            <p className="text-xs font-light mt-1" style={{ color: 'rgba(var(--fg),0.4)' }}>
              สร้างโปรเจกต์แรกเพื่อเริ่มต้น
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  ws: ReturnType<typeof useStore.getState>['workspaces'][string];
  currentUserId?: string;
  confirmDelete: boolean;
  onClick: () => void;
  onDelete: () => void;
  completed?: boolean;
}

function WorkspaceCard({
  ws,
  currentUserId,
  confirmDelete,
  onClick,
  onDelete,
  completed,
}: CardProps) {
  const doneCount = ws.tasks.filter((t) => t.done).length;
  const totalTasks = ws.tasks.length;
  const otherMembers = ws.members.filter((m) => m.id !== currentUserId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl backdrop-blur-sm overflow-hidden"
      style={{
        backgroundColor: completed ? 'rgba(var(--fg),0.02)' : 'rgba(var(--fg),0.04)',
        border: '1px solid rgba(var(--fg),0.08)',
      }}
    >
      <button
        onClick={onClick}
        className="w-full p-3.5 flex items-center gap-3 text-left transition hover:bg-white/[0.02]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className="text-sm font-bold truncate"
              style={{ color: completed ? 'rgba(var(--fg),0.6)' : 'rgba(var(--fg),0.95)' }}
            >
              {ws.name || 'ไม่ได้ตั้งชื่อ'}
            </p>
            {completed && (
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
            )}
          </div>

          {/* Member avatars */}
          {otherMembers.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-2">
                {otherMembers.slice(0, 4).map((m) => (
                  <Avatar key={m.id} name={m.name} color={m.color} size={20} />
                ))}
                {otherMembers.length > 4 && (
                  <span
                    className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: 'rgba(var(--fg),0.1)',
                      color: 'rgba(var(--fg),0.7)',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    +{otherMembers.length - 4}
                  </span>
                )}
              </div>
              <span
                className="text-xs font-light"
                style={{ color: 'rgba(var(--fg),0.45)' }}
              >
                <Users size={11} className="inline mr-0.5" />
                {ws.members.length} คน
              </span>
            </div>
          )}

          {totalTasks > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div
                className="h-1.5 rounded-full overflow-hidden flex-1"
                style={{ backgroundColor: 'rgba(var(--fg),0.08)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(doneCount / totalTasks) * 100}%`,
                    background: completed
                      ? 'linear-gradient(90deg, #10b981, #14b8a6)'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium tabular-nums"
                style={{ color: 'rgba(var(--fg),0.5)' }}
              >
                {doneCount}/{totalTasks}
              </span>
            </div>
          )}
        </div>

        <ChevronRight size={16} style={{ color: 'rgba(var(--fg),0.3)' }} />
      </button>

      {/* Delete row */}
      <button
        onClick={onDelete}
        className="w-full px-3.5 py-1.5 flex items-center justify-end gap-1 text-xs transition"
        style={{
          backgroundColor: confirmDelete ? 'rgba(244,63,94,0.1)' : 'transparent',
          borderTop: '1px solid rgba(var(--fg),0.04)',
          color: confirmDelete ? '#f43f5e' : 'rgba(var(--fg),0.3)',
        }}
      >
        <Trash2 size={11} />
        {confirmDelete ? 'กดอีกครั้งเพื่อยืนยัน' : 'ลบ'}
      </button>
    </motion.div>
  );
}
