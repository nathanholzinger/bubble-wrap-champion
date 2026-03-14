// Maps fidelity 1-N to a pixel-grid size.
// The circle is rasterized onto an N×N grid, then the polygon outline is
// extracted. Smaller N = coarser grid = blockier shape.
export const GRID_SIZES = [8, 12, 16, 24, 32, 48, 64];

export function getCircleClipPath(fidelity: number): string {
  const N = GRID_SIZES[Math.max(1, Math.min(GRID_SIZES.length, fidelity)) - 1];
  return buildClipPath(N);
}

interface RowExtent {
  L: number;
  R: number;
}

// Traces the clockwise polygon outline of a pixel-art filled circle on an
// N×N grid. Each row's left/right extents form a staircase boundary.
function buildClipPath(N: number): string {
  const cx = (N - 1) / 2;
  const r2 = cx * cx;

  const rows: (RowExtent | null)[] = Array.from({ length: N }, (_, row) => {
    let L = N, R = -1;
    for (let col = 0; col < N; col++) {
      if ((col - cx) ** 2 + (row - cx) ** 2 <= r2 + 1e-9) {
        if (col < L) L = col;
        if (col > R) R = col;
      }
    }
    return R >= 0 ? { L, R } : null;
  });

  const active = rows.reduce<number[]>((a, v, i) => (v ? [...a, i] : a), []);
  if (!active.length) return 'none';
  const rTop = active[0];
  const rBot = active[active.length - 1];

  const pts: string[] = [];
  const pct = (v: number) => +(v / N * 100).toFixed(2) + '%';
  const add = (x: number, y: number) => pts.push(`${pct(x)} ${pct(y)}`);
  const rowAt = (i: number) => rows[i] as RowExtent;

  add(rowAt(rTop).L, rTop);
  add(rowAt(rTop).R + 1, rTop);

  for (let row = rTop + 1; row <= rBot; row++) {
    const prev = rowAt(row - 1).R + 1;
    const curr = rowAt(row).R + 1;
    if (curr !== prev) { add(prev, row); add(curr, row); }
  }

  add(rowAt(rBot).R + 1, rBot + 1);
  add(rowAt(rBot).L,     rBot + 1);

  for (let row = rBot - 1; row >= rTop; row--) {
    const prev = rowAt(row + 1).L;
    const curr = rowAt(row).L;
    if (curr !== prev) { add(prev, row + 1); add(curr, row + 1); }
  }

  return `polygon(${pts.join(', ')})`;
}
