const { test, expect } = require('@playwright/test');
const {
  adminUser,
  assertProposalVisibleInSchedule,
  buildUniqueCompany,
  createOwnPosting,
  createSchedulingProposal,
  login,
  logout,
  rejectPostingAsAdmin,
  registerCompany,
  searchMarketplace,
  updateProfileAndReload
} = require('./helpers');

test('empresa cadastrada encontra textos padronizados e envia proposta de agendamento', async ({ page }) => {
  const company = buildUniqueCompany('marketplace');

  await registerCompany(page, company);
  await searchMarketplace(page, 'placas eletrônicas');
  await createSchedulingProposal(page);
  await assertProposalVisibleInSchedule(page);
  await expect(page.locator('#listaPropostas')).toContainText('Pendente');
});

test('perfil mantém endereço atualizado após reload', async ({ page }) => {
  const company = buildUniqueCompany('perfil');
  const novoEndereco = company.endereco.replace(', 100', ', 101');

  await registerCompany(page, company);
  await updateProfileAndReload(page, {
    endereco: novoEndereco,
    telefone: '(11) 98888-0000'
  });

  const enderecoPersistido = await page.evaluate(() => {
    const sessao = JSON.parse(localStorage.getItem('empresaLogada') || '{}');
    return sessao.endereco;
  });

  expect(enderecoPersistido).toBe(novoEndereco);
});

test('empresa recebe popup ao entrar quando a postagem e rejeitada pela moderacao', async ({ page }) => {
  const company = buildUniqueCompany('moderacao');
  const descricao = `Postagem E2E rejeitada ${company.cnpj}`;
  const motivo = 'Motivo E2E: ajuste a descrição e os dados da publicação.';

  await registerCompany(page, company);
  await createOwnPosting(page, {
    descricao,
    tipoResiduo: 'Placas eletrônicas',
    peso: 42,
    enderecoRetirada: company.endereco
  });

  await logout(page);

  await login(page, {
    email: adminUser.email,
    senha: adminUser.senha,
    expectedPath: 'admin_dashboard.html'
  });

  await rejectPostingAsAdmin(page, {
    searchTerm: descricao,
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
  await expect(page.locator('.ui-popup-message')).toContainText('Placas eletrônicas');
  await expect(page.locator('.ui-popup-message')).toContainText(descricao);
  await expect(page.locator('.ui-popup-message')).toContainText(motivo);
  await expect(page.getByRole('button', { name: 'Ver minhas postagens' })).toBeVisible();

  await page.getByRole('button', { name: 'Ver minhas postagens' }).click();
  await expect(page).toHaveURL(/editar_postagens\.html(?:\?.*)?$/);
  const postagemItem = page.locator('#listaPostagens .item-postagem').first();
  await expect(postagemItem).toContainText('Placas eletrônicas');
  await postagemItem.click();
  await expect(page.locator('#descricao')).toHaveValue(descricao);
  await expect(page.locator('#painelModeracao')).toBeVisible();
  await expect(page.locator('#resumoModeracaoAtual')).toContainText('Rejeitada');
  await expect(page.locator('#resumoModeracaoAtual')).toContainText(motivo);
  await expect(page.locator('#historicoModeracaoLista')).toContainText('Esta é a primeira decisão registrada');
});