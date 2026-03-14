import { state, GRID } from '../state';
import { emit } from '../events';
import { Config } from '../config';

// Sheet owns its grid element directly — no ui.ts import needed
const grid = document.getElementById('bubbleGrid')!;

export function buildSheet(): void {
  state.popped  = 0;
  state.bubbles = [];
  grid.innerHTML = '';
  emit('sheet:new', { sheetNum: state.sheetNum });

  for (let i = 0; i < GRID; i++) {
    const el = document.createElement('div');
    el.className = 'bubble';

    const x = document.createElement('div');
    x.className = 'px-x';
    el.appendChild(x);

    el.addEventListener('click', () => popBubble(i, el));
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
  if (state.popped < GRID) return;
  state.sheetNum++;
  buildSheet();
}

function popBubble(i: number, el: HTMLElement): void {
  if (state.bubbles[i].popped) return;
  state.bubbles[i].popped = true;

  el.classList.add('popped', 'just-popped');
  setTimeout(() => el.classList.remove('just-popped'), Config.animation.popFlashMs);

  state.oxygen++;
  state.popped++;

  const r = el.getBoundingClientRect();
  emit('bubble:popped', { x: r.left + r.width / 2, y: r.top });

  if (state.popped === GRID) onSheetComplete();
}

function onSheetComplete(): void {
  state.sheets++;
  emit('sheet:complete');
}
