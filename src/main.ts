import './style/base.css';
import './style/layout.css';

import './ui/dev-panel/dev';
import { init as initUI, syncUI } from './ui/stats-panel/stats';
import { init as initMilestones } from './features/milestones/milestones';
import { init as initSave, load } from './persistence/save';
import { buildSheet, grabNewSheet, restockSheets, restoreBubbles } from './features/bubble-sheet/sheet';
import { getCircleClipPath } from './features/bubble-sheet/circleClip';
import { startLoop } from './core/loop';
import { state } from './core/state';
import { Config } from './core/config';
import { showIntro } from './ui/intro/intro';
import { showSplash } from './ui/splash/splash';

async function main(): Promise<void> {
  const savedData = load();

  await showSplash(savedData !== null);
  if (!savedData) await showIntro();

  // Apply initial bubble clip-path from the CSS variable
  const initialFidelity = Config.bubbles.startFidelity;
  document.documentElement.style.setProperty('--bubble-clip', getCircleClipPath(initialFidelity));

  // Register all event listeners before any events can fire
  initUI();
  initMilestones();
  initSave();

  // Rehydrate persistent state before buildSheet resets it
  if (savedData) {
    Object.assign(state.resources, savedData.resources);
    state.completedSheets = savedData.sheets;
    state.sheets          = savedData.sheetsInStack;
  }

  // Wire up sheet buttons
  document.getElementById('stackBtn')!.addEventListener('click', grabNewSheet);
  document.getElementById('storeBtn')!.addEventListener('click', restockSheets);

  // Start the game loop
  startLoop();

  // Build the sheet DOM, then restore mid-sheet bubble state if a save exists
  buildSheet();
  if (savedData) {
    restoreBubbles(savedData.poppedBubbles);
    syncUI();
  }
}

main();
