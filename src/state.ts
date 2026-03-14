import { ResourceMap, makeResourceMap } from './resources';
import { Config } from './config';

export interface BubbleCell {
  el: HTMLElement;
  popped: boolean;
}

export interface GameState {
  resources:     ResourceMap;
  sheets:        number;   // completed sheets
  sheetNum:      number;   // current sheet number (display)
  sheetsInStack: number;   // sheets remaining to grab before needing a restock
  popped:        number;   // bubbles popped on current sheet
  bubbles:       BubbleCell[];
}

export { GRID } from './config';

export const state: GameState = {
  resources:     makeResourceMap(),
  sheets:        0,
  sheetNum:      1,
  sheetsInStack: Config.stack.size,
  popped:        0,
  bubbles:       [],
};
