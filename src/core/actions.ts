import { state } from './state';

export type ActionId = 'collectSheets';

export interface ActionDef {
  id:        ActionId;
  label:     string;
  available: () => boolean;
}

export const ACTIONS: Record<ActionId, ActionDef> = {
  collectSheets: {
    id:        'collectSheets',
    label:     'BUBBLE WRAP SHEETS',
    available: () => state.sheets.length < state.maxStackSize,
  },
};
