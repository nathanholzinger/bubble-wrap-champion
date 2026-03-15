import { ResourceMap, makeResourceMap } from './resources';
import { Config } from './config';
import { UpgradeId } from './upgrades';
import { TradeId } from './trades';
import { devOverrides } from './devOverrides';

export interface BubbleCell {
  el: HTMLElement;
  popped: boolean;
}

export interface SheetInstance {
  cols: number;
  rows: number;
}

export interface GameState {
  resources:        ResourceMap;
  completedSheets:  number;
  sheets:           SheetInstance[];  // stack of sheets waiting to be played, front = next up
  maxStackSize:     number;           // how many sheets a restock gives
  purchases:        Partial<Record<UpgradeId, number>>;
  trades:           Partial<Record<TradeId,   number>>;
  grabUnlocked:     boolean;          // true after first sheet completed — grab allowed mid-sheet
  storeUnlocked:    boolean;          // true after first stack depleted — store always accessible
  currentSheetDims: SheetInstance;    // dims of the sheet currently being played
  gridTotal:        number;           // total bubbles on the current sheet (set by buildSheet)
  popped:           number;           // bubbles popped on current sheet
  bubbles:          BubbleCell[];
}

const startDims: SheetInstance = { cols: Config.sheet.cols, rows: Config.sheet.rows };

export const state: GameState = {
  resources:        makeResourceMap(),
  completedSheets:  0,
  sheets:           Array.from({ length: Config.stack.startingStackSize }, () => ({ ...startDims })),
  maxStackSize:     Config.stack.startingStackSize,
  purchases:        {},
  trades:           {},
  grabUnlocked:     false,
  storeUnlocked:    false,
  currentSheetDims: { ...startDims },
  gridTotal:        Config.sheet.cols * Config.sheet.rows,
  popped:           0,
  bubbles:          [],
};

// Table grid size — driven by table upgrade count, overridable from dev panel
export function tableGridSize(): number {
  if (devOverrides.tableSize !== null) return devOverrides.tableSize;
  return 4 + (state.purchases['tableUpgrade'] ?? 0);
}

// Default sheet dims for new sheets — currently matches table size
export function gridDims(): SheetInstance {
  const n = tableGridSize();
  return { cols: n, rows: n };
}

// Chair count — driven by purchases, overridable from dev panel
export function effectiveChairCount(): number {
  if (devOverrides.chairCount !== null) return devOverrides.chairCount;
  return state.purchases['chairUpgrade'] ?? 0;
}
