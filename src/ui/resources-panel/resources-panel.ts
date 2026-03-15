import './resources-panel.css';
import { state } from '../../core/state';
import { on } from '../../core/events';
import { Config } from '../../core/config';
import { RESOURCES, ResourceId } from '../../core/resources';
import { updateColors } from '../../features/color/color';
import { syncTable } from '../../features/table/table';
import { syncActions } from '../actions/actions';
import { updateChairs } from '../../features/chairs/chairs';
import { formatBigInt } from '../../core/format';

export interface DomRefs {
  milBar: HTMLElement;
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
  milBar: getEl('milestoneBanner'),
};

export function init(): void {
  buildResourceRows();

  const titlebar  = getEl('resourcesTitlebar');
  const panelBody = getEl('panelBody');
  titlebar.addEventListener('click', () => panelBody.classList.toggle('collapsed'));


  on('bubble:popped', ({ x, y }) => {
    updateUI();  // show/update oxygen row before computing particle target rect
    spawnParticle(x, y);
    const oxygenEl = resourceEls['oxygen'];
    if (oxygenEl) flashStat(oxygenEl);
  });

  on('bubble:worker_popped', ({ x, y, chairPos }) => {
    spawnWorkerParticle(x, y, chairPos);
    updateUI();
  });

  on('sheet:complete',       () => updateUI());
  on('resources:produced',   () => updateUI());
  on('sheet:new',            () => updateUI());
}

// Forces a full UI sync from state — used after save restoration
export function syncUI(): void {
  syncTable();
  syncActions();
  updateChairs();
  updateUI();
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
    if (val > 0n) {
      row.style.display = '';
      el.textContent    = formatBigInt(val);
    } else {
      row.style.display = 'none';
    }
  }

  updateColors();
}


function flashStat(el: HTMLElement): void {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), Config.animation.statFlashMs);
}

// Animates a particle along a randomised arc toward (dx, dy) from its origin.
// The arc is created by deflecting the midpoint perpendicularly to the travel
// direction by a random amount — no extra libraries required.
function animateArc(
  el: HTMLElement,
  dx: number,
  dy: number,
  lifetimeMs: number,
  easing: string,
): void {
  const { arcRange } = Config.bubbles.particle;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector (rotate travel dir 90°)
  const perpX = -dy / length;
  const perpY =  dx / length;
  // Random signed deflection
  const deflect = (Math.random() - 0.5) * 2 * arcRange;
  const midX = dx * 0.45 + perpX * deflect;
  const midY = dy * 0.45 + perpY * deflect;

  el.animate(
    [
      { offset: 0,    transform: 'translate(0,0) scale(1)',                           opacity: 1 },
      { offset: 0.45, transform: `translate(${midX}px,${midY}px) scale(0.85)`,        opacity: 1 },
      { offset: 0.72, transform: `translate(${dx * 0.8}px,${dy * 0.8}px) scale(0.4)`, opacity: 1 },
      { offset: 1,    transform: `translate(${dx}px,${dy}px) scale(0.15)`,             opacity: 0 },
    ],
    { duration: lifetimeMs, easing, fill: 'forwards' },
  );
}

function spawnParticle(x: number, y: number): void {
  const p = document.createElement('div');
  p.className = 'pop-particle';
  const { text, offsetX, offsetY, lifetimeMs } = Config.bubbles.particle;
  p.textContent = text;
  p.style.left  = (x - offsetX) + 'px';
  p.style.top   = (y - offsetY) + 'px';
  document.body.appendChild(p);

  const oxygenEl = resourceEls['oxygen'];
  if (oxygenEl) {
    const cr = oxygenEl.getBoundingClientRect();
    const dx = (cr.left + cr.width  / 2) - (x - offsetX);
    const dy = (cr.top  + cr.height / 2) - (y - offsetY);
    animateArc(p, dx, dy, lifetimeMs, 'ease-in-out');
  }

  setTimeout(() => p.remove(), lifetimeMs);
}

function spawnWorkerParticle(x: number, y: number, chairPos: string): void {
  const p = document.createElement('div');
  p.className = 'pop-particle pop-particle--worker';
  const { text, offsetX, offsetY, lifetimeMs } = Config.bubbles.particle;
  p.textContent = text;
  p.style.left  = (x - offsetX) + 'px';
  p.style.top   = (y - offsetY) + 'px';
  document.body.appendChild(p);

  const chairEl = document.querySelector(`.chair--${chairPos}`);
  if (chairEl) {
    const cr = chairEl.getBoundingClientRect();
    const dx = (cr.left + cr.width  / 2) - (x - offsetX);
    const dy = (cr.top  + cr.height / 2) - (y - offsetY);
    animateArc(p, dx, dy, lifetimeMs, 'ease-in');
  }

  setTimeout(() => p.remove(), lifetimeMs);
}

