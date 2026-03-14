import { state, GRID } from './state';
import { on } from './events';
import { Config } from './config';
import { RESOURCES, ResourceId } from './resources';

export interface DomRefs {
  progFill:  HTMLElement;
  progText:  HTMLElement;
  stackBtn:  HTMLButtonElement;
  storeBtn:  HTMLButtonElement;
  btnHint:   HTMLElement;
  sheetDone: HTMLElement;
  milBar:    HTMLElement;
}

// Per-resource DOM nodes populated during init()
const resourceRows: Partial<Record<ResourceId, HTMLElement>> = {}; // the stat-row (for show/hide)
const resourceEls:  Partial<Record<ResourceId, HTMLElement>> = {}; // the stat-value (for text)

function getEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

export const dom: DomRefs = {
  progFill:  getEl('progFill'),
  progText:  getEl('progText'),
  stackBtn:  getEl('stackBtn') as HTMLButtonElement,
  storeBtn:  getEl('storeBtn') as HTMLButtonElement,
  btnHint:   getEl('btnHint'),
  sheetDone: getEl('sheetDone'),
  milBar:    getEl('milestoneBanner'),
};

export function init(): void {
  buildResourceRows();

  on('bubble:popped', ({ x, y }) => {
    spawnParticle(x, y);
    const oxygenEl = resourceEls['oxygen'];
    if (oxygenEl) flashStat(oxygenEl);
    updateUI();
  });

  on('sheet:complete', () => {
    dom.sheetDone.classList.add('show');
    updateButtons();
    updateUI();
  });

  on('stack:restocked', () => {
    updateButtons();
  });

  on('sheet:new', () => {
    dom.sheetDone.classList.remove('show');
    dom.stackBtn.disabled = true;
    dom.storeBtn.disabled = true;
    dom.btnHint.textContent = 'POP ALL BUBBLES FIRST';
    updateUI();
  });
}

// Forces a full UI sync from state — used after save restoration
export function syncUI(): void {
  updateUI();
  if (state.popped === GRID) {
    dom.sheetDone.classList.add('show');
    updateButtons();
  }
}

// ── Internal ─────────────────────────────────────────────────────────────────

function buildResourceRows(): void {
  const container = getEl('resourceStats');
  container.style.cssText = 'display:flex;flex-direction:column;gap:10px';

  for (const { id, label } of RESOURCES) {
    const row = document.createElement('div');
    row.className    = 'stat-row';
    row.style.display = 'none'; // hidden until value > 0

    const lbl = document.createElement('div');
    lbl.className   = 'stat-label';
    lbl.textContent = '> ' + label;

    const val = document.createElement('div');
    val.className   = 'stat-value';
    val.textContent = '0';

    row.appendChild(lbl);
    row.appendChild(val);
    container.appendChild(row);

    resourceRows[id] = row;
    resourceEls[id]  = val;
  }
}

function updateUI(): void {
  for (const { id } of RESOURCES) {
    const row = resourceRows[id];
    const el  = resourceEls[id];
    if (!row || !el) continue;
    const val = state.resources[id];
    if (val > 0) {
      row.style.display = '';
      el.textContent    = fmt(val);
    } else {
      row.style.display = 'none';
    }
  }

  const pct = Math.round((state.popped / GRID) * 100);
  dom.progFill.style.width = pct + '%';
  dom.progText.textContent = pct + '%';
}

function updateButtons(): void {
  const sheetDone = state.popped === GRID;
  const hasSheets = state.sheetsInStack > 0;

  dom.stackBtn.disabled = !(sheetDone && hasSheets);
  dom.storeBtn.disabled = !(sheetDone && !hasSheets);
  dom.btnHint.textContent = !sheetDone
    ? 'POP ALL BUBBLES FIRST'
    : hasSheets
      ? 'READY FOR NEXT SHEET'
      : 'OUT OF SHEETS — RUN TO STORE';
}

function flashStat(el: HTMLElement): void {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), Config.animation.statFlashMs);
}

function spawnParticle(x: number, y: number): void {
  const p = document.createElement('div');
  p.className = 'pop-particle';
  const { text, offsetX, offsetY, lifetimeMs } = Config.bubbles.particle;
  p.textContent = text;
  p.style.left  = (x - offsetX) + 'px';
  p.style.top   = (y - offsetY) + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), lifetimeMs);
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
