/**
 * Particles — slowly drifting orbs that add ambient life to the background.
 * Pure CSS animation, no canvas. Lightweight + accessible (respects reduced motion).
 */
import { motion } from 'motion/react';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 14,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 12 + Math.random() * 18,
  delay: -Math.random() * 20,
  color: ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4'][i % 4],
}));

export default function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `radial-gradient(circle, ${p.color}80, ${p.color}00)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
            scale: [1, 1.3, 1, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
