import { useState, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  UserPlus,
  ChevronRight,
  Trash2,
  ArrowLeft,
  UserCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import Hero from '../components/Hero';
import Avatar from '../components/Avatar';

type Mode = 'picker' | 'add';

export default function Onboarding() {
  const users = useStore((s) => s.users) ?? {};
  const { addUser, switchUser, removeUser } = useStore();
  const userList = Object.values(users).sort((a, b) => a.name.localeCompare(b.name));
  const hasUsers = userList.length > 0;

  const [mode, setMode] = useState<Mode>(hasUsers ? 'picker' : 'add');
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addUser(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeUser(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <Hero />

        <AnimatePresence mode="wait">
          {mode === 'picker' ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Title */}
              <div className="text-center mb-2 px-2">
                <h2 className="text-base font-bold" style={{ color: 'rgba(var(--fg),0.95)' }}>
                  เลือกบัญชีของคุณ
                </h2>
                <p
                  className="text-xs font-light mt-0.5"
                  style={{ color: 'rgba(var(--fg),0.5)' }}
                >
                  หรือเพิ่มบัญชีใหม่
                </p>
              </div>

              {/* User cards */}
              <div className="space-y-2">
                {userList.map((u, i) => (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="modern-card !p-0"
                  >
                    <motion.button
                      onClick={() => switchUser(u.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center gap-3 p-3 text-left transition"
                    >
                      <Avatar name={u.name} color={u.color} size={40} glow />
                      <span
                        className="flex-1 font-semibold truncate"
                        style={{ color: 'rgba(var(--fg),0.95)' }}
                      >
                        {u.name}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(99,102,241,0.15)',
                          color: '#a5b4fc',
                        }}
                      >
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </div>
                    </motion.button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-end gap-1 text-xs transition"
                      style={{
                        backgroundColor:
                          confirmDelete === u.id ? 'rgba(244,63,94,0.1)' : 'transparent',
                        borderTop: '1px solid rgba(var(--fg),0.05)',
                        color:
                          confirmDelete === u.id ? '#f43f5e' : 'rgba(var(--fg),0.35)',
                      }}
                    >
                      <Trash2 size={11} />
                      {confirmDelete === u.id ? 'กดอีกครั้งเพื่อยืนยัน' : 'ลบบัญชี'}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Add new button */}
              <motion.button
                onClick={() => setMode('add')}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm transition"
                style={{
                  backgroundColor: 'rgba(99,102,241,0.1)',
                  border: '1.5px dashed rgba(99,102,241,0.4)',
                  color: '#a5b4fc',
                }}
              >
                <UserPlus size={16} strokeWidth={2.4} />
                เพิ่มบัญชีใหม่
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="modern-card space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(217,70,239,0.25))',
                    border: '1px solid rgba(139,92,246,0.4)',
                  }}
                >
                  <UserCircle size={18} style={{ color: '#c4b5fd' }} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-base font-bold leading-tight"
                    style={{ color: 'rgba(var(--fg),0.95)' }}
                  >
                    สร้างบัญชีใหม่
                  </h2>
                  <p
                    className="text-xs font-light leading-tight mt-0.5"
                    style={{ color: 'rgba(var(--fg),0.55)' }}
                  >
                    บอกชื่อก่อนเริ่มใช้งาน
                  </p>
                </div>
                {hasUsers && (
                  <button
                    onClick={() => {
                      setMode('picker');
                      setName('');
                    }}
                    className="flex items-center gap-1 text-xs font-medium transition"
                    style={{ color: 'rgba(var(--fg),0.5)' }}
                  >
                    <ArrowLeft size={12} />
                    ย้อน
                  </button>
                )}
              </div>

              {/* Input */}
              <div className="space-y-1 mt-4">
                <label className="modern-label">
                  ชื่อของคุณ
                </label>
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อ..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKey}
                  autoFocus
                  className="modern-input"
                />
                <p
                  className="text-xs font-light leading-snug px-1"
                  style={{ color: 'rgba(var(--fg),0.45)' }}
                >
                  คุณจะถูกเพิ่มเป็นสมาชิกในทุกกลุ่มที่สร้างโดยอัตโนมัติ
                </p>
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleAdd}
                disabled={!name.trim()}
                whileHover={
                  name.trim()
                    ? { y: -2, boxShadow: '0 12px 32px rgba(99,102,241,0.5)' }
                    : {}
                }
                whileTap={name.trim() ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-2xl font-semibold transition text-sm"
                style={{
                  background: name.trim()
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)'
                    : 'rgba(var(--fg),0.08)',
                  boxShadow: name.trim() ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
                  opacity: name.trim() ? 1 : 0.5,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                เริ่มต้นใช้งาน
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
