import { ResourceMap, makeResourceMap } from './resources';

export interface BubbleCell {
  el: HTMLElement;
  popped: boolean;
}

export interface GameState {
  resources: ResourceMap;
  sheets:    number;   // completed sheets
  sheetNum:  number;   // current sheet number (display)
  popped:    number;   // bubbles popped on current sheet
  bubbles:   BubbleCell[];
}

export { GRID } from './config';

export const state: GameState = {
  resources: makeResourceMap(),
  sheets:    0,
  sheetNum:  1,
  popped:    0,
  bubbles:   [],
};
