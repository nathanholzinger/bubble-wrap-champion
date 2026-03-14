import './style/base.css';
import './style/components.css';
import './style/game.css';

import './dev';
import { init as initUI, syncUI } from './ui';
import { init as initMilestones } from './systems/milestones';
import { init as initSave, load } from './save';
import { buildSheet, grabNewSheet, restoreBubbles } from './systems/sheet';
import { getCircleClipPath } from './circleClip';
import { startLoop } from './loop';
import { state } from './state';
import { Config } from './config';

// Apply initial bubble clip-path from the CSS variable
const initialFidelity = Config.bubbles.startFidelity;
document.documentElement.style.setProperty('--bubble-clip', getCircleClipPath(initialFidelity));

// Register all event listeners before any events can fire
initUI();
initMilestones();
initSave();

// Rehydrate persistent state before buildSheet resets it
const savedData = load();
if (savedData) {
  Object.assign(state.resources, savedData.resources);
  state.sheets   = savedData.sheets;
  state.sheetNum = savedData.sheetNum;
}

// Wire up the grab-new-sheet button
document.getElementById('stackBtn')!.addEventListener('click', grabNewSheet);

// Start the game loop
startLoop();

// Build the sheet DOM, then restore mid-sheet bubble state if a save exists
buildSheet();
if (savedData) {
  restoreBubbles(savedData.poppedBubbles);
  syncUI();
}
