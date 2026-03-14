// Dev-only override values. null = use normal game logic.
// These are never saved and reset on page load.
export const devOverrides = {
  tableSize:  null as number | null,  // overrides gridDims() when set (4-12)
  sheetSize:  null as number | null,  // sheet rebuilt immediately to this size when set
  chairCount: null as number | null,  // overrides effectiveChairCount() when set (0-4)
};
