document.addEventListener('DOMContentLoaded', async function () {
  const admin = await window.adminApp.garantirAdministrador();
  if (!admin) return;

  try {
    const [resumo, postagens, agendamentos] = await Promise.all([
      window.adminApp.requisicaoAdmin('/resumo'),
      window.adminApp.requisicaoAdmin('/postagens'),
      window.adminApp.requisicaoAdmin('/agendamentos')
    ]);

    preencherResumo(resumo);
    renderizarPendencias(postagens);
    renderizarAgendamentosRecentes(agendamentos);
  } catch (error) {
    showPopup(error.message, { type: 'error' });
  }
});

function preencherResumo(resumo) {
  document.getElementById('totalEmpresas').textContent = resumo.totalEmpresas || 0;
  document.getElementById('contasBloqueadas').textContent = resumo.contasBloqueadas || 0;
  document.getElementById('totalPostagens').textContent = resumo.totalPostagens || 0;
  document.getElementById('pendenciasModeracao').textContent = resumo.publicacoesPendentes || 0;
  document.getElementById('publicacoesBloqueadas').textContent = resumo.publicacoesBloqueadas || 0;
  document.getElementById('totalAgendamentos').textContent = resumo.totalAgendamentos || 0;
}

function renderizarPendencias(postagens) {
  const container = document.getElementById('listaPendencias');
  const pendentes = postagens.filter((postagem) => (postagem.statusModeracao || 'PENDENTE') === 'PENDENTE').slice(0, 5);

  if (pendentes.length === 0) {
    container.innerHTML = '<div class="admin-empty">Não há publicações aguardando moderação.</div>';
    return;
  }

  container.innerHTML = pendentes.map((postagem) => `
    <div class="admin-list-item">
      <div class="admin-list-item-header">
        <strong>${window.adminApp.obterNomeEmpresa(postagem.empresa)}</strong>
        ${window.adminApp.criarBadgeStatus('Pendente', 'warning')}
      </div>
      <p><strong>Resíduo:</strong> ${postagem.tipoResiduo || 'Não informado'}</p>
      <p><strong>Descrição:</strong> ${postagem.descricao || 'Sem descrição'}</p>
      <small>Criada em ${window.adminApp.formatarDataHora(postagem.createdAt)}</small>
    </div>
  `).join('');
}

function renderizarAgendamentosRecentes(agendamentos) {
  const container = document.getElementById('listaAgendamentosRecentes');
  const recentes = agendamentos.slice(0, 6);

  if (recentes.length === 0) {
    container.innerHTML = '<div class="admin-empty">Não há agendamentos cadastrados.</div>';
    return;
  }

  container.innerHTML = recentes.map((agendamento) => `
    <div class="admin-list-item">
      <div class="admin-list-item-header">
        <strong>${agendamento.postagem ? agendamento.postagem.titulo || 'Postagem' : 'Postagem não informada'}</strong>
        ${badgeAgendamento(agendamento.status)}
      </div>
      <p><strong>Solicitante:</strong> ${window.adminApp.obterNomeEmpresa(agendamento.empresaSolicitante)}</p>
      <p><strong>Coletora:</strong> ${window.adminApp.obterNomeEmpresa(agendamento.empresaColetora)}</p>
      <small>${window.adminApp.formatarDataHora(agendamento.dataHora)}</small>
    </div>
  `).join('');
}

function badgeAgendamento(status) {
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