import { state } from './state';
import { on } from './events';
import { Config } from './config';
import { ResourceMap } from './resources';

const { key: SAVE_KEY, version: SAVE_VERSION } = Config.save;

export interface SaveData {
  version:       number;
  resources:     ResourceMap;
  sheets:        number;
  sheetNum:      number;
  sheetsInStack: number;
  poppedBubbles: boolean[]; // per-bubble popped state for the current sheet
}

export function save(): void {
  const data: SaveData = {
    version:       SAVE_VERSION,
    resources:     { ...state.resources },
    sheets:        state.sheets,
    sheetNum:      state.sheetNum,
    sheetsInStack: state.sheetsInStack,
    poppedBubbles: state.bubbles.map(b => b.popped),
  };
  localStorage.setItem(SAVE_KEY, stringifyWithBigInt(data));
}

function stringifyWithBigInt(data: SaveData): string {
  return JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  );
}

export function load(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    // Reject saves from incompatible versions rather than crash on bad shape
    if (data.version !== SAVE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

// Subscribe to events so saves happen automatically
export function init(): void {
  on('bubble:popped',   save);
  on('sheet:complete',  save);
  on('sheet:new',       save);
  on('stack:restocked', save);
}
