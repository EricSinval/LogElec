let empresasAdmin = [];
let empresaSelecionadaId = null;

document.addEventListener('DOMContentLoaded', async function () {
  const admin = await window.adminApp.garantirAdministrador();
  if (!admin) return;

  document.getElementById('buscaEmpresa').addEventListener('input', renderizarEmpresas);
  document.getElementById('empresaForm').addEventListener('submit', salvarEmpresa);
  document.getElementById('cancelarEdicaoEmpresa').addEventListener('click', limparFormularioEmpresa);

  await carregarEmpresas();
});

async function carregarEmpresas() {
  try {
    empresasAdmin = await window.adminApp.requisicaoAdmin('/empresas');
    renderizarEmpresas();
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

function renderizarEmpresas() {
  const termo = (document.getElementById('buscaEmpresa').value || '').toLowerCase().trim();
  const tbody = document.getElementById('tabelaEmpresasBody');

  const empresasFiltradas = empresasAdmin.filter((empresa) => {
    if (!termo) return true;
    return [empresa.nome, empresa.email, empresa.cnpj, empresa.endereco]
      .filter(Boolean)
      .some((valor) => valor.toLowerCase().includes(termo));
  });

  if (empresasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="admin-empty">Nenhuma conta encontrada.</div></td></tr>';
    return;
  }

  tbody.innerHTML = empresasFiltradas.map((empresa) => `
    <tr>
      <td>
        <strong>${empresa.nome || 'Sem nome'}</strong><br>
        <small>${empresa.email || 'Sem e-mail'}</small>
      </td>
      <td>${empresa.tipo || 'Não informado'}</td>
      <td>${badgeConta(empresa.statusConta)}</td>
      <td>${empresa.telefone || 'Não informado'}</td>
      <td>${empresa.endereco || 'Não informado'}</td>
      <td>
        <div class="admin-actions">
          <button type="button" class="btn-primary" onclick="editarEmpresa(${empresa.id})">Editar</button>
          <button type="button" class="btn-secondary" onclick="alternarStatusConta(${empresa.id})">${empresa.statusConta === 'BLOQUEADA' ? 'Reativar' : 'Bloquear'}</button>
          <button type="button" class="btn-danger" onclick="excluirEmpresaAdmin(${empresa.id})">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editarEmpresa(id) {
  const empresa = empresasAdmin.find((item) => item.id === id);
  if (!empresa) return;

  empresaSelecionadaId = id;
  document.getElementById('empresaFormTitulo').textContent = 'Editar conta da empresa';
  document.getElementById('empresaId').value = String(id);
  document.getElementById('empresaNome').value = empresa.nome || '';
  document.getElementById('empresaEmail').value = empresa.email || '';
  document.getElementById('empresaTelefone').value = empresa.telefone || '';
  document.getElementById('empresaEndereco').value = empresa.endereco || '';
}

async function salvarEmpresa(event) {
  event.preventDefault();

  if (!empresaSelecionadaId) {
    showPopup('Selecione uma empresa na tabela para editar.', { type: 'info' });
    return;
  }

  const payload = {
    nome: document.getElementById('empresaNome').value,
    email: document.getElementById('empresaEmail').value,
    telefone: document.getElementById('empresaTelefone').value,
    endereco: document.getElementById('empresaEndereco').value
  };

  try {
    const empresaAtualizada = await window.adminApp.requisicaoAdmin(`/empresas/${empresaSelecionadaId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    empresasAdmin = empresasAdmin.map((empresa) => empresa.id === empresaAtualizada.id ? empresaAtualizada : empresa);
    renderizarEmpresas();
    limparFormularioEmpresa();
    showPopup('Conta atualizada com sucesso.', { type: 'success' });
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

async function alternarStatusConta(id) {
  const empresa = empresasAdmin.find((item) => item.id === id);
  if (!empresa) return;

  const proximoStatus = empresa.statusConta === 'BLOQUEADA' ? 'ATIVA' : 'BLOQUEADA';

  try {
    const empresaAtualizada = await window.adminApp.requisicaoAdmin(`/empresas/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statusConta: proximoStatus })
    });

    empresasAdmin = empresasAdmin.map((item) => item.id === empresaAtualizada.id ? empresaAtualizada : item);
    renderizarEmpresas();
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

function excluirEmpresaAdmin(id) {
  const empresa = empresasAdmin.find((item) => item.id === id);
  if (!empresa) return;

  showPopup(`Deseja excluir a conta de ${empresa.nome}?`, {
    type: 'warning',
    buttons: [
      { text: 'Cancelar', className: 'ui-btn-secondary', onClick: () => {} },
      {
        text: 'Excluir',
        className: 'ui-btn-danger',
        onClick: async () => {
          try {
            await window.adminApp.requisicaoAdmin(`/empresas/${id}`, { method: 'DELETE' });
            empresasAdmin = empresasAdmin.filter((item) => item.id !== id);
            renderizarEmpresas();
            limparFormularioEmpresa();
          } catch (error) {
            showPopup(error.message, { type: 'error' });
          }
        }
      }
    ]
  });
}

function limparFormularioEmpresa() {
  empresaSelecionadaId = null;
  document.getElementById('empresaFormTitulo').textContent = 'Editar conta selecionada';
  document.getElementById('empresaForm').reset();
  document.getElementById('empresaId').value = '';
}

function badgeConta(statusConta) {
  if (statusConta === 'BLOQUEADA') {
    return window.adminApp.criarBadgeStatus('Bloqueada', 'danger');
  }
  return window.adminApp.criarBadgeStatus('Ativa', 'success');
}

window.editarEmpresa = editarEmpresa;
window.alternarStatusConta = alternarStatusConta;
window.excluirEmpresaAdmin = excluirEmpresaAdmin;