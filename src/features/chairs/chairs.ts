import './chairs.css';
import { effectiveChairCount } from '../../core/state';
import { chairStats, POP_RATE } from './autoPopper';

// Purchase order → position (1st=south, 2nd=north, 3rd=east, 4th=west)
const POSITIONS = ['south', 'north', 'east', 'west'] as const;
type ChairPos = typeof POSITIONS[number];

const LABELS: Record<ChairPos, string> = {
  south: 'SOUTH CHAIR',
  north: 'NORTH CHAIR',
  east:  'EAST CHAIR',
  west:  'WEST CHAIR',
};

const tableArea = document.querySelector('.table-wrapper') as HTMLElement;
const chairEls: Partial<Record<ChairPos, HTMLElement>> = {};

// ── Popup ────────────────────────────────────────────────────────────────────

const popup = document.createElement('div');
popup.className = 'chair-popup';
popup.style.display = 'none';
document.body.appendChild(popup);

let activePos: ChairPos | null = null;

function openPopup(pos: ChairPos, anchor: HTMLElement): void {
  activePos = pos;
  renderPopup(pos);
  popup.style.display = '';

  const rect = anchor.getBoundingClientRect();
  const pw = popup.offsetWidth  || 220;
  const ph = popup.offsetHeight || 140;

  // Place above the chair by default, centered horizontally
  let top  = rect.top  - ph - 10;
  let left = rect.left + rect.width / 2 - pw / 2;

  // Clamp to viewport
  if (top  < 8)                         top  = rect.bottom + 10;
  if (left < 8)                         left = 8;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;

  popup.style.top  = top  + 'px';
  popup.style.left = left + 'px';
}

function closePopup(): void {
  popup.style.display = 'none';
  activePos = null;
}

function renderPopup(pos: ChairPos): void {
  const stats    = chairStats[pos];
  const popsPerSec = POP_RATE;
  const playerPerSec = (popsPerSec / 2).toFixed(2);
  const workerPerSec = (popsPerSec / 2).toFixed(2);

  popup.innerHTML = `
    <div class="chair-popup-title">${LABELS[pos]}</div>
    <div class="chair-popup-divider"></div>
    <div class="chair-popup-row main">POPS/SEC <span>${popsPerSec.toFixed(2)}</span></div>
    <div class="chair-popup-row sub">&gt; O2/SEC (YOU) <span>${playerPerSec}</span></div>
    <div class="chair-popup-row sub">&gt; O2/SEC (WORKER) <span>${workerPerSec}</span></div>
    <div class="chair-popup-divider"></div>
    <div class="chair-popup-row main">ALL-TIME POPS <span>${stats.totalPops}</span></div>
    <div class="chair-popup-row sub">&gt; O2 EARNED (YOU) <span>${stats.playerPops}</span></div>
    <div class="chair-popup-row sub">&gt; O2 EARNED (WORKER) <span>${stats.workerPops}</span></div>
  `;
}

// Re-render while open so stats update live
function tickPopup(): void {
  if (activePos !== null && popup.style.display !== 'none') {
    renderPopup(activePos);
  }
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (activePos !== null && !popup.contains(e.target as Node)) {
    closePopup();
  }
}, true);

// ── Chair elements ────────────────────────────────────────────────────────────

function createChair(pos: ChairPos): HTMLElement {
  const el = document.createElement('div');
  el.className = `chair chair--${pos}`;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activePos === pos) {
      closePopup();
    } else {
      openPopup(pos, el);
    }
  });
  return el;
}

export function updateChairs(): void {
  const count = effectiveChairCount();
  POSITIONS.forEach((pos, i) => {
    const exists      = !!chairEls[pos];
    const shouldExist = i < count;
    if (shouldExist && !exists) {
      const el = createChair(pos);
      tableArea.appendChild(el);
      chairEls[pos] = el;
    } else if (!shouldExist && exists) {
      chairEls[pos]!.remove();
      delete chairEls[pos];
      if (activePos === pos) closePopup();
    }
  });
}

export { tickPopup };
