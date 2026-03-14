import { state, GRID } from './state';
import { on } from './events';
import { Config } from './config';
import { RESOURCES, ResourceId } from './resources';

export interface DomRefs {
  sheetsEl:    HTMLElement;
  sheetNumA:   HTMLElement;
  sheetNumB:   HTMLElement;
  bubbleCntEl: HTMLElement;
  progFill:    HTMLElement;
  progText:    HTMLElement;
  stackBtn:    HTMLButtonElement;
  btnHint:     HTMLElement;
  sheetDone:   HTMLElement;
  milBar:      HTMLElement;
}

// Populated during init() from the resource registry
const resourceEls: Partial<Record<ResourceId, HTMLElement>> = {};

function getEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

export const dom: DomRefs = {
  sheetsEl:    getEl('sheetsCount'),
  sheetNumA:   getEl('sheetNum'),
  sheetNumB:   getEl('sheetNumLabel'),
  bubbleCntEl: getEl('bubbleCount'),
  progFill:    getEl('progFill'),
  progText:    getEl('progText'),
  stackBtn:    getEl('stackBtn') as HTMLButtonElement,
  btnHint:     getEl('btnHint'),
  sheetDone:   getEl('sheetDone'),
  milBar:      getEl('milestoneBanner'),
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
    dom.stackBtn.disabled = false;
    dom.btnHint.textContent = 'READY FOR NEXT SHEET';
    flashStat(dom.sheetsEl);
    updateUI();
  });

  on('sheet:new', ({ sheetNum }) => {
    dom.sheetDone.classList.remove('show');
    dom.stackBtn.disabled = true;
    dom.btnHint.textContent = 'POP ALL BUBBLES FIRST';
    dom.sheetNumA.textContent = String(sheetNum);
    dom.sheetNumB.textContent = String(sheetNum);
    updateUI();
  });
}

// Forces a full UI sync from state — used after save restoration
export function syncUI(): void {
  updateUI();
  dom.sheetNumA.textContent = String(state.sheetNum);
  dom.sheetNumB.textContent = String(state.sheetNum);
  if (state.popped === GRID) {
    dom.sheetDone.classList.add('show');
    dom.stackBtn.disabled = false;
    dom.btnHint.textContent = 'READY FOR NEXT SHEET';
  }
}

// ── Internal ─────────────────────────────────────────────────────────────────

function buildResourceRows(): void {
  const container = getEl('resourceStats');
  for (const { id, label } of RESOURCES) {
    const row = document.createElement('div');
    row.className = 'stat-row';

    const lbl = document.createElement('div');
    lbl.className = 'stat-label';
    lbl.textContent = '> ' + label;

    const val = document.createElement('div');
    val.className = 'stat-value';
    val.textContent = '0';

    row.appendChild(lbl);
    row.appendChild(val);
    container.appendChild(row);

    const divider = document.createElement('div');
    divider.className = 'stat-divider';
    container.appendChild(divider);

    resourceEls[id] = val;
  }
}

function updateUI(): void {
  for (const { id } of RESOURCES) {
    const el = resourceEls[id];
    if (el) el.textContent = fmt(state.resources[id]);
  }
  dom.sheetsEl.textContent    = fmt(state.sheets);
  dom.bubbleCntEl.textContent = pad2(state.popped) + '/' + GRID;

  const pct = Math.round((state.popped / GRID) * 100);
  dom.progFill.style.width = pct + '%';
  dom.progText.textContent = pct + '%';
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
  p.style.left = (x - offsetX) + 'px';
  p.style.top  = (y - offsetY) + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), lifetimeMs);
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function pad2(n: number): string { return n < 10 ? '0' + n : String(n); }
