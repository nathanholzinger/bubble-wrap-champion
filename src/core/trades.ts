import { ResourceId } from './resources';

export type TradeId = 'buyWood';

export interface TradeDef {
  id:    TradeId;
  label: string;
  gives: { resource: ResourceId; amount: bigint };
  costs: { resource: ResourceId; amount: (n: number) => bigint }; // n = times traded so far
}

export const TRADES: Record<TradeId, TradeDef> = {
  buyWood: {
    id:    'buyWood',
    label: 'WOOD',
    gives: { resource: 'wood', amount: 1n },
    costs: {
      resource: 'oxygen',
      amount:   (n) => BigInt(Math.ceil(10 * Math.pow(2, n / 10))),
    },
  },
};
