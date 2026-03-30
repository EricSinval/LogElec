function ensurePopupRoot() {
  if (document.getElementById('ui-popup-root')) return;
  const root = document.createElement('div');
  root.id = 'ui-popup-root';
  document.body.appendChild(root);
}

let activePopupOverlay = null;

function createPopupElement(message, options = {}) {
  const { type = 'info', buttons = [], showCloseButton = true, closeOnBackdrop = true } = options;

  const overlay = document.createElement('div');
  overlay.className = 'ui-popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const modal = document.createElement('div');
  modal.className = 'ui-popup-modal ' + (type ? `ui-${type}` : '');

  if (showCloseButton) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ui-popup-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => closePopup(overlay));
    modal.appendChild(closeBtn);
  }

  const content = document.createElement('div');
  content.className = 'ui-popup-content';
  content.innerHTML = `<div class="ui-popup-message">${message}</div>`;

  const actions = document.createElement('div');
  actions.className = 'ui-popup-actions';

  if (buttons.length === 0) {
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'ui-btn ui-btn-primary';
    ok.textContent = 'OK';
    ok.addEventListener('click', () => closePopup(overlay));
    actions.appendChild(ok);
  } else {
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
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

  if (closeOnBackdrop) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePopup(overlay);
      }
    });
  }

  overlay._keyHandler = (event) => {
    if (activePopupOverlay !== overlay) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closePopup(overlay);
      return;
    }

    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (!overlay.contains(activeElement)) {
        event.preventDefault();
        event.stopPropagation();
        const primaryButton = actions.querySelector('.ui-btn-primary') || actions.querySelector('.ui-btn');
        if (primaryButton) primaryButton.click();
      }
    }
  };

  return overlay;
}

function closePopup(overlay) {
  if (!overlay) return;
  if (activePopupOverlay === overlay) {
    document.removeEventListener('keydown', overlay._keyHandler, true);
    activePopupOverlay = null;
  }
  overlay.classList.add('ui-popup-hide');
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
}


function showPopup(message, options = {}) {
  ensurePopupRoot();
  const root = document.getElementById('ui-popup-root');

  if (activePopupOverlay) {
    document.removeEventListener('keydown', activePopupOverlay._keyHandler, true);
    if (activePopupOverlay.parentNode) {
      activePopupOverlay.parentNode.removeChild(activePopupOverlay);
    }
    activePopupOverlay = null;
  }

  const overlay = createPopupElement(message, options);
  root.appendChild(overlay);
  activePopupOverlay = overlay;
  document.addEventListener('keydown', overlay._keyHandler, true);

  const firstActionButton = overlay.querySelector('.ui-popup-actions .ui-btn');
  if (firstActionButton) {
    firstActionButton.focus();
  }

  if (options.autoClose && typeof options.autoClose === 'number') {
    setTimeout(() => closePopup(overlay), options.autoClose);
  }
}


window.showPopup = showPopup;
window.closePopup = closePopup;
