/* Single-character shortcuts are optional and never consume input/control keys. */
(function (root) {
  'use strict';
  const doc = root.document;
  let dialog, previousFocus;
  function help() {
    if (!dialog) {
      dialog = doc.createElement('dialog'); dialog.className = 'sfi-shortcut-dialog';
      dialog.setAttribute('aria-labelledby', 'shortcutTitle');
      const heading = doc.createElement('h2'); heading.id = 'shortcutTitle'; heading.dataset.i18n = 'Keyboard Shortcuts';
      const list = doc.createElement('dl'); list.className = 'sfi-shortcut-list';
      for (const [key, description] of [['/', 'Focus specification search on pages with a search field'], ['?', 'Show this shortcut reference'], ['Esc', 'Close shortcut help or the mobile navigation']]) {
        const term = doc.createElement('dt'), value = doc.createElement('dd'), kbd = doc.createElement('kbd');
        kbd.textContent = key; term.append(kbd); value.dataset.i18n = description; list.append(term, value);
      }
      const close = doc.createElement('button'); close.type = 'button'; close.className = 'sfi-btn sfi-btn-secondary'; close.dataset.i18n = 'Close';
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => previousFocus?.focus());
      dialog.append(heading, list, close); doc.body.append(dialog);
    }
    root.SFII18n?.translate(doc);
    previousFocus = doc.activeElement;
    if (!dialog.open) dialog.showModal();
  }
  doc.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey || event.ctrlKey || event.metaKey || !root.SFIPreferences?.get().shortcuts) return;
    const target = event.target;
    if (target.closest?.('input, textarea, select, button, a, summary, [role="button"], [role="textbox"], [role="combobox"], [role="slider"], [role="switch"], [role="menuitem"], [contenteditable]:not([contenteditable="false"])') || doc.querySelector('dialog[open], [aria-modal="true"]')) return;
    if (event.key === '/') {
      const input = doc.getElementById('sfiSearch') || doc.querySelector('input[name="q"]');
      if (input && !input.disabled && input.getClientRects().length) { event.preventDefault(); input.focus(); }
    } else if (event.key === '?') { event.preventDefault(); help(); }
  });
})(window);
