import { state } from '../../core/state';

// Base grey values matching the CSS --cX palette entries used per element
const BASE_BANNER = 0x38; // --c3 = #383838 (56)
const BASE_PANEL  = 0x28; // --c2 = #282828 (40)
const BASE_SHEET  = 0x28; // --c2 = #282828 (40)
const BASE_TABLE     = 0x38; // --c3 = #383838 (56)
const BASE_BUBBLE    = 0xAA; //        #AAAAAA (170)
const BASE_GAME_AREA = 0xAA; // --c1 = #181818 (24)

// Returns a 0–1 fraction for the given resource value
// Formula: min((log2(value) + 1) * 10, 100) / 100
// Saturation reaches 100% at value >= 512 (log2(512)+1)*10 = 100).
// Only call Number() when value is in [1, 511] — always safe.
function satFraction(value: bigint): number {
  if (value <= 0n)   return 0;
  if (value >= 512n) return 1;
  return ((Math.log2(Number(value)) + 1) * 10) / 100;
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

const ROOT = document.documentElement;

export function updateColors(): void {
  const r = satFraction(state.resources.roxygen);
  const g = satFraction(state.resources.goxygen);
  const b = satFraction(state.resources.bloxygen);

  // Banner → red tint (roxygen)
  ROOT.style.setProperty('--banner-r', String(lerp(BASE_BANNER, 240, r)));
  ROOT.style.setProperty('--banner-g', String(lerp(BASE_BANNER,  80, g)));
  ROOT.style.setProperty('--banner-b', String(lerp(BASE_BANNER,  80, b)));

  // Stats panel → green tint (goxygen)
  ROOT.style.setProperty('--panel-r', String(lerp(BASE_PANEL,  80, r)));
  ROOT.style.setProperty('--panel-g', String(lerp(BASE_PANEL, 240, g)));
  ROOT.style.setProperty('--panel-b', String(lerp(BASE_PANEL,  80, b)));

  // Bubble sheet → blue tint (bloxygen)
  ROOT.style.setProperty('--sheet-r', String(lerp(BASE_SHEET,  80, r)));
  ROOT.style.setProperty('--sheet-g', String(lerp(BASE_SHEET,  80, g)));
  ROOT.style.setProperty('--sheet-b', String(lerp(BASE_SHEET, 240, b)));

  // Table + chairs → warm brown (all three resources combined)
  ROOT.style.setProperty('--table-r', String(lerp(BASE_TABLE, 200, r)));
  ROOT.style.setProperty('--table-g', String(lerp(BASE_TABLE,  95, g)));
  ROOT.style.setProperty('--table-b', String(lerp(BASE_TABLE,  25, b)));

  // Bubbles → blue tint (grey-170 → R170 G170 B255, all three combined)
  ROOT.style.setProperty('--bubble-r', String(lerp(BASE_BUBBLE, 160, r)));
  ROOT.style.setProperty('--bubble-g', String(lerp(BASE_BUBBLE, 160, g)));
  ROOT.style.setProperty('--bubble-b', String(lerp(BASE_BUBBLE, 240, b)));

  // Game area → soft yellow light
  ROOT.style.setProperty('--game-area-r', String(lerp(BASE_GAME_AREA, 240, r)));
  ROOT.style.setProperty('--game-area-g', String(lerp(BASE_GAME_AREA, 220, g)));
  ROOT.style.setProperty('--game-area-b', String(lerp(BASE_GAME_AREA, 180, b)));
}
