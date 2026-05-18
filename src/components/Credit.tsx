import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function Credit() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="fixed z-40 select-none"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
        right: 'calc(env(safe-area-inset-right, 0px) + 0.75rem)',
      }}
    >
      <div
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium"
        style={{
          backgroundColor: 'rgba(var(--fg), 0.04)',
          border: '1px solid rgba(var(--fg), 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'rgba(var(--fg), 0.55)',
        }}
      >
        <span className="hidden sm:inline">Made with</span>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-flex' }}
        >
          <Heart size={10} fill="#f43f5e" stroke="#f43f5e" />
        </motion.span>
        <span className="hidden sm:inline">by</span>
        <span
          className="font-bold gradient-text"
          style={{ letterSpacing: '0.02em' }}
        >
          Ampsoria
        </span>
      </div>
    </motion.div>
  );
}
