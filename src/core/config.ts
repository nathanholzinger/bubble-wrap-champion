export const Config = {

  sheet: {
    cols: 4,
    rows: 4,
    // NOTE: if cols/rows change, also update .bubble-grid in bubble-sheet/sheet.css
    // (grid-template-columns: repeat(4, 1fr))
  },

  bubbles: {
    startFidelity: 3,
    particle: {
      text:       '+O2',
      offsetX:    12,  // px left of bubble center
      offsetY:    4,   // px above bubble top
      lifetimeMs: 550,
    },
  },

  milestones: {
    bannerDurationMs: 3200,
  },

  animation: {
    popFlashMs:  200,  // how long the just-popped class stays on a bubble
    statFlashMs: 160,  // how long a stat value glows after changing
  },

  loop: {
    maxDeltaSec: 0.1,  // dt is capped to prevent jumps after tab blur/focus
  },

  stack: {
    startingStackSize: 4,
  },

  save: {
    key:     'bwc_save',
    version: 9,
    // Bump version whenever SaveData's shape changes — old saves will be discarded
  },

};

// Derived — used throughout the codebase as the total bubble count per sheet
export const GRID = Config.sheet.cols * Config.sheet.rows;
