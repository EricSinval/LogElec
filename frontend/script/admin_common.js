const ADMIN_API_BASE = '/api/admin';

function obterSessaoLogada() {
  if (window.authApp && typeof window.authApp.obterSessaoLogada === 'function') {
    return window.authApp.obterSessaoLogada();
  }

  try {
    const salvo = localStorage.getItem('empresaLogada');
    return salvo ? JSON.parse(salvo) : null;
  } catch (error) {
    console.error('Erro ao ler sessão do usuário:', error);
    return null;
  }
}

function isAdministrador(usuario) {
  return !!usuario && usuario.perfilAcesso === 'ADMIN';
}

function redirecionarParaPagina(path) {
  window.location.href = window.resolveFrontendPath ? window.resolveFrontendPath(path) : path;
}

async function garantirAdministrador() {
  const usuario = window.authApp && typeof window.authApp.exigirSessao === 'function'
    ? await window.authApp.exigirSessao({
        redirectPath: 'login.html',
        message: 'Você precisa fazer login primeiro!'
      })
    : obterSessaoLogada();

  if (!usuario) {
    return null;
  }

  if (!isAdministrador(usuario)) {
    showPopup('Esta área é restrita ao administrador da plataforma.', {
      type: 'warning',
      buttons: [{ text: 'Voltar', onClick: () => redirecionarParaPagina('postagens.html') }]
    });
    return null;
  }

  return usuario;
}

async function configurarShellAdmin() {
  const usuario = await garantirAdministrador();
  if (!usuario) return null;

  const nomeAdmin = document.getElementById('adminNome');
  if (nomeAdmin) {
    nomeAdmin.textContent = usuario.nomeRazao || usuario.nome || 'Administrador';
  }

  const paginaAtual = document.body.dataset.adminPage;
  document.querySelectorAll('.admin-nav-link').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.page === paginaAtual);
  });

  const sairBtn = document.getElementById('adminSair');
  if (sairBtn) {
    sairBtn.addEventListener('click', async () => {
      if (window.authApp && typeof window.authApp.encerrarSessao === 'function') {
        await window.authApp.encerrarSessao();
      } else {
        localStorage.removeItem('empresaLogada');
      }

      redirecionarParaPagina('login.html');
    });
  }

  return usuario;
}

async function requisicaoAdmin(path, options = {}) {
  if (window.authApp && typeof window.authApp.fetchApi === 'function') {
    const headers = Object.assign({}, options.headers || {});

    if (options.body !== undefined && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    return window.authApp.fetchApi(`${ADMIN_API_BASE}${path}`, Object.assign({}, options, {
      headers
    }));
  }

  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const response = await fetch(`${ADMIN_API_BASE}${path}`, Object.assign({}, options, {
    headers,
    credentials: 'include'
  }));
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(typeof payload === 'string' ? payload : 'Erro ao processar a requisição administrativa.');
  }

  return payload;
}

function obterNomeEmpresa(empresa) {
  if (!empresa) return 'Empresa não informada';
  return empresa.nomeRazao || empresa.nome || 'Empresa não informada';
}

function formatarDataHora(dataHora) {
  if (!dataHora) return 'Não informado';
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return dataHora;
  return data.toLocaleString('pt-BR');
}

function criarBadgeStatus(texto, tipo) {
  return `<span class="admin-badge ${tipo}">${texto}</span>`;
}

window.adminApp = {
  garantirAdministrador,
  configurarShellAdmin,
  requisicaoAdmin,
  obterSessaoLogada,
  obterNomeEmpresa,
  formatarDataHora,
  criarBadgeStatus,
  redirecionarParaPagina
};

document.addEventListener('DOMContentLoaded', function () {
  if (document.body.dataset.adminPage) {
    configurarShellAdmin();
  }
});