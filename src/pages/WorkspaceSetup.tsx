import { useState, type KeyboardEvent } from 'react';
import {
  UserPlus,
  Link2,
  X,
  ArrowRight,
  ArrowLeft,
  Users,
  Hash,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, useActiveWorkspace } from '../store';
import StepBar from '../components/StepBar';
import Avatar from '../components/Avatar';

export default function WorkspaceSetup() {
  const workspace = useActiveWorkspace();
  const { setWorkspaceName, addMember, removeMember, setStep } = useStore();
  const [memberInput, setMemberInput] = useState('');

  if (!workspace) {
    return null;
  }

  const handleAddMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    addMember(name);
    setMemberInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddMember();
  };

  const canContinue = workspace.name.trim().length > 0 && workspace.members.length >= 2;
  const otherMembers = workspace.members.filter((m) => !m.isCurrentUser);
  const me = workspace.members.find((m) => m.isCurrentUser);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setStep('list')}
            className="flex items-center gap-1 transition text-sm"
            style={{ color: 'rgba(var(--fg),0.65)' }}
          >
            <ArrowLeft size={16} />
            โปรเจกต์ทั้งหมด
          </button>
        </div>

        <StepBar current="setup" />

        {/* Card with decorative accents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="modern-card space-y-5 sm:space-y-6 relative"
        >
          {/* Decorative gradient orb in corner */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
          />

          {/* Top accent stripe */}
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
            }}
          />

          <div className="relative flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <Users size={16} style={{ color: '#a5b4fc' }} strokeWidth={2.3} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold" style={{ color: 'rgba(var(--fg),0.95)' }}>
                สร้างกลุ่มทำงาน
              </h2>
              <p className="text-sm mt-1 font-light" style={{ color: 'rgba(var(--fg),0.7)' }}>
                ตั้งชื่อกลุ่มและเพิ่มเพื่อน
              </p>
            </div>
          </div>

          {/* Workspace name with icon prefix */}
          <div className="space-y-1 relative">
            <label className="modern-label">
              <Hash size={14} />
              ชื่อกลุ่ม
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="เช่น Senior Project, CS Group A"
                value={workspace.name}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="modern-input pr-10"
              />
              {workspace.name.trim() && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Sparkles size={14} style={{ color: '#a5b4fc' }} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <label className="modern-label mb-0">
                <Users size={14} />
                เพื่อนร่วมกลุ่ม
              </label>
              <motion.span
                key={workspace.members.length}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                style={{
                  background:
                    workspace.members.length >= 2
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.2))'
                      : 'rgba(var(--fg),0.06)',
                  color:
                    workspace.members.length >= 2
                      ? '#10b981'
                      : 'rgba(var(--fg),0.5)',
                  border: `1px solid ${
                    workspace.members.length >= 2
                      ? 'rgba(16,185,129,0.35)'
                      : 'rgba(var(--fg),0.1)'
                  }`,
                }}
              >
                {workspace.members.length} คน
              </motion.span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Current user — always shown, can't be removed */}
              {me && (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{
                    background: `linear-gradient(135deg, ${me.color}, ${me.color}cc)`,
                    boxShadow: `0 4px 16px ${me.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <Avatar name={me.name} color={me.color} size={22} />
                  {me.name}
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 ml-0.5">
                    คุณ
                  </span>
                </motion.span>
              )}

              <AnimatePresence>
                {otherMembers.map((m) => (
                  <motion.span
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: -4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    whileHover={{ y: -2, scale: 1.03 }}
                    className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-sm font-medium text-white cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
                      boxShadow: `0 4px 16px ${m.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    <Avatar name={m.name} color={m.color} size={22} />
                    {m.name}
                    <button
                      onClick={() => removeMember(m.id)}
                      className="hover:opacity-70 transition -mr-1"
                      aria-label={`ลบ ${m.name}`}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ชื่อเพื่อน..."
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="modern-input"
              />
              <motion.button
                onClick={handleAddMember}
                disabled={!memberInput.trim()}
                whileHover={memberInput.trim() ? { scale: 1.05, y: -1 } : {}}
                whileTap={memberInput.trim() ? { scale: 0.95 } : {}}
                className="px-4 py-3.5 text-white rounded-2xl disabled:cursor-not-allowed transition flex items-center justify-center gap-1 flex-shrink-0"
                style={{
                  background: memberInput.trim()
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))',
                  boxShadow: memberInput.trim()
                    ? '0 6px 20px rgba(99,102,241,0.4)'
                    : '0 2px 8px rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.5)',
                  minWidth: 54,
                }}
                aria-label="เพิ่มสมาชิก"
              >
                <UserPlus size={18} strokeWidth={2.4} />
              </motion.button>
            </div>
            {workspace.members.length < 2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-light pl-1 mt-1"
                style={{ color: 'rgba(var(--fg),0.6)' }}
              >
                ต้องการอย่างน้อย 2 คน
              </motion.p>
            )}
          </div>

          {/* Invite link */}
          <button className="subtle-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium">
            <Link2 size={16} />
            คัดลอกลิงก์เชิญเพื่อน
          </button>

          {/* Continue */}
          <motion.button
            onClick={() => setStep('tasks')}
            disabled={!canContinue}
            whileHover={canContinue ? { y: -2, boxShadow: '0 12px 32px rgba(99,102,241,0.5)' } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-semibold transition text-sm relative overflow-hidden"
                style={{
                  background: canContinue
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)'
                    : 'rgba(var(--fg),0.06)',
                  boxShadow: canContinue ? '0 8px 24px rgba(99,102,241,0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  color: canContinue ? '#ffffff' : 'rgba(var(--fg),0.45)',
                  border: canContinue ? '1px solid transparent' : '1px solid rgba(var(--fg),0.18)',
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                }}
          >
            ถัดไป — เพิ่มงาน
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
