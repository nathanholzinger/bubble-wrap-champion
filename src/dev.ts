import './style/dev.css';
import { getCircleClipPath, GRID_SIZES } from './circleClip';
import { clearSave } from './save';

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

      <div class="dev-row">
        <button class="stack-btn" id="devClearSave">[ CLEAR SAVE ]</button>
      </div>

    </div>
  `;

  document.body.appendChild(panel);

  const titlebar = panel.querySelector('#devTitlebar') as HTMLElement;
  const body     = panel.querySelector('#devPanelBody') as HTMLElement;
  titlebar.addEventListener('click', () => body.classList.toggle('collapsed'));

  const slider   = panel.querySelector('#devFidelitySlider') as HTMLInputElement;
  const valLabel = panel.querySelector('#devFidelityVal') as HTMLElement;

  const clearBtn = panel.querySelector('#devClearSave') as HTMLButtonElement;
  clearBtn.addEventListener('click', () => {
    clearSave();
    location.reload();
  });

  slider.addEventListener('input', () => {
    const v = slider.value;
    valLabel.textContent = v;
    root.style.setProperty('--circle-fidelity', v);
    root.style.setProperty('--bubble-clip', getCircleClipPath(Number(v)));
  });
}

buildDevPanel();
