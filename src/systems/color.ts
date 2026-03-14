import { state } from '../state';

// Base grey values matching the CSS --cX palette entries used per element
const BASE_BANNER = 0x38; // --c3 = #383838 (56)
const BASE_PANEL  = 0x28; // --c2 = #282828 (40)
const BASE_SHEET  = 0x28; // --c2 = #282828 (40)

// Returns a 0–1 fraction for the given resource value
// Formula: min((log2(value) + 1) * 10, 100) / 100
function satFraction(value: number): number {
  if (value <= 0) return 0;
  return Math.min((Math.log2(value) + 1) * 10, 100) / 100;
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
  ROOT.style.setProperty('--banner-r', String(lerp(BASE_BANNER, 255, r)));
  ROOT.style.setProperty('--banner-g', String(lerp(BASE_BANNER,  85, g)));
  ROOT.style.setProperty('--banner-b', String(lerp(BASE_BANNER,  85, b)));

  // Stats panel → green tint (goxygen)
  ROOT.style.setProperty('--panel-r', String(lerp(BASE_PANEL,  85, r)));
  ROOT.style.setProperty('--panel-g', String(lerp(BASE_PANEL, 255, g)));
  ROOT.style.setProperty('--panel-b', String(lerp(BASE_PANEL,  85, b)));

  // Bubble sheet → blue tint (bloxygen)
  ROOT.style.setProperty('--sheet-r', String(lerp(BASE_SHEET,  85, r)));
  ROOT.style.setProperty('--sheet-g', String(lerp(BASE_SHEET,  85, g)));
  ROOT.style.setProperty('--sheet-b', String(lerp(BASE_SHEET, 255, b)));
}
