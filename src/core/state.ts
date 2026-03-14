import { ResourceMap, makeResourceMap } from './resources';
import { Config } from './config';

export interface BubbleCell {
  el: HTMLElement;
  popped: boolean;
}

export interface GameState {
  resources:     ResourceMap;
  completedSheets: number;   // completed sheets
  sheets:        number;   // sheets remaining before needing a restock
  maxStackSize:  number;   // how many sheets a restock gives
  woodBought:    number;   // total wood purchases (drives pricing curve)
  tableUpgrades: number;   // table upgrades purchased
  gridTotal:     number;   // total bubbles on the current sheet (set by buildSheet)
  popped:        number;   // bubbles popped on current sheet
  bubbles:       BubbleCell[];
}

export const state: GameState = {
  resources:     makeResourceMap(),
  completedSheets: 0,
  sheets:        Config.stack.startingStackSize,
  maxStackSize:  Config.stack.startingStackSize,
  woodBought:    0,
  tableUpgrades: 0,
  gridTotal:     Config.sheet.cols * Config.sheet.rows,
  popped:        0,
  bubbles:       [],
};

// Grid dimensions driven by table upgrades
export function gridDims(): { cols: number; rows: number } {
  if (state.tableUpgrades >= 1) return { cols: 5, rows: 5 };
  return { cols: Config.sheet.cols, rows: Config.sheet.rows };
}
