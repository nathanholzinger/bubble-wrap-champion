import './dev.css';
import { getCircleClipPath, GRID_SIZES } from '../../features/bubble-sheet/circleClip';
import { clearSave } from '../../persistence/save';
import { state } from '../../core/state';
import { syncUI, dom } from '../stats-panel/stats';
import type { ResourceId } from '../../core/resources';
import { onUpdate } from '../../core/loop';
import { totalRate, registerProducer } from '../../core/producers';

let devProducerRate = 0;
registerProducer({ id: 'dev', resource: 'oxygen', rate: () => devProducerRate });

const DEV_RESOURCES: ResourceId[] = ['oxygen', 'roxygen', 'bloxygen', 'goxygen'];

const root = document.documentElement;

const initialFidelity = parseInt(
  getComputedStyle(root).getPropertyValue('--circle-fidelity').trim()
) || 3;

function buildDevPanel(): void {
  const panel = document.createElement('div');
  panel.className = 'dev-panel raised';
  panel.innerHTML = `
    <div class="win-titlebar" id="devTitlebar">
      <span class="win-title">DEV.EXE</span>
      <div class="win-btns"><div class="win-btn"></div></div>
    </div>
    <div class="dev-panel-body" id="devPanelBody">

      <div class="dev-row">
        <div class="dev-label">
          <span>&gt; CIRCLE FIDELITY</span>
          <span class="dev-label-value" id="devFidelityVal">${initialFidelity}</span>
        </div>
        <input
          class="dev-range"
          id="devFidelitySlider"
          type="range"
          min="1" max="${GRID_SIZES.length}" step="1"
          value="${initialFidelity}"
        >
      </div>

      <div class="stat-divider"></div>

      <div id="devResources"></div>

      <div class="stat-divider"></div>

      <div class="dev-resource-row" id="devMaxStackRow"></div>

      <div class="stat-divider"></div>

      <div class="stat-divider"></div>

      <div class="dev-resource-row" id="devRateRow">
        <span class="dev-resource-label">&gt; O2/SEC</span>
        <input type="number" class="dev-number" id="devO2RateInput" min="0" value="0">
        <span class="dev-label-value" id="devO2Rate">0.00</span>
      </div>

      <div class="stat-divider"></div>

      <div class="dev-row">
        <button class="stack-btn" id="devClearSave">[ CLEAR SAVE ]</button>
      </div>

    </div>
  `;

  document.body.appendChild(panel);

  // Titlebar collapse toggle
  const titlebar = panel.querySelector('#devTitlebar') as HTMLElement;
  const body     = panel.querySelector('#devPanelBody') as HTMLElement;
  titlebar.addEventListener('click', () => body.classList.toggle('collapsed'));

  // Circle fidelity slider
  const slider   = panel.querySelector('#devFidelitySlider') as HTMLInputElement;
  const valLabel = panel.querySelector('#devFidelityVal') as HTMLElement;
  slider.addEventListener('input', () => {
    const v = slider.value;
    valLabel.textContent = v;
    root.style.setProperty('--circle-fidelity', v);
    root.style.setProperty('--bubble-clip', getCircleClipPath(Number(v)));
  });

  // Clear save button
  const clearBtn = panel.querySelector('#devClearSave') as HTMLButtonElement;
  clearBtn.addEventListener('click', () => {
    clearSave();
    location.reload();
  });

  // Max stack size control
  const maxStackRow = panel.querySelector('#devMaxStackRow') as HTMLElement;

  const maxStackLabel = document.createElement('span');
  maxStackLabel.className = 'dev-resource-label';
  maxStackLabel.textContent = '> STACK SIZE';

  const maxStackInput = document.createElement('input');
  maxStackInput.type      = 'number';
  maxStackInput.className = 'dev-number';
  maxStackInput.min       = '1';

  const maxStackBtn = document.createElement('button');
  maxStackBtn.className   = 'dev-add-btn';
  maxStackBtn.textContent = '[ SET ]';
  maxStackBtn.addEventListener('click', () => {
    const val = parseInt(maxStackInput.value);
    if (val > 0) {
      state.maxStackSize = val;
      dom.stackBtn.textContent = `[ GRAB NEW SHEET ] ${state.sheets.length} / ${state.maxStackSize}`;
    }
  });

  maxStackRow.appendChild(maxStackLabel);
  maxStackRow.appendChild(maxStackInput);
  maxStackRow.appendChild(maxStackBtn);

  // O2/sec dev producer — input sets the rate, display shows the live total
  const o2RateInput = panel.querySelector('#devO2RateInput') as HTMLInputElement;
  const o2RateEl    = panel.querySelector('#devO2Rate') as HTMLElement;
  o2RateInput.addEventListener('input', () => {
    devProducerRate = Math.max(0, parseFloat(o2RateInput.value) || 0);
  });
  onUpdate(() => { o2RateEl.textContent = totalRate('oxygen').toFixed(2); });

  // Resource injection rows
  const resourcesContainer = panel.querySelector('#devResources') as HTMLElement;
  for (const id of DEV_RESOURCES) {
    const row = document.createElement('div');
    row.className = 'dev-resource-row';

    const label = document.createElement('span');
    label.className = 'dev-resource-label';
    label.textContent = '> ' + id.toUpperCase();

    const input = document.createElement('input');
    input.type      = 'number';
    input.className = 'dev-number';
    input.min       = '1';

    const btn = document.createElement('button');
    btn.className   = 'dev-add-btn';
    btn.textContent = '[ ADD ]';
    btn.addEventListener('click', () => {
      const amount = BigInt(input.value) || 0n;

      if (amount > 0n) {
        state.resources[id] += amount;
        syncUI();
      }
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(btn);
    resourcesContainer.appendChild(row);
  }
}

buildDevPanel();
