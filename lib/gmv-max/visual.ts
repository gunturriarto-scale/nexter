// Deterministic placeholder visuals for creator avatars / video covers / product
// images — this is mock data, there are no real TikTok CDN URLs to point at.

const PALETTE = [
  ["#f97316", "#ea580c"],
  ["#8b5cf6", "#6d28d9"],
  ["#06b6d4", "#0891b2"],
  ["#ec4899", "#db2777"],
  ["#22c55e", "#15803d"],
  ["#eab308", "#a16207"],
  ["#3b82f6", "#1d4ed8"],
  ["#f43f5e", "#be123c"],
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
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
