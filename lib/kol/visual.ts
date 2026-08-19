// Deterministic placeholder avatars — mock data, no real TikTok CDN URLs.
// Kept independent from lib/gmv-max/visual.ts on purpose (KOL dashboard
// stays a separate module from GMV Max).

const PALETTE = [
  ["#14b8a6", "#0f766e"],
  ["#f97316", "#c2410c"],
  ["#a855f7", "#7e22ce"],
  ["#ef4444", "#b91c1c"],
  ["#3b82f6", "#1e40af"],
  ["#eab308", "#a16207"],
  ["#ec4899", "#be185d"],
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function gradientFor(seed: string): string {
  const [a, b] = PALETTE[hash(seed) % PALETTE.length];
  const angle = hash(seed + "angle") % 360;
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

export function initialsFor(label: string): string {
  const clean = label.replace(/^[@.]/, "").trim();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
