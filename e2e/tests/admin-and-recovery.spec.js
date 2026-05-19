const { test, expect } = require('@playwright/test');
const {
  adminUser,
  login,
  resetPassword,
  seededRecoveryUser
} = require('./helpers');

test('recuperação de senha permite novo login', async ({ page }) => {
  const novaSenha = `NovaSenhaE2E!${Date.now()}`;

  await resetPassword(page, {
    email: seededRecoveryUser.email,
    cnpj: seededRecoveryUser.cnpj,
    novaSenha
  });

  await login(page, {
    email: seededRecoveryUser.email,
    senha: novaSenha,
    expectedPath: 'postagens.html',
    expectedEmail: seededRecoveryUser.email
  });

  const sessao = await page.evaluate(() => JSON.parse(localStorage.getItem('empresaLogada') || '{}'));
  expect(sessao.nome || sessao.nomeRazao).toBe(seededRecoveryUser.nome);
});

test('administrador acessa publicações e encontra textos seedados padronizados', async ({ page }) => {
  await login(page, {
    email: adminUser.email,
    senha: adminUser.senha,
    expectedPath: 'admin_dashboard.html'
  });

  await expect(page.locator('h1')).toContainText('Painel administrativo');
  await page.goto('/index/admin_publicacoes.html');

  await page.locator('#buscaPublicacao').fill('descarte responsável');
  await expect(page.locator('#listaPublicacoesAdmin')).toContainText('descarte responsável');

  await page.locator('#buscaPublicacao').fill('placas eletrônicas');
  await expect(page.locator('#listaPublicacoesAdmin')).toContainText('placas eletrônicas');
});