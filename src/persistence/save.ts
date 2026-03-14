import { state, SheetInstance } from '../core/state';
import { on } from '../core/events';
import { Config } from '../core/config';
import { ResourceId, ResourceMap } from '../core/resources';
import { UpgradeId } from '../core/upgrades';
import { TradeId } from '../core/trades';

const { key: SAVE_KEY, version: SAVE_VERSION } = Config.save;

// Bigints aren't JSON-serializable, so resources are stored as decimal strings.
type SerializedResources = Record<ResourceId, string>;

export interface SaveData {
  version:          number;
  resources:        SerializedResources;
  sheets:           number;                            // completedSheets
  sheetsInStack:    SheetInstance[];                   // waiting sheet instances
  currentSheetDims: SheetInstance;                     // dims of the active sheet
  maxStackSize:     number;
  purchases:        Partial<Record<UpgradeId, number>>;
  trades:           Partial<Record<TradeId,   number>>;
  grabUnlocked:     boolean;
  storeUnlocked:    boolean;
  poppedBubbles:    boolean[];
}

function serializeResources(map: ResourceMap): SerializedResources {
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k, (v as bigint).toString()])
  ) as SerializedResources;
}

function deserializeResources(raw: SerializedResources): ResourceMap {
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, BigInt(v)])
  ) as ResourceMap;
}

export function save(): void {
  const data: SaveData = {
    version:          SAVE_VERSION,
    resources:        serializeResources(state.resources),
    sheets:           state.completedSheets,
    sheetsInStack:    state.sheets,
    currentSheetDims: state.currentSheetDims,
    maxStackSize:     state.maxStackSize,
    purchases:        state.purchases,
    trades:           state.trades,
    grabUnlocked:     state.grabUnlocked,
    storeUnlocked:    state.storeUnlocked,
    poppedBubbles:    state.bubbles.map(b => b.popped),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export interface LoadedData {
  resources:        ResourceMap;
  sheets:           number;
  sheetsInStack:    SheetInstance[];
  currentSheetDims: SheetInstance;
  maxStackSize:     number;
  purchases:        Partial<Record<UpgradeId, number>>;
  trades:           Partial<Record<TradeId,   number>>;
  grabUnlocked:     boolean;
  storeUnlocked:    boolean;
  poppedBubbles:    boolean[];
}

export function load(): LoadedData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== SAVE_VERSION) return null;
    return {
      resources:        deserializeResources(data.resources),
      sheets:           data.sheets,
      sheetsInStack:    data.sheetsInStack,
      currentSheetDims: data.currentSheetDims,
      maxStackSize:     data.maxStackSize,
      purchases:        data.purchases    ?? {},
      trades:           data.trades       ?? {},
      grabUnlocked:     data.grabUnlocked  ?? false,
      storeUnlocked:    data.storeUnlocked ?? false,
      poppedBubbles:    data.poppedBubbles,
    };
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
