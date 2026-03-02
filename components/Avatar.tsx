// Inline initials avatar — no external deps
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const PALETTE = [
  { bg: '#2D5560', fg: '#ffffff' }, // jade dark
  { bg: '#86A4AC', fg: '#ffffff' }, // sea
  { bg: '#B06C50', fg: '#ffffff' }, // rust
  { bg: '#AD9A7D', fg: '#ffffff' }, // sand
  { bg: '#4B6E75', fg: '#ffffff' }, // jade mid
  { bg: '#6A8E6E', fg: '#ffffff' }, // sage
  { bg: '#8B7355', fg: '#ffffff' }, // umber
];

function pickColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizes = {
  sm:  { dim: 32,  font: 12 },
  md:  { dim: 40,  font: 14 },
  lg:  { dim: 56,  font: 20 },
  xl:  { dim: 80,  font: 28 },
};

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const color  = pickColor(name);
  const { dim, font } = sizes[size];
  const letters = initials(name);

  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={name}
      style={{ flexShrink: 0 }}
    >
      <circle cx={dim / 2} cy={dim / 2} r={dim / 2} fill={color.bg} />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={color.fg}
        fontSize={font}
        fontFamily="sans-serif"
        fontWeight="600"
        letterSpacing="0.5"
      >
        {letters}
      </text>
    </svg>
  );
}
