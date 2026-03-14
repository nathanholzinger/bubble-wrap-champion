# Bubble Wrap Champion — Claude Context

## Project
Vite + TypeScript incremental/idle game. Pop bubble wrap to collect Oxygen (O2), the primary resource.

## Architecture
- Feature-slice: each feature owns its `.ts` + `.css`
- `bigint` for all resource values
- Pub/sub event bus (`src/core/events.ts`)
- JSON save/load with bigint-as-string serialization (currently save version 6)
- Phaser 3 scaffolded for future minigames

## Docs
- **[docs/overview.md](docs/overview.md)** — full game vision across all phases
- **[docs/phase-1-current.md](docs/phase-1-current.md)** — current phase details and in-progress work

## Current Phase
**Phase 1 — Table Phase** (in progress). See `docs/phase-1-current.md`.
