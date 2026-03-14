// ── Timing (seconds) ─────────────────────────────────────────────────────────
const T_OH_NO    = 0.6;
const T_UNIVERSE = 1.8;
const T_MUST     = 3.2;
const T_HURRY    = 4.6;
const T_FADE_OUT = 6.2;  // when overlay begins fading
const T_REMOVE   = 6.7;  // when overlay is removed and promise resolves

// ── Public ────────────────────────────────────────────────────────────────────

export function showIntro(): Promise<void> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';

    overlay.innerHTML = `
      <div class="intro-row">
        <span class="intro-text intro-oh-no">OH NO!</span>
        <span class="intro-text intro-universe">The Universe is almost out of Oxygen!</span>
      </div>
      <div class="intro-text intro-must">You must release the reserves!</div>
      <div class="intro-text intro-hurry">HURRY!</div>
    `;

    // Stamp animation delays onto each element as inline styles so the
    // values stay in one place (here) rather than split across CSS.
    const q = (sel: string) => overlay.querySelector(sel) as HTMLElement;
    q('.intro-oh-no').style.animationDelay    = T_OH_NO    + 's';
    q('.intro-universe').style.animationDelay = T_UNIVERSE + 's';
    q('.intro-must').style.animationDelay     = T_MUST     + 's';
    q('.intro-hurry').style.animationDelay    = T_HURRY    + 's';

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('intro-out');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, (T_REMOVE - T_FADE_OUT) * 1000);
    }, T_FADE_OUT * 1000);
  });
}
