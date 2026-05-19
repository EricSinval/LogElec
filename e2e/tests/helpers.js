const path = require('node:path');
const { expect } = require('@playwright/test');

const adminUser = {
  email: 'admin@logelec.com',
  senha: 'Admin123'
};

const seededRecoveryUser = {
  email: 'biocolet@coleta.logelec.com',
  cnpj: '12345678000195',
  nome: 'BioColet'
};

let uniqueCounter = 0;
const SAMPLE_IMAGE_PATH = path.join(__dirname, '..', '..', 'frontend', 'img', 'sem-imagem.png');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calcularDigitoCnpj(numeros, pesos) {
  const soma = numeros
    .split('')
    .reduce((total, numero, indice) => total + Number(numero) * pesos[indice], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function gerarCnpjValido(base12) {
  const baseNormalizada = String(base12).replace(/\D/g, '').slice(0, 12).padStart(12, '0');
  const digito1 = calcularDigitoCnpj(baseNormalizada, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digito2 = calcularDigitoCnpj(`${baseNormalizada}${digito1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return `${baseNormalizada}${digito1}${digito2}`;
}

function buildUniqueCompany(prefix, tipo = 'DESCARTE') {
  uniqueCounter += 1;
  const uniqueNumber = `${Date.now()}${uniqueCounter}`.slice(-10);
  const safePrefix = slugify(prefix).replace(/\./g, '');

  return {
    tipo,
    nomeRazao: `E2E ${prefix} ${uniqueNumber}`,
    email: `${safePrefix}.${uniqueNumber}@logelec.test`,
    senha: 'SenhaE2E123!',
    endereco: `Rua ${prefix} ${uniqueNumber}, 100`,
    telefone: '(11) 99999-0000',
    cnpj: gerarCnpjValido(`98${uniqueNumber}`)
  };
}

async function registerCompany(page, company) {
  await page.goto('/index/cadastro.html');
  await page.locator(`.tipo-btn[data-tipo="${company.tipo}"]`).click();
  await page.locator('#nomeRazao').fill(company.nomeRazao);
  await page.locator('#cnpj').fill(company.cnpj);
  await page.locator('#email').fill(company.email);
  await page.locator('#senha').fill(company.senha);
  await page.locator('#endereco').fill(company.endereco);
  await page.locator('#telefone').fill(company.telefone);

  await Promise.all([
    page.waitForURL(/postagens\.html(?:\?.*)?$/),
    page.locator('#formCadastro button[type="submit"]').click()
  ]);

  await expect(page.locator('#tituloPostagens')).toContainText(
    company.tipo === 'DESCARTE' ? 'Empresas de Coleta Disponíveis' : 'Resíduos para Coleta'
  );

  const sessao = await page.evaluate(() => JSON.parse(localStorage.getItem('empresaLogada') || '{}'));
  expect(sessao.email).toBe(company.email);
}

async function login(page, options) {
  const expectedPath = options.expectedPath || 'postagens.html';

  await page.goto('/index/login.html');
  await page.locator('#email').fill(options.email);
  await page.locator('#senha').fill(options.senha);
  await page.locator('#loginForm button[type="submit"]').click();

  await expect(page.locator('.ui-popup-message')).toContainText(/login realizado com sucesso/i);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page).toHaveURL(new RegExp(escapeRegExp(expectedPath)));

  if (options.expectedEmail) {
    const sessao = await page.evaluate(() => JSON.parse(localStorage.getItem('empresaLogada') || '{}'));
    expect(sessao.email).toBe(options.expectedEmail);
  }
}

async function resetPassword(page, options) {
  await page.goto('/index/esqueci_senha.html');
  await page.locator('#email').fill(options.email);
  await page.locator('#cnpj').fill(options.cnpj);
  await page.locator('#novaSenha').fill(options.novaSenha);
  await page.locator('#confirmarSenha').fill(options.novaSenha);
  await page.locator('#recuperarForm button[type="submit"]').click();

  await expect(page.locator('.ui-popup-message')).toContainText(/senha redefinida com sucesso/i);
  await page.waitForURL(/login\.html(?:\?.*)?$/);
}

async function updateProfileAndReload(page, options) {
  await page.goto('/index/perfil.html');
  await expect(page.locator('#btnEditar')).toBeVisible();
  await page.locator('#btnEditar').click();

  await page.locator('#telefone').fill(options.telefone);
  await page.locator('#endereco').fill(options.endereco);
  await page.locator('#btnSalvar').click();

  await expect(page.locator('.ui-popup-message')).toContainText(/perfil atualizado com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();

  await expect(page.locator('#btnEditar')).toBeVisible();
  await expect(page.locator('#endereco')).toHaveValue(options.endereco);
  await page.reload();
  await expect(page.locator('#endereco')).toHaveValue(options.endereco);
}

async function createOwnPosting(page, options) {
  await page.goto('/index/cadastro_postagens.html');
  await page.locator('#descricao').fill(options.descricao);
  await page.locator('#tipoResiduo').fill(options.tipoResiduo);
  await page.locator('#peso').fill(String(options.peso));

  const enderecoRetirada = page.locator('#enderecoRetirada');
  if (await enderecoRetirada.isVisible()) {
    await enderecoRetirada.fill(options.enderecoRetirada);
  }

  await page.locator('input[name="dia"]').first().check();
  await page.locator('#horaInicio').fill(options.horaInicio || '08:00');
  await page.locator('#horaFim').fill(options.horaFim || '10:00');
  await page.locator('#foto').setInputFiles(options.fotoPath || SAMPLE_IMAGE_PATH);

  await page.locator('#formCadastroPostagem button[type="submit"]').click();
  await expect(page.locator('.ui-popup-message')).toContainText(/postagem cadastrada com sucesso/i);
  await page.getByRole('button', { name: /gerenciar postagens/i }).click();
  await expect(page).toHaveURL(/editar_postagens\.html(?:\?.*)?$/);
}

async function logout(page) {
  await page.evaluate(async () => {
    await window.authApp.encerrarSessao();
  });
}

async function rejectPostingAsAdmin(page, options) {
  await page.goto('/index/admin_publicacoes.html');
  await page.locator('#buscaPublicacao').fill(options.searchTerm);
  await expect(page.locator('#listaPublicacoesAdmin')).toContainText(options.searchTerm);

  const item = page.locator('#listaPublicacoesAdmin .admin-list-item').filter({
    hasText: options.searchTerm
  }).first();

  await expect(item).toBeVisible();
  await item.getByRole('button', { name: 'Rejeitar' }).click();
  await page.locator('#motivoModeracaoAdmin').fill(options.reason);
  await page.getByRole('button', { name: 'Rejeitar publicação' }).click();
  await expect(page.locator('.ui-popup-message')).toContainText(/moderação aplicada com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();
}

async function approvePostingAsAdmin(page, options) {
  await page.goto('/index/admin_publicacoes.html');
  await page.locator('#buscaPublicacao').fill(options.searchTerm);
  await expect(page.locator('#listaPublicacoesAdmin')).toContainText(options.searchTerm);

  const item = page.locator('#listaPublicacoesAdmin .admin-list-item').filter({
    hasText: options.searchTerm
  }).first();

  await expect(item).toBeVisible();
  await item.getByRole('button', { name: 'Aprovar' }).click();
  await expect(page.locator('.ui-popup-message')).toContainText(/moderação aplicada com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();
}

async function openOwnPostingInEditor(page, options = {}) {
  await page.goto('/index/editar_postagens.html');

  const item = options.searchTerm
    ? page.locator('#listaPostagens .item-postagem').filter({ hasText: options.searchTerm }).first()
    : page.locator('#listaPostagens .item-postagem').first();

  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator('#formEdicaoPostagem')).toBeVisible();

  if (options.expectedDescription !== undefined) {
    await expect(page.locator('#descricao')).toHaveValue(options.expectedDescription);
  }

  if (options.expectedStatus) {
    await expect(page.locator('#resumoModeracaoAtual')).toContainText(options.expectedStatus);
  }
}

async function updateSelectedPosting(page, options) {
  if (options.descricao !== undefined) {
    await page.locator('#descricao').fill(options.descricao);
  }

  if (options.tipoResiduo !== undefined) {
    await page.locator('#tipoResiduo').fill(options.tipoResiduo);
  }

  if (options.peso !== undefined) {
    await page.locator('#peso').fill(String(options.peso));
  }

  if (options.enderecoRetirada !== undefined) {
    const enderecoRetirada = page.locator('#enderecoRetirada');
    if (await enderecoRetirada.isVisible()) {
      await enderecoRetirada.fill(options.enderecoRetirada);
    }
  }

  if (options.horaInicio !== undefined) {
    await page.locator('#horaInicio').fill(options.horaInicio);
  }

  if (options.horaFim !== undefined) {
    await page.locator('#horaFim').fill(options.horaFim);
  }

  await page.locator('#formEdicaoPostagem .btn-salvar').click();
  await expect(page.locator('.ui-popup-message')).toContainText(/postagem atualizada com sucesso/i);
  await page.getByRole('button', { name: 'OK' }).click();

  if (options.descricao !== undefined) {
    await expect(page.locator('#descricao')).toHaveValue(options.descricao);
  }
}

async function searchMarketplace(page, term) {
  await page.locator('.search-bar input').fill(term);
  await expect(page.locator('#listaPostagens')).toContainText(term);
}

async function createSchedulingProposal(page, options = {}) {
  const card = options.searchTerm
    ? page.locator('#listaPostagens .card').filter({ hasText: options.searchTerm }).first()
    : page.locator('#listaPostagens .card').first();

  await expect(card).toBeVisible();
  await card.locator('.btn-agendar').click();

  await expect(page.locator('#popupAgendamento')).toBeVisible();
  await expect.poll(async () => page.locator('#diaAgendamento').inputValue()).not.toBe('');
  await expect.poll(async () => page.locator('#horarioAgendamento option').count()).toBeGreaterThan(1);

  await page.locator('#horarioAgendamento').selectOption({ index: 1 });
  await page.locator('#popupAgendamento .btn-confirmar').click();

  await expect(page.locator('.ui-popup-message')).toContainText(/proposta enviada/i);
}

async function assertProposalVisibleInSchedule(page, options = {}) {
  await page.goto('/index/agendamento.html');
  await expect.poll(async () => page.locator('#listaPropostas .agendamento-item').count()).toBeGreaterThan(0);

  if (options.counterpartName) {
    await expect(page.locator('#listaPropostas')).toContainText(options.counterpartName);
  }
}

module.exports = {
  adminUser,
  seededRecoveryUser,
  buildUniqueCompany,
  registerCompany,
  login,
  logout,
  resetPassword,
  updateProfileAndReload,
  createOwnPosting,
  rejectPostingAsAdmin,
  approvePostingAsAdmin,
  openOwnPostingInEditor,
  updateSelectedPosting,
  searchMarketplace,
  createSchedulingProposal,
  assertProposalVisibleInSchedule
};