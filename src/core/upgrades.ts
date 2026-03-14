import { ResourceId } from './resources';
import { state } from './state';

export type UpgradeId = 'tableUpgrade' | 'chairUpgrade';

export interface UpgradeDef {
  id:        UpgradeId;
  label:     string;
  resource:  ResourceId;
  cost:      (n: number) => bigint;  // n = times purchased so far
  max?:      number;
  unlocked?: () => boolean;          // false = show LOCKED in store
}

// Table size at upgrade level n: 4+n cols/rows
// chairUpgrade 0→1 needs 5×5 (tableUpgrade ≥ 1)
// chairUpgrade 1→2 needs 7×7 (tableUpgrade ≥ 3)
// chairUpgrade 2→3 needs 9×9 (tableUpgrade ≥ 5)
// chairUpgrade 3→4 needs 11×11 (tableUpgrade ≥ 7)
const CHAIR_TABLE_REQS = [1, 3, 5, 7];

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  tableUpgrade: {
    id:       'tableUpgrade',
    label:    'TABLE UPGRADE',
    resource: 'wood',
    cost:     (n) => BigInt((n + 3) * 2 + 1),
    max:      8,
  },

  chairUpgrade: {
    id:       'chairUpgrade',
    label:    'BUY CHAIR',
    resource: 'wood',
    cost:     () => 5n,
    max:      4,
    unlocked: () => {
      const chairs = state.purchases['chairUpgrade'] ?? 0;
      const table  = state.purchases['tableUpgrade'] ?? 0;
      const req    = CHAIR_TABLE_REQS[chairs];
      return req !== undefined && table >= req;
    },
  },
};
