const PALETTES = [
  ["#2B4570", "#C1432A"],
  ["#4A6B3A", "#E8B14D"],
  ["#6B3A5C", "#2B4570"],
  ["#8A4B2B", "#1D2F4D"],
];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const hash = hashSeed(seed || "dispatch");
  const [colorA, colorB] = PALETTES[hash % PALETTES.length];
  const rotation = hash % 360;
  const initial = (seed || "?").charAt(0).toUpperCase();

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-mono font-medium text-paper"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${rotation}deg, ${colorA}, ${colorB})`,
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
}
