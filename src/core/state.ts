import { ResourceMap, makeResourceMap } from './resources';
import { Config } from './config';
import { UpgradeId } from './upgrades';
import { TradeId } from './trades';

export interface BubbleCell {
  el: HTMLElement;
  popped: boolean;
}

export interface GameState {
  resources:       ResourceMap;
  completedSheets: number;
  sheets:          number;   // sheets remaining in stack
  maxStackSize:    number;   // how many sheets a restock gives
  purchases:       Partial<Record<UpgradeId, number>>;  // upgrade purchase counts
  trades:          Partial<Record<TradeId,   number>>;  // trade execution counts
  gridTotal:       number;   // total bubbles on the current sheet (set by buildSheet)
  popped:          number;   // bubbles popped on current sheet
  bubbles:         BubbleCell[];
}

export const state: GameState = {
  resources:       makeResourceMap(),
  completedSheets: 0,
  sheets:          Config.stack.startingStackSize,
  maxStackSize:    Config.stack.startingStackSize,
  purchases:       {},
  trades:          {},
  gridTotal:       Config.sheet.cols * Config.sheet.rows,
  popped:          0,
  bubbles:         [],
};

// Grid dimensions driven by table upgrade count
export function gridDims(): { cols: number; rows: number } {
  const n = state.purchases['tableUpgrade'] ?? 0;
  return { cols: 4 + n, rows: 4 + n };
}
