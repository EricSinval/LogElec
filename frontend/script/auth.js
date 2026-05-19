(function initializeAuthApp() {
  const FALLBACK_API_ORIGIN = 'http://localhost:8080';
  const PROXIED_FRONTEND_PORTS = new Set(['', '80', '443', '8081']);
  const useSameOriginApi = PROXIED_FRONTEND_PORTS.has(window.location.port);
  const API_ORIGIN = useSameOriginApi ? window.location.origin : FALLBACK_API_ORIGIN;
  const SESSION_STORAGE_KEY = 'empresaLogada';
  const MODERATION_NOTIFICATION_STORAGE_PREFIX = 'logelecModeracaoVista';
  const MODERATION_CHECK_INTERVAL_MS = 30_000;
  const nativeFetch = window.fetch.bind(window);
  let sessionPromise = null;
  let moderationIntervalId = null;
  let moderationCheckPromise = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncateText(value, limit = 180) {
    const text = String(value == null ? '' : value).trim();
    if (text.length <= limit) {
      return text;
    }

    return `${text.slice(0, limit - 3).trim()}...`;
  }

  function formatarDataHora(valor) {
    if (!valor) {
      return 'Nao informada';
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return String(valor);
    }

    return data.toLocaleString('pt-BR');
  }

  function labelModeracao(status) {
    const normalizado = String(status || '').toUpperCase();

    if (normalizado === 'REJEITADA') {
      return 'Rejeitada';
    }

    if (normalizado === 'BLOQUEADA') {
      return 'Bloqueada';
    }

    return normalizado || 'Pendente';
  }

  function getModerationStorageKey(usuarioId) {
    return `${MODERATION_NOTIFICATION_STORAGE_PREFIX}:${usuarioId}`;
  }

  function readSeenModerations(usuarioId) {
    if (!usuarioId) {
      return {};
    }

    try {
      const raw = localStorage.getItem(getModerationStorageKey(usuarioId));
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('Nao foi possivel ler o cache de moderacao:', error);
      return {};
    }
  }

  function writeSeenModerations(usuarioId, payload) {
    if (!usuarioId) {
      return;
    }

    try {
      localStorage.setItem(getModerationStorageKey(usuarioId), JSON.stringify(payload || {}));
    } catch (error) {
      console.warn('Nao foi possivel salvar o cache de moderacao:', error);
    }
  }

  function buildModerationFingerprint(postagem) {
    return [
      postagem && postagem.id,
      postagem && postagem.statusModeracao,
      postagem && postagem.motivoModeracao,
      postagem && postagem.updatedAt,
      postagem && postagem.createdAt
    ].join('|');
  }

  function isRejectedOrBlocked(postagem) {
    const status = String(postagem && postagem.statusModeracao ? postagem.statusModeracao : '').toUpperCase();
    return status === 'REJEITADA' || status === 'BLOQUEADA';
  }

  function buildModerationPopupMessage(postagens) {
    return `
      <div class="ui-popup-form">
        <p>O administrador atualizou a moderacao das postagens abaixo. Revise os detalhes antes de publicar novamente.</p>
        ${postagens.map((postagem) => `
          <div class="ui-popup-form" style="margin-top: 12px; text-align: left;">
            <p><strong>Titulo:</strong> ${escapeHtml(postagem.titulo || 'Postagem sem titulo')}</p>
            <p><strong>Tipo de resíduo:</strong> ${escapeHtml(postagem.tipoResiduo || 'Nao informado')}</p>
            <p><strong>Status da moderacao:</strong> ${escapeHtml(labelModeracao(postagem.statusModeracao))}</p>
            <p><strong>Descricao:</strong> ${escapeHtml(truncateText(postagem.descricao || 'Sem descricao cadastrada.'))}</p>
            <p><strong>Motivo informado pelo administrador:</strong> ${escapeHtml(postagem.motivoModeracao || 'Sem observacoes.')}</p>
            <p><strong>Ultima atualizacao:</strong> ${escapeHtml(formatarDataHora(postagem.updatedAt || postagem.createdAt))}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function stopModerationMonitor() {
    if (moderationIntervalId !== null) {
      window.clearInterval(moderationIntervalId);
      moderationIntervalId = null;
    }

    document.removeEventListener('visibilitychange', handleModerationVisibilityChange);
  }

  function markModerationsAsSeen(usuarioId, postagens) {
    const seen = readSeenModerations(usuarioId);

    postagens.forEach((postagem) => {
      seen[String(postagem.id)] = buildModerationFingerprint(postagem);
    });

    writeSeenModerations(usuarioId, seen);
  }

  async function checkModerationNotifications() {
    if (moderationCheckPromise) {
      return moderationCheckPromise;
    }

    moderationCheckPromise = (async function loadModerationNotifications() {
      const usuario = obterSessaoLogada();
      if (!usuario || usuario.perfilAcesso === 'ADMIN') {
        stopModerationMonitor();
        return [];
      }

      if (document.querySelector('.ui-popup-overlay')) {
        return [];
      }

      let postagens = [];

      try {
        postagens = await fetchApi('/api/postagens/empresa/me', { method: 'GET' });
      } catch (error) {
        if (error && error.status === 401) {
          limparSessao();
          return [];
        }

        console.warn('Falha ao consultar postagens moderadas da sessao:', error);
        return [];
      }

      if (!Array.isArray(postagens) || postagens.length === 0) {
        return [];
      }

      const seen = readSeenModerations(usuario.id);
      const novidades = postagens.filter((postagem) => {
        if (!isRejectedOrBlocked(postagem)) {
          return false;
        }

        return seen[String(postagem.id)] !== buildModerationFingerprint(postagem);
      });

      if (!novidades.length) {
        return [];
      }

      markModerationsAsSeen(usuario.id, novidades);

      if (typeof window.showPopup === 'function') {
        window.showPopup(buildModerationPopupMessage(novidades), {
          type: 'warning',
          title: novidades.length === 1
            ? 'Sua postagem foi moderada'
            : 'Suas postagens foram moderadas',
          subtitle: novidades.length === 1
            ? 'Veja o motivo informado pelo administrador.'
            : 'Veja os motivos informados pelo administrador para cada postagem.',
          buttons: [
            {
              text: 'Ver minhas postagens',
              onClick: () => {
                window.location.href = window.resolveFrontendPath
                  ? window.resolveFrontendPath('editar_postagens.html')
                  : 'editar_postagens.html';
              }
            },
            { text: 'Fechar' }
          ]
        });
      }

      return novidades;
    })().finally(() => {
      moderationCheckPromise = null;
    });

    return moderationCheckPromise;
  }

  function handleModerationVisibilityChange() {
    if (!document.hidden) {
      void checkModerationNotifications();
    }
  }

  function activateModerationMonitor(usuario) {
    if (!usuario || usuario.perfilAcesso === 'ADMIN') {
      stopModerationMonitor();
      return;
    }

    if (moderationIntervalId === null) {
      moderationIntervalId = window.setInterval(() => {
        void checkModerationNotifications();
      }, MODERATION_CHECK_INTERVAL_MS);

      document.addEventListener('visibilitychange', handleModerationVisibilityChange);
    }

    void checkModerationNotifications();
  }

  function isApiPath(url) {
    return url.pathname.startsWith('/api/');
  }

  function normalizeApiUrl(input) {
    const parsedUrl = new URL(String(input), window.location.href);

    if (!isApiPath(parsedUrl)) {
      return parsedUrl.toString();
    }

    const targetOrigin = useSameOriginApi ? window.location.origin : FALLBACK_API_ORIGIN;
    return `${targetOrigin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  function isBackendApiUrl(input) {
    try {
      const url = new URL(String(input), window.location.href);
      return isApiPath(url)
        && [window.location.origin, API_ORIGIN, FALLBACK_API_ORIGIN, 'http://127.0.0.1:8080'].includes(url.origin);
    } catch (error) {
      return false;
    }
  }

  function buildApiUrl(path) {
    if (/^https?:\/\//i.test(String(path || ''))) {
      return normalizeApiUrl(path);
    }

    return new URL(String(path || ''), API_ORIGIN).toString();
  }

  function obterSessaoLogada() {
    try {
      const salvo = localStorage.getItem(SESSION_STORAGE_KEY);
      return salvo ? JSON.parse(salvo) : null;
    } catch (error) {
      console.error('Erro ao ler a sessao em cache:', error);
      return null;
    }
  }

  function persistirSessao(usuario) {
    if (!usuario) {
      limparSessao();
      return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(usuario));
  }

  function limparSessao() {
    stopModerationMonitor();
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  async function lerCorpoResposta(response) {
    if (response.status === 204 || response.status === 205) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  function criarErroHttp(response, payload) {
    const mensagem = typeof payload === 'string'
      ? (payload.trim() || `Erro HTTP ${response.status}`)
      : (payload && (payload.message || payload.error)) || `Erro HTTP ${response.status}`;

    const erro = new Error(mensagem);
    erro.status = response.status;
    erro.payload = payload;
    return erro;
  }

  function isSerializableBody(body) {
    return body && typeof body === 'object'
      && !(body instanceof FormData)
      && !(body instanceof URLSearchParams)
      && !(body instanceof Blob)
      && !(body instanceof ArrayBuffer);
  }

  if (!window.__logelecFetchWrapped) {
    window.fetch = function fetchWithSession(resource, options) {
      if (resource instanceof Request) {
        if (!isBackendApiUrl(resource.url)) {
          return nativeFetch(resource, options);
        }

        const requestInit = Object.assign({}, options);
        if (!requestInit.credentials) {
          requestInit.credentials = 'include';
        }

        return nativeFetch(new Request(normalizeApiUrl(resource.url), resource), requestInit);
      }

      const resourceUrl = resource instanceof URL ? resource.toString() : String(resource);
      if (!isBackendApiUrl(resourceUrl)) {
        return nativeFetch(resource, options);
      }

      const requestInit = Object.assign({}, options);
      if (!requestInit.credentials) {
        requestInit.credentials = 'include';
      }

      return nativeFetch(normalizeApiUrl(resourceUrl), requestInit);
    };

    window.__logelecFetchWrapped = true;
  }

  async function fetchApi(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const requestInit = Object.assign({}, options, { headers });

    if (requestInit.body !== undefined && isSerializableBody(requestInit.body)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      requestInit.body = JSON.stringify(requestInit.body);
    }

    const response = await fetch(buildApiUrl(path), requestInit);
    const payload = await lerCorpoResposta(response);

    if (!response.ok) {
      throw criarErroHttp(response, payload);
    }

    return payload;
  }

  async function carregarSessao() {
    if (sessionPromise) {
      return sessionPromise;
    }

    sessionPromise = (async function loadSessionFromServer() {
      const response = await fetch(buildApiUrl('/api/auth/me'), {
        method: 'GET',
        credentials: 'include'
      });

      const payload = await lerCorpoResposta(response);

      if (response.status === 401) {
        limparSessao();
        return null;
      }

      if (!response.ok) {
        throw criarErroHttp(response, payload);
      }

      persistirSessao(payload);
      activateModerationMonitor(payload);
      return payload;
    })();

    try {
      return await sessionPromise;
    } finally {
      sessionPromise = null;
    }
  }

  async function exigirSessao(options = {}) {
    const redirectPath = options.redirectPath || 'login.html';
    const message = options.message || 'Voce precisa fazer login primeiro!';
    const popupType = options.popupType || 'info';
    const usuario = await carregarSessao();

    if (usuario) {
      return usuario;
    }

    const redirecionar = function () {
      window.location.href = window.resolveFrontendPath
        ? window.resolveFrontendPath(redirectPath)
        : redirectPath;
    };

    if (typeof window.showPopup === 'function') {
      window.showPopup(message, {
        type: popupType,
        buttons: [{ text: 'Ir para login', onClick: redirecionar }]
      });
    } else {
      redirecionar();
    }

    return null;
  }

  async function autenticar(loginData) {
    const usuario = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: loginData
    });

    persistirSessao(usuario);
    return usuario;
  }

  async function encerrarSessao() {
    try {
      await fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Nao foi possivel encerrar a sessao no backend:', error);
    } finally {
      limparSessao();
    }
  }

  function obterDestinoPosLogin(usuario) {
    return usuario && usuario.perfilAcesso === 'ADMIN'
      ? 'admin_dashboard.html'
      : 'postagens.html';
  }

  window.authApp = {
    API_ORIGIN,
    buildApiUrl,
    obterSessaoLogada,
    persistirSessao,
    limparSessao,
    fetchApi,
    carregarSessao,
    exigirSessao,
    autenticar,
    encerrarSessao,
    obterDestinoPosLogin,
    checkModerationNotifications
  };
})();