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
