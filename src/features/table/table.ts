import './table.css';
import { state, tableGridSize } from '../../core/state';
import { on } from '../../core/events';

const gameTable    = document.getElementById('gameTable')!   as HTMLElement;
const emptyTable   = document.getElementById('emptyTable')!  as HTMLElement;
const bubbleSheet  = document.getElementById('bubbleSheet')! as HTMLElement;
const tableWrapper = document.querySelector('.table-wrapper') as HTMLElement;
const poppingArea  = document.querySelector('.popping-area') as HTMLElement;

const CELL_PX   = 72;  // bubble footprint: 64px bubble + 4px buffer each side
const TABLE_PAD = 24;  // per side → table = CELL_PX * n + TABLE_PAD * 2 = 72n + 48

function applyScale(): void {
  tableWrapper.style.zoom = '';
  const naturalW = tableWrapper.offsetWidth;
  const naturalH = tableWrapper.offsetHeight;
  if (naturalW === 0 || naturalH === 0) return;
  const scale = Math.min(
    (poppingArea.clientWidth  * 0.95) / naturalW,
    (poppingArea.clientHeight * 0.95) / naturalH,
  );
  if (scale < 1) {
    tableWrapper.style.zoom = String(scale);
  }
}

export function applyTableSize(): void {
  const n  = tableGridSize();
  const px = CELL_PX * n + TABLE_PAD * 2;
  gameTable.style.width  = px + 'px';
  gameTable.style.height = px + 'px';
  applyScale();
}

new ResizeObserver(applyScale).observe(poppingArea);

// Full sync after save restoration — reapplies size and overlay state
export function syncTable(): void {
  applyTableSize();
  if (state.popped === state.gridTotal) {
    bubbleSheet.style.display = 'none';
    emptyTable.classList.add('show');
  }
}

on('sheet:complete', () => {
  bubbleSheet.style.display = 'none';
  emptyTable.classList.add('show');
});

on('sheet:new', () => {
  bubbleSheet.style.display = '';
  emptyTable.classList.remove('show');
});

// Apply on module load
applyTableSize();
