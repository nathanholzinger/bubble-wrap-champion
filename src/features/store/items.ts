import { UpgradeId } from '../../core/upgrades';
import { TradeId } from '../../core/trades';
import { ActionId } from '../../core/actions';
import { restockSheets } from '../bubble-sheet/sheet';

export type StoreItem =
  | { type: 'action';  id: ActionId;  execute: () => void }
  | { type: 'trade';   id: TradeId }
  | { type: 'upgrade'; id: UpgradeId };

export const STORE_ITEMS: StoreItem[] = [
  { type: 'action',  id: 'collectSheets', execute: restockSheets },
  { type: 'trade',   id: 'buyWood' },
  { type: 'upgrade', id: 'tableUpgrade' },
];
