import { state, effectiveChairCount } from '../../core/state';
import { on } from '../../core/events';
import { onUpdate } from '../../core/loop';
import { popBubbleAt, popBubbleWorker } from '../bubble-sheet/sheet';

const POP_RATE = 2; // pops per second per chair

const POSITIONS = ['south', 'north', 'east', 'west'] as const;
type ChairPos = typeof POSITIONS[number];

// Traversal order: array of bubble indices in the order each chair pops them
type Orders = Record<ChairPos, number[]>;

let orders: Orders = { south: [], north: [], east: [], west: [] };

const cursors:      Record<ChairPos, number>  = { south: 0, north: 0, east: 0, west: 0 };
const accums:       Record<ChairPos, number>  = { south: 0, north: 0, east: 0, west: 0 };
// Worker claims the 1st pop, player gets the 2nd, then alternates per chair
const workerTurn:   Record<ChairPos, boolean> = { south: true, north: true, east: true, west: true };

// ── Traversal builders ────────────────────────────────────────────────────────
//
// Grid index = row * cols + col  (row 0 = top, col 0 = left)
//
// South: bottom-right → left, snake upward
// North: top-left     → right, snake downward
// East:  top-right    → down,  snake leftward
// West:  bottom-left  → up,    snake rightward

function buildSouth(cols: number, rows: number): number[] {
  const out: number[] = [];
  for (let r = rows - 1; r >= 0; r--) {
    const step = rows - 1 - r;
    if (step % 2 === 0) {
      for (let c = cols - 1; c >= 0; c--) out.push(r * cols + c);
    } else {
      for (let c = 0; c < cols; c++) out.push(r * cols + c);
    }
  }
  return out;
}

function buildNorth(cols: number, rows: number): number[] {
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c++) out.push(r * cols + c);
    } else {
      for (let c = cols - 1; c >= 0; c--) out.push(r * cols + c);
    }
  }
  return out;
}

function buildEast(cols: number, rows: number): number[] {
  const out: number[] = [];
  for (let c = cols - 1; c >= 0; c--) {
    const step = cols - 1 - c;
    if (step % 2 === 0) {
      for (let r = 0; r < rows; r++) out.push(r * cols + c);
    } else {
      for (let r = rows - 1; r >= 0; r--) out.push(r * cols + c);
    }
  }
  return out;
}

function buildWest(cols: number, rows: number): number[] {
  const out: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (c % 2 === 0) {
      for (let r = rows - 1; r >= 0; r--) out.push(r * cols + c);
    } else {
      for (let r = 0; r < rows; r++) out.push(r * cols + c);
    }
  }
  return out;
}

function rebuildOrders(): void {
  const { cols, rows } = state.currentSheetDims;
  orders = {
    south: buildSouth(cols, rows),
    north: buildNorth(cols, rows),
    east:  buildEast(cols, rows),
    west:  buildWest(cols, rows),
  };
}

function resetState(): void {
  for (const pos of POSITIONS) {
    cursors[pos]    = 0;
    accums[pos]     = 0;
    workerTurn[pos] = true;
  }
}

// ── Tick ─────────────────────────────────────────────────────────────────────

function popNext(pos: ChairPos): void {
  const order = orders[pos];
  let cursor = cursors[pos];
  while (cursor < order.length) {
    const idx = order[cursor++];
    if (!state.bubbles[idx]?.popped) {
      if (workerTurn[pos]) {
        popBubbleWorker(idx, pos);
      } else {
        popBubbleAt(idx);
      }
      workerTurn[pos] = !workerTurn[pos];
      break;
    }
  }
  cursors[pos] = cursor;
}

function tick(dt: number): void {
  const count = effectiveChairCount();
  if (count === 0) return;

  for (let i = 0; i < POSITIONS.length && i < count; i++) {
    const pos = POSITIONS[i];
    accums[pos] += POP_RATE * dt;
    const pops = Math.floor(accums[pos]);
    if (pops === 0) continue;
    accums[pos] -= pops;
    for (let p = 0; p < pops; p++) popNext(pos);
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

export function initAutoPoppers(): void {
  rebuildOrders();
  on('sheet:new', () => {
    rebuildOrders();
    resetState();
  });
  onUpdate(tick);
}
