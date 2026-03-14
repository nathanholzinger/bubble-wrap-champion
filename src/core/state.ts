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
  popped:        number;   // bubbles popped on current sheet
  bubbles:       BubbleCell[];
}

export { GRID } from './config';

export const state: GameState = {
  resources:     makeResourceMap(),
  completedSheets: 0,
  sheets:       Config.stack.startingStackSize,
  maxStackSize: Config.stack.startingStackSize,
  popped:        0,
  bubbles:       [],
};
