import { state } from './state';
import { UPGRADES, UpgradeId } from './upgrades';
import { TRADES, TradeId } from './trades';

// ── Upgrade helpers ───────────────────────────────────────────────────────────

export function purchaseCount(id: UpgradeId): number {
  return state.purchases[id] ?? 0;
}

export function canAffordUpgrade(id: UpgradeId): boolean {
  const def = UPGRADES[id];
  const n   = purchaseCount(id);
  if (def.max !== undefined && n >= def.max) return false;
  if (def.unlocked && !def.unlocked()) return false;
  return state.resources[def.resource] >= def.cost(n);
}

export function buyUpgrade(id: UpgradeId): boolean {
  if (!canAffordUpgrade(id)) return false;
  const def = UPGRADES[id];
  const n   = purchaseCount(id);
  state.resources[def.resource] -= def.cost(n);
  state.purchases[id] = n + 1;
  return true;
}

// ── Trade helpers ─────────────────────────────────────────────────────────────

export function tradeCount(id: TradeId): number {
  return state.trades[id] ?? 0;
}

export function canAffordTrade(id: TradeId): boolean {
  const def = TRADES[id];
  const n   = tradeCount(id);
  return state.resources[def.costs.resource] >= def.costs.amount(n);
}

export function executeTrade(id: TradeId): boolean {
  if (!canAffordTrade(id)) return false;
  const def = TRADES[id];
  const n   = tradeCount(id);
  state.resources[def.costs.resource] -= def.costs.amount(n);
  state.resources[def.gives.resource] += def.gives.amount;
  state.trades[id] = n + 1;
  return true;
}
