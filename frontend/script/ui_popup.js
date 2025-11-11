function ensurePopupRoot() {
  if (document.getElementById('ui-popup-root')) return;
  const root = document.createElement('div');
  root.id = 'ui-popup-root';
  document.body.appendChild(root);
}

function createPopupElement(message, options = {}) {
  const { type = 'info', buttons = [] } = options;

  const overlay = document.createElement('div');
  overlay.className = 'ui-popup-overlay';

  const modal = document.createElement('div');
  modal.className = 'ui-popup-modal ' + (type ? `ui-${type}` : '');

  const content = document.createElement('div');
  content.className = 'ui-popup-content';
  content.innerHTML = `<div class="ui-popup-message">${message}</div>`;

  const actions = document.createElement('div');
  actions.className = 'ui-popup-actions';

  if (buttons.length === 0) {
    const ok = document.createElement('button');
    ok.className = 'ui-btn ui-btn-primary';
    ok.textContent = 'OK';
    ok.addEventListener('click', () => closePopup(overlay));
    actions.appendChild(ok);
  } else {
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'ui-btn ' + (b.className || '');
      btn.textContent = b.text || 'OK';
      btn.addEventListener('click', () => {
        try { if (typeof b.onClick === 'function') b.onClick(); } catch (e) { console.error(e); }
        closePopup(overlay);
      });
      actions.appendChild(btn);
    });
  }

  modal.appendChild(content);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  return overlay;
}

function closePopup(overlay) {
  if (!overlay) return;
  overlay.classList.add('ui-popup-hide');
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
}

// Exposed function
function showPopup(message, options = {}) {
  ensurePopupRoot();
  const root = document.getElementById('ui-popup-root');
  const overlay = createPopupElement(message, options);
  root.appendChild(overlay);

  if (options.autoClose && typeof options.autoClose === 'number') {
    setTimeout(() => closePopup(overlay), options.autoClose);
  }
}

// Make available in global scope
window.showPopup = showPopup;
window.closePopup = closePopup;
