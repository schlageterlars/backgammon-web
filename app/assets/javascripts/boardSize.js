(function () {
  const sizeSwitcher = document.getElementById('board-size-switcher');
  const boardWrapper = document.getElementById('board-wrapper');
  const boardEl      = document.querySelector('#board-area .board');

  const SIZE_PRESETS = {
    small:   { scale: 0.80, checker: 34 },
    medium:  { scale: 1.00, checker: 40 },
    classic: { scale: 1.20, checker: 46 },
  };

  function applyActive(key) {
    Array.from(sizeSwitcher?.querySelectorAll('.list-group-item') || [])
      .forEach(li => li.classList.toggle('active', li.dataset.size === key));
  }

  function applySize(key) {
    const p = SIZE_PRESETS[key] || SIZE_PRESETS.classic;
    document.documentElement.style.setProperty('--board-scale', String(p.scale));
    document.documentElement.style.setProperty('--checker-size', p.checker + 'px');
    applyActive(key);
    try { localStorage.setItem('bg_board_size', key); } catch {}

    requestAnimationFrame(() => {
      if (!boardEl || !boardWrapper) return;
      const rect = boardEl.getBoundingClientRect();
      boardWrapper.style.height = rect.height + 'px';
    });
  }

  sizeSwitcher?.addEventListener('click', (ev) => {
    const li = ev.target.closest('.list-group-item[data-size]');
    if (!li) return;
    applySize(li.dataset.size);
  });

  // Init
  const saved = (() => { try { return localStorage.getItem('bg_board_size'); } catch { return null; } })();
  applySize(saved || 'classic');
})();
