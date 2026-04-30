function ensurePopupRoot() {
  if (document.getElementById('ui-popup-root')) return;
  const root = document.createElement('div');
  root.id = 'ui-popup-root';
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.zIndex = '2147483647';
  root.style.pointerEvents = 'none';
  document.body.appendChild(root);
}

function resolveFrontendPath(path) {
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  if (!normalizedPath) {
    return window.location.href;
  }

  try {
    return new URL(normalizedPath, window.location.href).href;
  } catch (error) {
    console.warn('Não foi possível resolver o caminho do frontend:', error);
    return normalizedPath;
  }
}

let activePopupOverlay = null;

function inferPopupTitle(type, buttonCount) {
  const normalizedType = String(type || 'info').toLowerCase();
  const isDecision = Number(buttonCount || 0) > 1;

  if (normalizedType === 'success') return 'Operação concluída';
  if (normalizedType === 'error') return isDecision ? 'Confirmar ação' : 'Não foi possível concluir';
  if (normalizedType === 'warning') return isDecision ? 'Atenção necessária' : 'Atenção';

  return isDecision ? 'Confirme para continuar' : 'Informação';
}

function inferPopupSymbol(type) {
  const normalizedType = String(type || 'info').toLowerCase();

  if (normalizedType === 'success') return 'OK';
  if (normalizedType === 'error' || normalizedType === 'warning') return '!';

  return 'i';
}

function inferPopupButtonClass(buttonConfig, index, total, type) {
  if (buttonConfig.className && String(buttonConfig.className).trim()) {
    return String(buttonConfig.className).trim();
  }

  const label = String(buttonConfig.text || '').toLowerCase();
  const isDanger = /(excluir|deletar|apagar|remover)/.test(label);
  const isSecondary = /(cancelar|voltar|fechar|manter)/.test(label);

  if (isDanger) return 'ui-btn-danger';
  if (isSecondary) return 'ui-btn-secondary';
  if (total > 1 && index === 0) return 'ui-btn-secondary';
  if (type === 'warning' && total > 1 && index === total - 1) return 'ui-btn-primary';

  return 'ui-btn-primary';
}

function createPopupElement(message, options = {}) {
  const {
    type = 'info',
    title = '',
    subtitle = '',
    buttons = [],
    showCloseButton = true,
    closeOnBackdrop = true,
    onClose = null
  } = options;
  const resolvedTitle = title || inferPopupTitle(type, buttons.length);
  const resolvedSymbol = inferPopupSymbol(type);

  const overlay = document.createElement('div');
  overlay.className = 'ui-popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.zIndex = '2147483647';
  overlay.style.pointerEvents = 'auto';
  overlay._onClose = typeof onClose === 'function' ? onClose : null;
  overlay._onCloseCalled = false;

  const modal = document.createElement('div');
  modal.className = 'ui-popup-modal ' + (type ? `ui-${type}` : '');
  modal.style.position = 'relative';
  modal.style.zIndex = '2147483647';

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
  content.innerHTML = `
    <div class="ui-popup-stack">
      <div class="ui-popup-header">
        <div class="ui-popup-status" aria-hidden="true">${resolvedSymbol}</div>
        <div class="ui-popup-header-copy">
          <h2 class="ui-popup-title">${resolvedTitle}</h2>
          ${subtitle ? `<p class="ui-popup-subtitle">${subtitle}</p>` : ''}
        </div>
      </div>
      <div class="ui-popup-message">${message}</div>
    </div>`;

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
    buttons.forEach((b, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ui-btn ' + inferPopupButtonClass(b, index, buttons.length, type);
      btn.textContent = b.text || 'OK';
      btn.addEventListener('click', async () => {
        let shouldClose = b.closeOnClick !== false;

        try {
          if (typeof b.onClick === 'function') {
            const result = await b.onClick();
            if (result === false) {
              shouldClose = false;
            }
          }
        } catch (e) {
          console.error(e);
          shouldClose = false;
        }

        if (shouldClose) {
          closePopup(overlay);
        }
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
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (!overlay._onCloseCalled && typeof overlay._onClose === 'function') {
      overlay._onCloseCalled = true;
      try { overlay._onClose(); } catch (error) { console.error(error); }
    }
  }, 200);
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

  const initialFocusElement = options.initialFocusSelector
    ? overlay.querySelector(options.initialFocusSelector)
    : overlay.querySelector('.ui-popup-actions .ui-btn-primary')
      || overlay.querySelector('.ui-popup-actions .ui-btn')
      || overlay.querySelector('.ui-popup-close');

  if (initialFocusElement) {
    requestAnimationFrame(() => initialFocusElement.focus());
  }

  if (options.autoClose && typeof options.autoClose === 'number') {
    setTimeout(() => closePopup(overlay), options.autoClose);
  }
}


window.showPopup = showPopup;
window.closePopup = closePopup;
window.resolveFrontendPath = resolveFrontendPath;
