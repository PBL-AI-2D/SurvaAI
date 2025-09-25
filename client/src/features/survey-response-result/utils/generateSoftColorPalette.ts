const baseColors = ['#FF6384', '#36A2EB', '#FFCE56', '#9966FF', '#4BC0C0'];

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const b = Math.min(255, (num & 0x0000ff) + amt);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateSoftColorPalette(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const base = baseColors[i % baseColors.length];
    const variation = adjustColor(base, (i % 3) * 5); // brightness tweak: 0%, 5%, 10%
    colors.push(variation);
  }
  return colors;
}
