import { state } from '../../core/state';
import { on } from '../../core/events';

const progFill = document.getElementById('progFill')!  as HTMLElement;
const progText = document.getElementById('progText')!  as HTMLElement;
const stackBtn = document.getElementById('stackBtn')!  as HTMLButtonElement;
const storeBtn = document.getElementById('storeBtn')!  as HTMLButtonElement;
const btnHint  = document.getElementById('btnHint')!   as HTMLElement;

export function init(): void {
  on('bubble:popped',        () => updateProgress());
  on('bubble:worker_popped', () => updateProgress());
  on('sheet:complete',       () => updateButtons());
  on('sheet:new',            () => { updateProgress(); updateButtons(); });
  on('stack:restocked',      () => updateButtons());
}

export function syncActions(): void {
  updateProgress();
  updateButtons();
}

function updateProgress(): void {
  const pct = Math.round((state.popped / state.gridTotal) * 100);
  progFill.style.width = pct + '%';
  progText.textContent = pct + '%';
}

function updateButtons(): void {
  const allPopped = state.popped === state.gridTotal;
  const hasSheets = state.sheets.length > 0;

  stackBtn.disabled    = !hasSheets || (!state.grabUnlocked && !allPopped);
  stackBtn.textContent = `[ GRAB NEW SHEET ] ${state.sheets.length} / ${state.maxStackSize}`;

  storeBtn.disabled = !state.storeUnlocked;

  btnHint.textContent = !state.grabUnlocked && !allPopped
    ? 'POP ALL BUBBLES FIRST'
    : !hasSheets
      ? 'OUT OF SHEETS — RUN TO STORE'
      : '';
}
