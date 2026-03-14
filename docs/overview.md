# Bubble Wrap Champion — Game Overview

## Core Premise
An incremental/idle game. Pop bubble wrap to release Oxygen (O2), your primary resource. The game starts simple and expands into empire-building, prestige systems, and eventually universe exploration.

---

## Phases

### Phase 1 — Table Phase (current)
- Pop bubble wrap sheets to collect O2
- Upgrade your table to fit larger sheets
- Upgrade cursor to pop more bubbles at once
- Buy chairs when table is large enough; hire temp workers to auto-pop
- Minigame: endless runner to reach further stores that sell better bubble wrap (Phaser 3, not yet implemented — scaffold exists)

### Phase 2 — Office
- Expand into an office
- Research station unlocks upgrades and speeds things up

### Phase 3 — Office Floor
- Larger office floor
- Buy more tables, hire more workers

### Phase 4 — Tower
- Build a tower
- A golden light at the top enables **first prestige**: restart from the beginning with bonuses that accelerate progression

### Phase 5 — Empire
- Build an empire
- Other empires may oppose you — wrong decisions can cause you to **lose**
- The prestige system exists partly to let players restart and quickly return to this phase

### Phase 6 — World Domination
- More failure scenarios
- After completing this, the "real game" begins

---

## Post-World-Domination Paths
Players choose a path. Each path has its own bonus type; bonuses from different paths multiply together. Full completion of any path requires some bonuses from other paths, so players must cycle through multiple paths over multiple prestiges.

- **Persistence Path** — buffs the prestige system itself; makes future resets more powerful
- **Science Path** — unlocks phases *beneath* Phase 1; explores the "principles of oxygen" (game rules, not real chemistry)
- **Beyond Path** — explore and conquer the universe

---

## Prestige System
- First prestige triggered at Phase 4 (golden light atop the tower)
- Resets progress but grants bonuses
- Players will cycle through phases multiple times, using different paths to stack multiplicative bonuses
- Designed so no single path is self-sufficient

---

## Notes
- Each phase may have a small minigame
- Phase 1 endless runner (Phaser 3) is planned but not confirmed for implementation
- "Oxygen" is a game resource, not real-world chemistry
