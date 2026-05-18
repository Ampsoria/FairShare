/**
 * Avatar — circular avatar with initials, member color, optional glow.
 * Used inside member chips and dashboard headers.
 */
interface Props {
  name: string;
  color: string;
  size?: number;
  glow?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, color, size = 24, glow = false }: Props) {
  return (
    <span
      className="inline-flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: glow
          ? `0 0 12px ${color}80, 0 2px 8px ${color}50, inset 0 1px 0 rgba(255,255,255,0.25)`
          : `0 2px 6px ${color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
        border: '1.5px solid rgba(255,255,255,0.15)',
        letterSpacing: '-0.02em',
      }}
    >
      {getInitials(name)}
    </span>
  );
}
