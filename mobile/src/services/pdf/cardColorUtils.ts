export function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function hexLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isLightHex(hex: string): boolean {
  return hexLuminance(hex) > 0.58;
}

export function mixHex(hex: string, hex2: string, ratio: number): string {
  const a = parseHex(hex);
  const b = parseHex(hex2);
  const t = Math.min(1, Math.max(0, ratio));
  const toByte = (from: number, to: number) =>
    Math.round(from + (to - from) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${toByte(a.r, b.r)}${toByte(a.g, b.g)}${toByte(a.b, b.b)}`;
}
