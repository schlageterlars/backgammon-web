(function () {
  const MIN = 0.5;         // 50%
  const MAX = 2.0;         // 200%
  const STEP = 0.1;        // 10%-Schritte
  const BASE_CHECKER = 40; // px bei 100%

  const zoomRoot     = document.getElementById('board-zoom');
  const zoomDisplay  = document.getElementById('zoom-display');
  const boardWrapper = document.getElementById('board-wrapper');
  const boardEl      = document.querySelector('#board-area .board');

  if (!zoomRoot || !zoomDisplay || !boardWrapper || !boardEl) return;

  const LS_KEY = 'bg_board_zoom';

  function clamp(v) { return Math.max(MIN, Math.min(MAX, v)); }

  function updateButtons(scale) {
    const dec = zoomRoot.querySelector('[data-action="decrease"]');
    const inc = zoomRoot.querySelector('[data-action="increase"]');
    dec.disabled = scale <= MIN + 1e-9;
    inc.disabled = scale >= MAX - 1e-9;
  }

  function applyScale(scale) {
    const s = clamp(scale);
    document.documentElement.style.setProperty('--board-scale', String(s));
    document.documentElement.style.setProperty('--checker-size', Math.round(BASE_CHECKER * s) + 'px');
    zoomDisplay.textContent = Math.round(s * 100) + '%';
    updateButtons(s);
    try { localStorage.setItem(LS_KEY, String(s)); } catch {}

    // reserviere die skalierten Maße im Flow
    requestAnimationFrame(() => {
      const rect = boardEl.getBoundingClientRect();
      boardWrapper.style.height = rect.height + 'px';
    });
  }

  function getCurrentScale() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--board-scale').trim();
    const n = parseFloat(v || '1');
    return isNaN(n) ? 1 : n;
  }

  // Events
  zoomRoot.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    let s = getCurrentScale();

    if (action === 'decrease') s = clamp(Math.round((s - STEP) * 10) / 10);
    if (action === 'increase') s = clamp(Math.round((s + STEP) * 10) / 10);
    if (action === 'reset')    s = 1.0;

    applyScale(s);
  });

  // Init
  const saved = (() => { try { return parseFloat(localStorage.getItem(LS_KEY)); } catch { return NaN; } })();
  applyScale(!isNaN(saved) && saved ? saved : 1.0);

  // auf Fenstergrößenänderung reagieren
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      const rect = boardEl.getBoundingClientRect();
      boardWrapper.style.height = rect.height + 'px';
    });
  });
})();
