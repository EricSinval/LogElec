let agendamentosAdmin = [];

document.addEventListener('DOMContentLoaded', async function () {
  const admin = await window.adminApp.garantirAdministrador();
  if (!admin) return;

  document.getElementById('filtroAgendamento').addEventListener('change', renderizarAgendamentosAdmin);

  await carregarAgendamentosAdmin();
});

async function carregarAgendamentosAdmin() {
  try {
    agendamentosAdmin = await window.adminApp.requisicaoAdmin('/agendamentos');
    renderizarAgendamentosAdmin();
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
}

function renderizarAgendamentosAdmin() {
  const filtro = (document.getElementById('filtroAgendamento').value || '').toUpperCase();
  const container = document.getElementById('listaAgendamentosAdmin');

  const itens = agendamentosAdmin.filter((agendamento) => {
    if (!filtro) return true;
    return (agendamento.status || '').toUpperCase() === filtro;
  });

  if (itens.length === 0) {
    container.innerHTML = '<div class="admin-empty">Nenhum agendamento encontrado para o filtro selecionado.</div>';
    return;
  }

  container.innerHTML = itens.map((agendamento) => `
    <div class="admin-list-item">
      <div class="admin-list-item-header">
        <div>
          <strong>${agendamento.postagem ? agendamento.postagem.titulo || 'Postagem' : 'Postagem não informada'}</strong><br>
          <small>${window.adminApp.formatarDataHora(agendamento.dataHora)}</small>
        </div>
        ${badgeAgendamentoAdmin(agendamento.status)}
      </div>
      <p><strong>Empresa solicitante:</strong> ${window.adminApp.obterNomeEmpresa(agendamento.empresaSolicitante)}</p>
      <p><strong>Empresa coletora:</strong> ${window.adminApp.obterNomeEmpresa(agendamento.empresaColetora)}</p>
      <p><strong>Observações:</strong> ${agendamento.observacoes || 'Sem observações registradas.'}</p>
    </div>
  `).join('');
}

function badgeAgendamentoAdmin(status) {
  const mapa = {
    AGENDADA: ['Agendada', 'warning'],
    CONFIRMADA: ['Confirmada', 'success'],
    REALIZADA: ['Realizada', 'success'],
    RECUSADO: ['Recusada', 'danger'],
    CANCELADA: ['Cancelada', 'neutral']
  };
  const config = mapa[(status || '').toUpperCase()] || ['Sem status', 'neutral'];
  return window.adminApp.criarBadgeStatus(config[0], config[1]);
}