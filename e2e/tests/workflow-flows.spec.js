const { test, expect } = require('@playwright/test');
const {
  adminUser,
  approvePostingAsAdmin,
  assertProposalVisibleInSchedule,
  buildUniqueCompany,
  createOwnPosting,
  createSchedulingProposal,
  login,
  logout,
  openOwnPostingInEditor,
  rejectPostingAsAdmin,
  registerCompany,
  searchMarketplace,
  updateSelectedPosting
} = require('./helpers');

test('empresa corrige postagem rejeitada e recebe aprovação após revisão', async ({ page }) => {
  const company = buildUniqueCompany('revisao');
  const tipoResiduo = `Revisao-${company.cnpj.slice(-6)}`;
  const descricaoOriginal = `Descricao original para revisão ${company.cnpj}`;
  const descricaoRevisada = `Descricao revisada e reenviada ${company.cnpj}`;
  const motivo = 'Motivo E2E: inclua detalhes mais claros antes da aprovação.';

  await registerCompany(page, company);
  await createOwnPosting(page, {
    descricao: descricaoOriginal,
    tipoResiduo,
    peso: 18,
    enderecoRetirada: company.endereco
  });

  await logout(page);

  await login(page, {
    email: adminUser.email,
    senha: adminUser.senha,
    expectedPath: 'admin_dashboard.html'
  });

  await rejectPostingAsAdmin(page, {
    searchTerm: tipoResiduo,
    reason: motivo
  });

  await logout(page);

  await login(page, {
    email: company.email,
    senha: company.senha,
    expectedPath: 'postagens.html',
    expectedEmail: company.email
  });

  await expect(page.locator('.ui-popup-title')).toContainText(/moderada/i);
  await page.getByRole('button', { name: 'Ver minhas postagens' }).click();

  await openOwnPostingInEditor(page, {
    searchTerm: tipoResiduo,
    expectedDescription: descricaoOriginal,
    expectedStatus: 'Rejeitada'
  });

  await expect(page.locator('#resumoModeracaoAtual')).toContainText(motivo);

  await updateSelectedPosting(page, {
    descricao: descricaoRevisada
  });

  await expect(page.locator('#resumoModeracaoAtual')).toContainText('Pendente');

  await logout(page);

  await login(page, {
    email: adminUser.email,
    senha: adminUser.senha,
    expectedPath: 'admin_dashboard.html'
  });

  await approvePostingAsAdmin(page, {
    searchTerm: descricaoRevisada
  });

  await logout(page);

  await login(page, {
    email: company.email,
    senha: company.senha,
    expectedPath: 'postagens.html',
    expectedEmail: company.email
  });

  await openOwnPostingInEditor(page, {
    searchTerm: tipoResiduo,
    expectedDescription: descricaoRevisada,
    expectedStatus: 'Aprovada'
  });

  await expect(page.locator('#historicoModeracaoLista')).toContainText(motivo);
});

test('duas empresas percorrem o agendamento até a coleta ser concluída', async ({ page }) => {
  const collector = buildUniqueCompany('coleta', 'COLETA');
  const requester = buildUniqueCompany('solicitante');
  const tipoResiduo = `Coleta-${collector.cnpj.slice(-6)}`;
  const descricao = `Servico de coleta completo ${collector.cnpj}`;

  await registerCompany(page, collector);
  await createOwnPosting(page, {
    descricao,
    tipoResiduo,
    peso: 120,
    horaInicio: '09:00',
    horaFim: '11:00'
  });

  await logout(page);

  await login(page, {
    email: adminUser.email,
    senha: adminUser.senha,
    expectedPath: 'admin_dashboard.html'
  });

  await approvePostingAsAdmin(page, {
    searchTerm: tipoResiduo
  });

  await logout(page);

  await registerCompany(page, requester);
  await searchMarketplace(page, tipoResiduo);
  await createSchedulingProposal(page, {
    searchTerm: tipoResiduo
  });
  await assertProposalVisibleInSchedule(page, {
    counterpartName: collector.nomeRazao
  });
  await expect(page.locator('#listaPropostas')).toContainText('Pendente');

  await logout(page);

  await login(page, {
    email: collector.email,
    senha: collector.senha,
    expectedPath: 'postagens.html',
    expectedEmail: collector.email
  });

  await page.goto('/index/agendamento.html');

  const aguardandoItem = page.locator('#listaAguardando .agendamento-item').filter({
    hasText: requester.nomeRazao
  }).first();

  await expect(aguardandoItem).toBeVisible();
  await aguardandoItem.click();
  await expect(page.locator('#detalhesAgendamento')).toContainText(requester.nomeRazao);

  await page.getByRole('button', { name: 'Aceitar proposta' }).click();
  await expect(page.locator('.ui-popup-message')).toContainText(/status do agendamento atualizado com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();

  const andamentoItem = page.locator('#listaAndamento .agendamento-item').filter({
    hasText: requester.nomeRazao
  }).first();

  await expect(andamentoItem).toBeVisible();
  await andamentoItem.click();
  await expect(page.getByRole('button', { name: 'Concluir coleta' })).toBeVisible();

  await page.getByRole('button', { name: 'Concluir coleta' }).click();
  await expect(page.locator('.ui-popup-message')).toContainText(/status do agendamento atualizado com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();

  const historicoItem = page.locator('#listaHistorico .agendamento-item').filter({
    hasText: requester.nomeRazao
  }).first();

  await expect(historicoItem).toBeVisible();
  await expect(historicoItem).toContainText('Concluído');
});