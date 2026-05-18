/**
 * Confetti — fires a burst of colored bits when triggered.
 * Used as a delight moment when the assignment balances perfectly.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Bit {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b'];

function makeBits(count = 32): Bit[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -100 - Math.random() * 200,
    rotate: Math.random() * 720 - 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

interface Props {
  /** Toggle from false → true to fire a burst. */
  trigger: boolean;
}

export default function Confetti({ trigger }: Props) {
  const [bits, setBits] = useState<Bit[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setBits(makeBits());
      setActive(true);
      const t = setTimeout(() => setActive(false), 1800);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          {bits.map((bit) => (
            <motion.div
              key={bit.id}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: bit.x,
                y: bit.y + 600,
                rotate: bit.rotate,
                opacity: 0,
              }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute"
              style={{
                width: bit.shape === 'triangle' ? 0 : 8,
                height: bit.shape === 'triangle' ? 0 : 8,
                backgroundColor: bit.shape === 'triangle' ? 'transparent' : bit.color,
                borderRadius: bit.shape === 'circle' ? '50%' : 2,
                ...(bit.shape === 'triangle'
                  ? {
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: `8px solid ${bit.color}`,
                    }
                  : {}),
                boxShadow: `0 0 8px ${bit.color}80`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
