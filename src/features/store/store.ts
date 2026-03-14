import './store.css';
import { STORE_ITEMS, StoreItem } from './items';
import { UPGRADES, UpgradeId } from '../../core/upgrades';
import { TRADES, TradeId } from '../../core/trades';
import { ACTIONS, ActionId } from '../../core/actions';
import { buyUpgrade, canAffordUpgrade, executeTrade, canAffordTrade, purchaseCount, tradeCount } from '../../core/economy';
import { formatBigInt } from '../../core/format';
import { syncUI } from '../../ui/stats-panel/stats';
import { save } from '../../persistence/save';
import { state } from '../../core/state';

let overlay: HTMLElement | null = null;

// Per-item DOM refs for refresh
interface ItemRefs { costEl: HTMLElement; btn: HTMLButtonElement; }
const itemRefs = new Map<string, ItemRefs>();

// ── Build ─────────────────────────────────────────────────────────────────────

function build(): void {
  overlay = document.createElement('div');
  overlay.className = 'store-overlay hidden';

  const win = document.createElement('div');
  win.className = 'store-window raised';
  win.innerHTML = `
    <div class="win-titlebar">
      <span class="win-title">STORE.EXE</span>
      <div class="win-btns"><div class="win-btn" id="storeCloseBtn"></div></div>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'store-body';

  STORE_ITEMS.forEach((item, idx) => {
    if (idx > 0) {
      const hr = document.createElement('hr');
      hr.className = 'store-divider';
      body.appendChild(hr);
    }
    body.appendChild(buildItem(item));
  });

  win.appendChild(body);
  overlay.appendChild(win);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('#storeCloseBtn')!.addEventListener('click', close);
}

function buildItem(item: StoreItem): HTMLElement {
  const def = item.type === 'upgrade' ? UPGRADES[item.id as UpgradeId]
            : item.type === 'trade'   ? TRADES[item.id as TradeId]
            :                           ACTIONS[item.id as ActionId];

  const el = document.createElement('div');
  el.className = 'store-item';

  const header = document.createElement('div');
  header.className = 'store-item-header';
  header.textContent = `> ${def.label}`;

  const row = document.createElement('div');
  row.className = 'store-item-row';

  const costEl = document.createElement('span');
  costEl.className = 'store-item-cost';

  const btn = document.createElement('button');
  btn.className = 'stack-btn';

  if (item.type === 'action') {
    btn.textContent = '[ PICK UP ]';
    btn.addEventListener('click', () => {
      item.execute();
      syncUI();
      refresh();
      save();
    });
  } else if (item.type === 'trade') {
    btn.textContent = '[ BUY ]';
    btn.addEventListener('click', () => {
      if (executeTrade(item.id)) { syncUI(); refresh(); save(); }
    });
  } else {
    btn.textContent = '[ BUY ]';
    btn.addEventListener('click', () => {
      if (buyUpgrade(item.id)) { syncUI(); refresh(); save(); }
    });
  }

  row.appendChild(costEl);
  row.appendChild(btn);
  el.appendChild(header);
  el.appendChild(row);

  itemRefs.set(item.id, { costEl, btn });
  return el;
}

// ── Refresh ───────────────────────────────────────────────────────────────────

function refresh(): void {
  for (const item of STORE_ITEMS) {
    const refs = itemRefs.get(item.id);
    if (!refs) continue;

    if (item.type === 'action') {
      const available = ACTIONS[item.id].available();
      refs.costEl.textContent = available
        ? `${state.sheets.length} / ${state.maxStackSize}`
        : 'FULL';
      refs.btn.disabled = !available;

    } else if (item.type === 'trade') {
      const def  = TRADES[item.id];
      const n    = tradeCount(item.id);
      const cost = def.costs.amount(n);
      refs.costEl.textContent = `${formatBigInt(cost)} ${def.costs.resource.toUpperCase()}`;
      refs.btn.disabled       = !canAffordTrade(item.id);

    } else {
      const def    = UPGRADES[item.id];
      const n      = purchaseCount(item.id);
      const maxed  = def.max !== undefined && n >= def.max;
      const locked = def.unlocked && !def.unlocked();
      if (maxed) {
        refs.costEl.textContent = 'MAXED';
        refs.btn.disabled       = true;
      } else if (locked) {
        refs.costEl.textContent = 'LOCKED';
        refs.btn.disabled       = true;
      } else {
        const cost = def.cost(n);
        refs.costEl.textContent = `${formatBigInt(cost)} ${def.resource.toUpperCase()}`;
        refs.btn.disabled       = !canAffordUpgrade(item.id);
      }
    }
  }
}

// ── Public ────────────────────────────────────────────────────────────────────

export function openStore(): void {
  if (!overlay) build();
  refresh();
  overlay!.classList.remove('hidden');
}

function close(): void {
  overlay?.classList.add('hidden');
}
