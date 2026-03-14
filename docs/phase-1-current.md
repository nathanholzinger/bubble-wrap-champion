# Phase 1 — Table Phase

## Goal
Make your table larger so you can place larger bubble wrap sheets, increase cursor size to pop more bubbles at once, buy chairs, and hire temp workers.

## Implemented So Far
- Pop bubbles on a sheet → earn O2
- Sheet stack system: grab a new sheet from your stack when current is complete
- Store modal: free sheet restock, buy wood (O2 cost scales as `10 × 2^(n/10)`), table upgrade
- Table upgrade (costs 9 wood): upgrades the table visual and makes new sheets 5×5 (default is 4×4)
- Wood table visual behind the bubble sheet (auto-grows with sheet size)
- Save/load with version 6 (persists: O2, wood, sheets, maxStackSize, woodBought, tableUpgrades, completedSheets)
- Dev panel for testing resource/state overrides

## State (`src/core/state.ts`)
| Field | Purpose |
|---|---|
| `resources.oxygen` | bigint, O2 collected |
| `resources.wood` | bigint, wood collected |
| `sheets` | sheets remaining in current stack |
| `maxStackSize` | how many sheets a restock gives |
| `woodBought` | total wood purchases (drives pricing curve) |
| `tableUpgrades` | table upgrade count (drives grid size) |
| `completedSheets` | total sheets fully popped |
| `gridTotal` | bubble count on current sheet (frozen at build time) |

## Grid Size
Driven by `gridDims()` in `state.ts`:
- 0 upgrades → 4×4 (16 bubbles)
- 1+ upgrades → 5×5 (25 bubbles)

## Planned for Phase 1
- Cursor upgrade (pop multiple bubbles at once)
- Chairs (unlocked when table is large enough)
- Temp workers (sit in chairs, auto-pop)
- Endless runner minigame (Phaser 3) to reach further stores with better bubble wrap
- Additional table size tiers beyond the first upgrade

## Key Files
- `src/features/bubble-sheet/sheet.ts` — sheet building, popping, restocking
- `src/features/store/store.ts` — store modal
- `src/core/state.ts` — all game state
- `src/core/config.ts` — tunable constants
- `src/ui/stats-panel/stats.ts` — DOM refs, event handlers, UI updates
- `src/persistence/save.ts` — save/load logic
