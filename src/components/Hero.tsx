import { GraduationCap, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';

const TITLE = 'FairShare';

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center mb-5 sm:mb-7 relative">
      {/* Animated logo with pulse rings */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
        className="relative mb-3 sm:mb-4 w-11 h-11 sm:w-12 sm:h-12"
      >
        {/* Pulse rings */}
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: '1px solid rgba(139, 92, 246, 0.35)' }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 1.1,
              ease: 'easeOut',
            }}
          />
        ))}

        <div
          className="float relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            boxShadow:
              '0 8px 28px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <GraduationCap size={20} className="text-white sm:hidden" strokeWidth={2.3} />
          <GraduationCap size={22} className="text-white hidden sm:block" strokeWidth={2.3} />

          <motion.div
            className="absolute -top-0.5 -right-0.5"
            animate={{ rotate: [0, 360], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles
              size={10}
              className="text-yellow-300"
              style={{ filter: 'drop-shadow(0 0 3px rgba(253, 224, 71, 0.8))' }}
            />
          </motion.div>

          <motion.div
            className="absolute -bottom-0.5 -left-0.5"
            animate={{ rotate: [360, 0], scale: [1, 0.7, 1] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <Star
              size={8}
              fill="#f472b6"
              className="text-pink-300"
              style={{ filter: 'drop-shadow(0 0 3px rgba(244, 114, 182, 0.8))' }}
            />
          </motion.div>
        </div>

        {/* Glow behind */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-45 -z-10"
          style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}
        />
      </motion.div>

      {/* Letter-by-letter title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text tracking-tight">
        {TITLE.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3 + i * 0.05,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            }}
            style={{ display: 'inline-block' }}
          >
            {char}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-xs sm:text-sm mt-1.5 sm:mt-2 font-light tracking-wide px-2"
        style={{ color: 'rgba(var(--fg),0.5)' }}
      >
        แบ่งงานกลุ่มในมหาลัย{' '}
        <span style={{ color: 'rgba(var(--fg),0.85)' }}>อย่างยุติธรรม</span>
      </motion.p>
    </div>
  );
}
