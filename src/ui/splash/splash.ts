import './splash.css';

export function showSplash(hasSave: boolean): Promise<void> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'splash-overlay';

    const btn = document.createElement('button');
    btn.className   = 'stack-btn';
    btn.textContent = hasSave ? '[ LOAD AUTO SAVE ]' : '[ START NEW GAME ]';

    btn.addEventListener('click', () => {
      overlay.remove();
      resolve();
    });

    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  });
}
