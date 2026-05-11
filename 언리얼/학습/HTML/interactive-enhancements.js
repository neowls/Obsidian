(() => {
  const labs = [...document.querySelectorAll('.interactive-lab')];
  if (!labs.length) return;

  function syncPressedStates(root = document) {
    root.querySelectorAll('.segmented-control, .preset-row').forEach((group) => {
      const buttons = [...group.querySelectorAll('button.mini-button')];
      if (!buttons.length) return;
      const hasSelected = buttons.some((button) => button.classList.contains('is-selected'));
      buttons.forEach((button) => {
        button.setAttribute('aria-pressed', String(hasSelected && button.classList.contains('is-selected')));
      });
    });
  }

  function syncRangeText(input) {
    const value = input.value;
    const suffix = input.id && input.id.toLowerCase().includes('angle') ? '도' : '';
    input.setAttribute('aria-valuetext', `${value}${suffix}`);
  }

  labs.forEach((lab) => {
    const title = lab.closest('section')?.querySelector('h2')?.textContent?.trim();
    if (!lab.hasAttribute('role')) lab.setAttribute('role', 'region');
    if (title && !lab.hasAttribute('aria-label')) lab.setAttribute('aria-label', `${title} 조작 패널`);

    lab.querySelectorAll('.event-log').forEach((log) => {
      log.setAttribute('role', 'status');
      log.setAttribute('aria-live', 'polite');
      log.setAttribute('aria-atomic', 'false');
      const observer = new MutationObserver(() => {
        log.classList.remove('is-updated');
        window.requestAnimationFrame(() => log.classList.add('is-updated'));
      });
      observer.observe(log, { childList: true, subtree: true, characterData: true });
    });

    lab.querySelectorAll('input[type="range"]').forEach((input) => {
      syncRangeText(input);
      input.addEventListener('input', () => syncRangeText(input));
      input.addEventListener('change', () => syncRangeText(input));
    });
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('.segmented-control button, .preset-row button')) {
      window.setTimeout(() => syncPressedStates(), 0);
    }
  });

  document.addEventListener('change', () => window.setTimeout(() => syncPressedStates(), 0));
  syncPressedStates();
})();
