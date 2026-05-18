/**
 * UserMenu — header dropdown for switching profile / logout / adding new user.
 * Shows current user's avatar; click reveals a panel with all profiles.
 */
import { useEffect, useRef, useState } from 'react';
import {
  LogOut,
  UserPlus,
  Check,
  ChevronDown,
  Users as UsersIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, useActiveUser } from '../store';
import Avatar from './Avatar';

export default function UserMenu() {
  const user = useActiveUser();
  const { users, switchUser, logout, setStep } = useStore();
  const userList = Object.values(users).sort((a, b) => a.name.localeCompare(b.name));
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full transition"
        style={{
          backgroundColor: 'rgba(var(--fg),0.05)',
          border: '1px solid rgba(var(--fg),0.1)',
        }}
        aria-label="เมนูผู้ใช้"
      >
        <Avatar name={user.name} color={user.color} size={26} glow />
        <span
          className="text-xs font-semibold truncate max-w-[80px] hidden sm:inline"
          style={{ color: 'rgba(var(--fg),0.9)' }}
        >
          {user.name}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: 'rgba(var(--fg),0.5)',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(20,20,40,0.95)',
              border: '1px solid rgba(var(--fg),0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div
              className="px-3 py-2.5 flex items-center gap-1.5"
              style={{ borderBottom: '1px solid rgba(var(--fg),0.06)' }}
            >
              <UsersIcon size={12} style={{ color: 'rgba(var(--fg),0.5)' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(var(--fg),0.55)' }}
              >
                บัญชีผู้ใช้
              </span>
            </div>

            {/* User list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {userList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    if (u.id !== user.id) switchUser(u.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 transition hover:bg-white/[0.04]"
                >
                  <Avatar name={u.name} color={u.color} size={28} />
                  <span
                    className="flex-1 text-left text-sm font-medium truncate"
                    style={{
                      color:
                        u.id === user.id
                          ? 'rgba(var(--fg),0.95)'
                          : 'rgba(var(--fg),0.75)',
                    }}
                  >
                    {u.name}
                  </span>
                  {u.id === user.id && (
                    <Check size={14} style={{ color: '#10b981' }} strokeWidth={2.5} />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div
              className="px-1.5 py-1.5 space-y-0.5"
              style={{ borderTop: '1px solid rgba(var(--fg),0.06)' }}
            >
              <button
                onClick={() => {
                  setStep('onboarding');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition hover:bg-white/[0.04]"
                style={{ color: '#a5b4fc' }}
              >
                <UserPlus size={14} strokeWidth={2.3} />
                เพิ่มผู้ใช้ใหม่
              </button>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition hover:bg-rose-500/10"
                style={{ color: '#fb7185' }}
              >
                <LogOut size={14} strokeWidth={2.3} />
                ออกจากระบบ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
