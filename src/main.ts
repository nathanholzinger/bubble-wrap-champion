import './style/base.css';
import './style/layout.css';

import './ui/dev-panel/dev';
import { init as initUI, syncUI } from './ui/stats-panel/stats';
import { initAutoPoppers } from './features/chairs/autoPopper';
import { init as initMilestones } from './features/milestones/milestones';
import { init as initSave, load } from './persistence/save';
import { buildSheet, grabNewSheet, restoreBubbles } from './features/bubble-sheet/sheet';
import { openStore } from './features/store/store';
import { getCircleClipPath } from './features/bubble-sheet/circleClip';
import { startLoop, onUpdate } from './core/loop';
import { tick as producerTick } from './core/producers';
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
  initAutoPoppers();

  // Rehydrate persistent state before buildSheet resets it
  if (savedData) {
    Object.assign(state.resources, savedData.resources);
    state.completedSheets  = savedData.sheets;
    state.sheets           = savedData.sheetsInStack;
    state.currentSheetDims = savedData.currentSheetDims;
    state.maxStackSize     = savedData.maxStackSize;
    Object.assign(state.purchases, savedData.purchases);
    Object.assign(state.trades,    savedData.trades);
    state.grabUnlocked  = savedData.grabUnlocked;
    state.storeUnlocked = savedData.storeUnlocked;
  }

  // Wire up sheet buttons
  document.getElementById('stackBtn')!.addEventListener('click', grabNewSheet);
  document.getElementById('storeBtn')!.addEventListener('click', openStore);

  // Register tick systems then start the loop
  onUpdate(producerTick);
  startLoop();

  // Build the sheet DOM using saved dims (or current table size for a new game),
  // then restore mid-sheet bubble state if a save exists
  buildSheet(savedData?.currentSheetDims);
  if (savedData) {
    restoreBubbles(savedData.poppedBubbles);
    syncUI();
  }
}

main();
