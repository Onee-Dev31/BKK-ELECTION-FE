export function sumVotes(results: { votes: number }[]): number {
  return results.reduce((sum, r) => sum + r.votes, 0);
}

export function calcPercent(votes: number, total: number): string {
  return total > 0 ? ((votes / total) * 100).toFixed(2) : '0.00';
}

export function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

export function formatVotes(v: number): string {
  return v.toLocaleString('th-TH');
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
