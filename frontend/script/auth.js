(function initializeAuthApp() {
  const FALLBACK_API_ORIGIN = 'http://localhost:8080';
  const PROXIED_FRONTEND_PORTS = new Set(['', '80', '443', '8081']);
  const useSameOriginApi = PROXIED_FRONTEND_PORTS.has(window.location.port);
  const API_ORIGIN = useSameOriginApi ? window.location.origin : FALLBACK_API_ORIGIN;
  const SESSION_STORAGE_KEY = 'empresaLogada';
  const nativeFetch = window.fetch.bind(window);
  let sessionPromise = null;

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
    obterDestinoPosLogin
  };
})();