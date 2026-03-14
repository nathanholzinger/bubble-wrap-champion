// ── Resource Registry ────────────────────────────────────────────────────────

export type ResourceId = 'oxygen' | 'roxygen' | 'goxygen' | 'bloxygen' | 'wood';

export interface ResourceDef {
  id:    ResourceId;
  label: string;
}

export const RESOURCES: ResourceDef[] = [
  { id: 'oxygen',   label: 'OXYGEN'   },
  { id: 'roxygen',  label: 'ROXYGEN'  },
  { id: 'goxygen',  label: 'GOXYGEN'  },
  { id: 'bloxygen', label: 'BLOXYGEN' },
  { id: 'wood',     label: 'WOOD'     },
];

export type ResourceMap = Record<ResourceId, bigint>;

export function makeResourceMap(): ResourceMap {
  return Object.fromEntries(RESOURCES.map(r => [r.id, 0n])) as ResourceMap;
}
