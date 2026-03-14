import { ResourceId } from './resources';

export type UpgradeId = 'tableUpgrade';

export interface UpgradeDef {
  id:        UpgradeId;
  label:     string;
  resource:  ResourceId;
  cost:      (n: number) => bigint;  // n = times purchased so far
  max?:      number;
  unlocked?: () => boolean;
}

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  tableUpgrade: {
    id:       'tableUpgrade',
    label:    'TABLE UPGRADE',
    resource: 'wood',
    cost:     (n) => BigInt((n + 3) * 2 + 1),
    max:      6,
  },
};
