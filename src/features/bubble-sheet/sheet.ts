import './sheet.css';
import { state, gridDims, SheetInstance } from '../../core/state';
import { emit } from '../../core/events';
import { Config } from '../../core/config';

const grid = document.getElementById('bubbleGrid')! as HTMLElement;

export function buildSheet(dims?: SheetInstance): void {
  const { cols, rows } = dims ?? gridDims();
  state.currentSheetDims = { cols, rows };
  const total = cols * rows;
  state.gridTotal = total;
  state.popped    = 0;
  state.bubbles   = [];

  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  emit('sheet:new');

  for (let i = 0; i < total; i++) {
    const el = document.createElement('div');
    el.className = 'bubble';

    const x = document.createElement('div');
    x.className = 'px-x';
    el.appendChild(x);

    el.addEventListener('click', () => popBubble(i));
    grid.appendChild(el);
    state.bubbles.push({ el, popped: false });
  }
}

// Silently re-applies popped state after a save load — no events emitted,
// no particles or flashes. state.popped is derived from the bubbles array.
export function restoreBubbles(poppedBubbles: boolean[]): void {
  state.popped = 0;
  poppedBubbles.forEach((wasPopped, i) => {
    if (!wasPopped || i >= state.bubbles.length) return;
    const { el } = state.bubbles[i];
    el.classList.add('popped');
    state.bubbles[i].popped = true;
    state.popped++;
  });
}

export function grabNewSheet(): void {
  if (!state.grabUnlocked && state.popped < state.gridTotal) return;
  if (state.sheets.length === 0) return;
  const sheet = state.sheets.shift()!;
  if (!state.storeUnlocked && state.sheets.length === 0) state.storeUnlocked = true;
  buildSheet(sheet);
}

export function restockSheets(): void {
  const dims = gridDims();
  while (state.sheets.length < state.maxStackSize) {
    state.sheets.push({ ...dims });
  }
  emit('stack:restocked');
}

// Shared mechanical pop — marks bubble, updates popped count, checks completion.
// Does NOT award oxygen or emit any event (callers do that).
function doPop(i: number): { x: number; y: number } {
  const { el } = state.bubbles[i];
  state.bubbles[i].popped = true;
  el.classList.add('popped', 'just-popped');
  setTimeout(() => el.classList.remove('just-popped'), Config.animation.popFlashMs);
  state.popped++;
  const r = el.getBoundingClientRect();
  if (state.popped === state.gridTotal) onSheetComplete();
  return { x: r.left + r.width / 2, y: r.top };
}

// Player pop — awards oxygen, emits bubble:popped
export function popBubbleAt(i: number): void {
  if (i < 0 || i >= state.bubbles.length) return;
  if (state.bubbles[i].popped) return;
  state.resources.oxygen += 1n;
  const pos = doPop(i);
  emit('bubble:popped', pos);
}

// Worker pop — no oxygen for the player, emits bubble:worker_popped
export function popBubbleWorker(i: number, chairPos: string): void {
  if (i < 0 || i >= state.bubbles.length) return;
  if (state.bubbles[i].popped) return;
  const pos = doPop(i);
  emit('bubble:worker_popped', { ...pos, chairPos });
}

function popBubble(i: number): void {
  popBubbleAt(i);
}

function onSheetComplete(): void {
  state.completedSheets++;
  if (!state.grabUnlocked) state.grabUnlocked = true;
  emit('sheet:complete');
}
