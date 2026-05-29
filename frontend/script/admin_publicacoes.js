let publicacoesAdmin = [];

document.addEventListener('DOMContentLoaded', async function () {
  const admin = await window.adminApp.garantirAdministrador();
  if (!admin) return;

  document.getElementById('filtroModeracao').addEventListener('change', renderizarPublicacoes);
  document.getElementById('buscaPublicacao').addEventListener('input', renderizarPublicacoes);

  await carregarPublicacoes();
});

async function carregarPublicacoes() {
  try {
    publicacoesAdmin = await window.adminApp.requisicaoAdmin('/postagens');
    renderizarPublicacoes();
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

function renderizarPublicacoes() {
  const filtro = (document.getElementById('filtroModeracao').value || '').toUpperCase();
  const busca = (document.getElementById('buscaPublicacao').value || '').toLowerCase().trim();
  const container = document.getElementById('listaPublicacoesAdmin');

  const publicacoesFiltradas = publicacoesAdmin.filter((postagem) => {
    const statusModeracao = (postagem.statusModeracao || 'PENDENTE').toUpperCase();
    if (filtro && statusModeracao !== filtro) return false;

    if (!busca) return true;

    return [
      postagem.titulo,
      postagem.descricao,
      postagem.tipoResiduo,
      postagem.status,
      postagem.statusModeracao,
      window.adminApp.obterNomeEmpresa(postagem.empresa)
    ].filter(Boolean).some((valor) => valor.toLowerCase().includes(busca));
  });

  if (publicacoesFiltradas.length === 0) {
    container.innerHTML = '<div class="admin-empty">Nenhuma publicação encontrada com os filtros atuais.</div>';
    return;
  }

  container.innerHTML = publicacoesFiltradas.map((postagem) => `
    <div class="admin-list-item">
      <div class="admin-list-item-header">
        <div>
          <strong>${window.adminApp.obterNomeEmpresa(postagem.empresa)}</strong>
          <small>${postagem.titulo || 'Postagem sem título'}</small>
        </div>
        ${badgeModeracao(postagem.statusModeracao)}
      </div>
      <p><strong>Status da postagem:</strong> ${postagem.status || 'ABERTA'}</p>
      <p><strong>Tipo de resíduo:</strong> ${postagem.tipoResiduo || 'Não informado'}</p>
      <p><strong>Descrição:</strong> ${postagem.descricao || 'Sem descrição'}</p>
      <p><strong>Motivo da moderação:</strong> ${postagem.motivoModeracao || 'Sem observações'}</p>
      <small>Criada em ${window.adminApp.formatarDataHora(postagem.createdAt)}</small>
      <div class="admin-actions" style="margin-top: 14px;">
        <button type="button" class="btn-primary" onclick="moderarPublicacao(${postagem.id}, 'APROVADA')">Aprovar</button>
        <button type="button" class="btn-secondary" onclick="moderarPublicacao(${postagem.id}, 'REJEITADA')">Rejeitar</button>
        <button type="button" class="btn-danger" onclick="moderarPublicacao(${postagem.id}, 'BLOQUEADA')">Bloquear</button>
        <button type="button" class="btn-danger" onclick="excluirPublicacaoAdmin(${postagem.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function moderarPublicacao(id, statusModeracao) {
  if (statusModeracao !== 'APROVADA') {
    abrirPopupMotivoModeracao(id, statusModeracao);
    return;
  }

  await aplicarModeracao(id, statusModeracao, null);
}

function abrirPopupMotivoModeracao(id, statusModeracao) {
  const campoMotivoId = 'motivoModeracaoAdmin';
  const erroMotivoId = 'motivoModeracaoAdminErro';
  const postagemSera = statusModeracao === 'BLOQUEADA' ? 'bloqueada' : 'rejeitada';
  const textoAcao = statusModeracao === 'BLOQUEADA' ? 'Bloquear publicação' : 'Rejeitar publicação';

  showPopup(
    `<div class="ui-popup-form">
      <label class="ui-popup-form-label" for="${campoMotivoId}">Informe o motivo da moderação:</label>
      <textarea id="${campoMotivoId}" class="ui-popup-inline-input ui-popup-form-field" rows="4" placeholder="Descreva o motivo que será exibido para a empresa."></textarea>
      <p id="${erroMotivoId}" class="ui-popup-form-feedback" hidden>Preencha o motivo antes de continuar.</p>
    </div>`,
    {
      type: statusModeracao === 'BLOQUEADA' ? 'warning' : 'info',
      title: statusModeracao === 'BLOQUEADA' ? 'Bloquear publicação' : 'Rejeitar publicação',
      subtitle: `Explique por que esta publicação será ${postagemSera}.`,
      closeOnBackdrop: false,
      initialFocusSelector: `#${campoMotivoId}`,
      buttons: [
        { text: 'Cancelar', className: 'ui-btn-secondary', onClick: () => {} },
        {
          text: textoAcao,
          className: statusModeracao === 'BLOQUEADA' ? 'ui-btn-danger' : 'ui-btn-primary',
          onClick: () => {
            const campoMotivo = document.getElementById(campoMotivoId);
            const erroMotivo = document.getElementById(erroMotivoId);
            const motivoModeracao = campoMotivo?.value?.trim() ?? '';

            if (!motivoModeracao) {
              campoMotivo?.classList.add('ui-popup-field-invalid');
              erroMotivo?.removeAttribute('hidden');
              campoMotivo?.focus();
              return false;
            }

            campoMotivo?.classList.remove('ui-popup-field-invalid');
            erroMotivo?.setAttribute('hidden', 'hidden');
            return aplicarModeracao(id, statusModeracao, motivoModeracao);
          }
        }
      ]
    }
  );

  const campoMotivo = document.getElementById(campoMotivoId);
  const erroMotivo = document.getElementById(erroMotivoId);

  campoMotivo?.addEventListener('input', () => {
    if (!campoMotivo.value.trim()) return;
    campoMotivo.classList.remove('ui-popup-field-invalid');
    erroMotivo?.setAttribute('hidden', 'hidden');
  });
}

async function aplicarModeracao(id, statusModeracao, motivoModeracao) {

  try {
    const postagemAtualizada = await window.adminApp.requisicaoAdmin(`/postagens/${id}/moderar`, {
      method: 'PUT',
      body: JSON.stringify({ statusModeracao, motivoModeracao })
    });

    publicacoesAdmin = publicacoesAdmin.map((item) => item.id === postagemAtualizada.id ? postagemAtualizada : item);
    renderizarPublicacoes();
    showPopup('Moderação aplicada com sucesso.', { type: 'success' });
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

function excluirPublicacaoAdmin(id) {
  const postagem = publicacoesAdmin.find((item) => item.id === id);
  if (!postagem) return;

  const nomeEmpresa = window.adminApp.obterNomeEmpresa(postagem.empresa);
  const titulo = postagem.titulo || 'Postagem sem título';

  showPopup(`Deseja excluir permanentemente a publicação "${titulo}" da empresa ${nomeEmpresa}?`, {
    type: 'warning',
    subtitle: 'Essa ação remove a postagem da moderação e da vitrine da plataforma.',
    buttons: [
      { text: 'Cancelar', className: 'ui-btn-secondary', onClick: () => {} },
      {
        text: 'Excluir publicação',
        className: 'ui-btn-danger',
        onClick: async () => {
          try {
            if (window.authApp && typeof window.authApp.fetchApi === 'function') {
              await window.authApp.fetchApi(`/api/postagens/${id}`, { method: 'DELETE' });
            } else {
              const response = await fetch(`/api/postagens/${id}`, {
                method: 'DELETE',
                credentials: 'include'
              });

              if (!response.ok) {
                const mensagem = await response.text();
                throw new Error(mensagem || 'Não foi possível excluir a publicação.');
              }
            }

            publicacoesAdmin = publicacoesAdmin.filter((item) => item.id !== id);
            renderizarPublicacoes();
            showPopup('Publicação excluída com sucesso.', { type: 'success' });
          } catch (error) {
            showPopup(error.message, { type: 'error' });
          }
        }
      }
    ]
  });
}

function badgeModeracao(statusModeracao) {
  const mapa = {
    APROVADA: ['Aprovada', 'success'],
    PENDENTE: ['Pendente', 'warning'],
    REJEITADA: ['Rejeitada', 'danger'],
    BLOQUEADA: ['Bloqueada', 'danger']
  };
  const config = mapa[(statusModeracao || 'PENDENTE').toUpperCase()] || ['Pendente', 'warning'];
  return window.adminApp.criarBadgeStatus(config[0], config[1]);
}

window.moderarPublicacao = moderarPublicacao;
window.excluirPublicacaoAdmin = excluirPublicacaoAdmin;