// Fidelity levels: each value is the N×N grid size used for rasterization.
// Index 0 = most blocky, last index = finest circle.
export const GRID_SIZES = [8, 12, 16, 24, 32, 48, 64];

// Returns a CSS clip-path polygon() string that approximates a filled circle
// rasterized on an N×N pixel grid, where N = GRID_SIZES[fidelity - 1].
export function getCircleClipPath(fidelity: number): string {
  const index = Math.max(0, Math.min(fidelity - 1, GRID_SIZES.length - 1));
  return buildClipPath(GRID_SIZES[index]);
}

function buildClipPath(N: number): string {
  const cx = (N - 1) / 2;
  const cy = (N - 1) / 2;
  const r  = N / 2 - 0.5;

  // Rasterize: for each row find the leftmost and rightmost filled pixel
  const left:  number[] = [];
  const right: number[] = [];

  for (let row = 0; row < N; row++) {
    const dy = row - cy;
    const dx = Math.sqrt(Math.max(0, r * r - dy * dy));
    left[row]  = Math.ceil(cx - dx);
    right[row] = Math.floor(cx + dx);
  }

  // Trace clockwise polygon from row extents
  const pts: string[] = [];
  const pct = (v: number) => ((v / N) * 100).toFixed(2) + '%';

  // Top → bottom along the right edge
  for (let row = 0; row < N; row++) {
    pts.push(`${pct(right[row] + 1)} ${pct(row)}`);
    pts.push(`${pct(right[row] + 1)} ${pct(row + 1)}`);
  }
  // Bottom → top along the left edge
  for (let row = N - 1; row >= 0; row--) {
    pts.push(`${pct(left[row])} ${pct(row + 1)}`);
    pts.push(`${pct(left[row])} ${pct(row)}`);
  }

  return `polygon(${pts.join(', ')})`;
}
