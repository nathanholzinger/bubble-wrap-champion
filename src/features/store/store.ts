import './store.css';
import { state } from '../../core/state';
import { restockSheets } from '../bubble-sheet/sheet';
import { formatBigInt } from '../../core/format';
import { syncUI } from '../../ui/stats-panel/stats';
import { save } from '../../persistence/save';

// ── Pricing ──────────────────────────────────────────────────────────────────

function woodCost(): bigint {
  return BigInt(Math.ceil(10 * Math.pow(2, state.woodBought / 10)));
}

// ── DOM ──────────────────────────────────────────────────────────────────────

let overlay:         HTMLElement     | null = null;
let sheetsValueEl:   HTMLElement;
let sheetPickupBtn:  HTMLButtonElement;
let woodCostEl:      HTMLElement;
let woodBuyBtn:      HTMLButtonElement;
let tableUpgradeBtn: HTMLButtonElement;

function build(): void {
  overlay = document.createElement('div');
  overlay.className = 'store-overlay hidden';
  overlay.innerHTML = `
    <div class="store-window raised">
      <div class="win-titlebar" id="storeTitlebar">
        <span class="win-title">STORE.EXE</span>
        <div class="win-btns"><div class="win-btn" id="storeCloseBtn"></div></div>
      </div>
      <div class="store-body">

        <div class="store-item">
          <div class="store-item-header">&gt; BUBBLE WRAP SHEETS</div>
          <div class="store-item-row">
            <span class="store-item-cost" id="storeSheetsValue"></span>
            <button class="stack-btn" id="sheetPickupBtn">[ PICK UP ]</button>
          </div>
        </div>

        <hr class="store-divider">

        <div class="store-item">
          <div class="store-item-header">&gt; WOOD</div>
          <div class="store-item-row">
            <span class="store-item-cost" id="storeWoodCost"></span>
            <button class="stack-btn" id="woodBuyBtn">[ BUY ]</button>
          </div>
        </div>

        <hr class="store-divider">

        <div class="store-item">
          <div class="store-item-header">&gt; TABLE UPGRADE</div>
          <div class="store-item-row">
            <span class="store-item-cost">25 WOOD</span>
            <button class="stack-btn" id="tableUpgradeBtn">[ BUY ]</button>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  sheetsValueEl   = overlay.querySelector('#storeSheetsValue')! as HTMLElement;
  sheetPickupBtn  = overlay.querySelector('#sheetPickupBtn')!   as HTMLButtonElement;
  woodCostEl      = overlay.querySelector('#storeWoodCost')!    as HTMLElement;
  woodBuyBtn      = overlay.querySelector('#woodBuyBtn')!       as HTMLButtonElement;
  tableUpgradeBtn = overlay.querySelector('#tableUpgradeBtn')!  as HTMLButtonElement;

  // Close on backdrop click or X button
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('#storeCloseBtn')!.addEventListener('click', close);

  sheetPickupBtn.addEventListener('click', () => {
    restockSheets();
    refresh();
    save();
  });

  woodBuyBtn.addEventListener('click', () => {
    const cost = woodCost();
    if (state.resources.oxygen < cost) return;
    state.resources.oxygen -= cost;
    state.resources.wood   += 1n;
    state.woodBought++;
    syncUI();
    refresh();
    save();
  });

  tableUpgradeBtn.addEventListener('click', () => {
    if (state.resources.wood < 9n) return;
    state.resources.wood -= 9n;
    state.tableUpgrades++;
    syncUI();
    refresh();
    save();
  });
}

// ── Public ───────────────────────────────────────────────────────────────────

export function openStore(): void {
  if (!overlay) build();
  refresh();
  overlay!.classList.remove('hidden');
}

// ── Internal ─────────────────────────────────────────────────────────────────

function close(): void {
  overlay?.classList.add('hidden');
}

function refresh(): void {
  const full = state.sheets >= state.maxStackSize;
  sheetsValueEl.textContent  = full ? 'FULL' : `${state.sheets} / ${state.maxStackSize}`;
  sheetPickupBtn.disabled    = full;

  const cost = woodCost();
  woodCostEl.textContent  = `${formatBigInt(cost)} Ox`;
  woodBuyBtn.disabled     = state.resources.oxygen < cost;

  tableUpgradeBtn.disabled = state.resources.wood < 9n;
}
