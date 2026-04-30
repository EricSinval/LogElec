let empresaLogada = null;
let contatoAtivo = null;
let timerAtualizacao = null;

function truncar(texto, limite = 60) {
  if (!texto) return '';
  return texto.length > limite ? `${texto.slice(0, limite - 3)}...` : texto;
}

function formatarHora(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function garantirLogin() {
  if (window.authApp && typeof window.authApp.exigirSessao === 'function') {
    return window.authApp.exigirSessao({
      redirectPath: 'login.html',
      message: 'Você precisa fazer login primeiro!'
    }).then(usuario => {
      if (!usuario) {
        return false;
      }

      empresaLogada = usuario;
      return true;
    });
  }

  const salvo = localStorage.getItem('empresaLogada');
  if (!salvo) {
    window.location.href = 'login.html';
    return false;
  }

  empresaLogada = JSON.parse(salvo);
  return true;
}

function atualizarLinkPostagens() {
  const link = document.getElementById('linkPostagensTipo');
  if (!link || !empresaLogada) return;
  link.textContent = 'Postagens';
}

async function carregarContatos() {
  const lista = document.getElementById('listaContatos');

  try {
    const response = await fetch('http://localhost:8080/api/mensagens/contatos-confirmados/me');
    if (!response.ok) {
      if (response.status === 404) {
        lista.innerHTML = '<p class="vazio">Sem contatos disponíveis. Confirme um agendamento para liberar mensagens.</p>';
        return;
      }
      throw new Error(await response.text());
    }

    const contatos = await response.json();

    if (!contatos.length) {
      lista.innerHTML = '<p class="vazio">Sem contatos disponíveis. Confirme um agendamento para liberar mensagens.</p>';
      return;
    }

    lista.innerHTML = contatos.map(contato => `
      <div class="contato-item ${contatoAtivo && contatoAtivo.empresaId === contato.empresaId ? 'ativo' : ''}" data-id="${contato.empresaId}">
        <div class="contato-nome">${contato.nome || 'Empresa'}</div>
        <div class="contato-ultima">${truncar(contato.ultimaMensagem || 'Sem mensagens ainda')}</div>
      </div>
    `).join('');

    lista.querySelectorAll('.contato-item').forEach(item => {
      item.addEventListener('click', () => {
        const empresaId = Number(item.getAttribute('data-id'));
        const contato = contatos.find(c => c.empresaId === empresaId);
        if (contato) selecionarContato(contato);
      });
    });

    if (!contatoAtivo && contatos.length) {
      selecionarContato(contatos[0]);
    }
  } catch (error) {
    lista.innerHTML = '<p class="vazio">Sem contatos disponíveis no momento. Quando houver agendamento confirmado, os contatos aparecerão aqui.</p>';
  }
}

async function carregarConversa() {
  if (!contatoAtivo) return;

  const lista = document.getElementById('listaMensagens');

  try {
    const response = await fetch(`http://localhost:8080/api/mensagens/conversa/${contatoAtivo.empresaId}`);
    if (!response.ok) {
      if (response.status === 404) {
        lista.innerHTML = '<div class="estado-inicial">Conversa indisponível no momento.</div>';
        document.getElementById('formMensagem').style.display = 'none';
        return;
      }
      throw new Error(await response.text());
    }

    const mensagens = await response.json();

    if (!mensagens.length) {
      lista.innerHTML = '<div class="estado-inicial">Conversa liberada. Envie a primeira mensagem.</div>';
      return;
    }

    lista.innerHTML = mensagens.map(msg => {
      const enviadaPorMim = msg.empresaRemetente && msg.empresaRemetente.id === empresaLogada.id;
      return `
        <div class="msg ${enviadaPorMim ? 'enviada' : 'recebida'}">
          ${msg.conteudo}
          <span class="msg-hora">${formatarHora(msg.createdAt)}</span>
        </div>
      `;
    }).join('');

    lista.scrollTop = lista.scrollHeight;
  } catch (error) {
    lista.innerHTML = '<div class="estado-inicial">Não foi possível carregar a conversa agora.</div>';
    document.getElementById('formMensagem').style.display = 'none';
  }
}

function selecionarContato(contato) {
  contatoAtivo = contato;
  const cabecalho = document.getElementById('cabecalhoConversa');
  cabecalho.innerHTML = `<h2>${contato.nome || 'Contato'}</h2><p>Conversa liberada por agendamento confirmado.</p>`;
  document.getElementById('formMensagem').style.display = 'grid';
  carregarContatos();
  carregarConversa();
}

async function enviarMensagem(event) {
  event.preventDefault();
  if (!contatoAtivo) return;

  const input = document.getElementById('inputMensagem');
  const conteudo = input.value.trim();
  if (!conteudo) return;

  try {
    const response = await fetch('http://localhost:8080/api/mensagens/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatarioId: contatoAtivo.empresaId,
        conteudo
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    input.value = '';
    await carregarConversa();
    await carregarContatos();
  } catch (error) {
    showPopup(error.message || 'Erro ao enviar mensagem', { type: 'error' });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await garantirLogin()) return;
  atualizarLinkPostagens();

  const form = document.getElementById('formMensagem');
  if (form) {
    form.addEventListener('submit', enviarMensagem);
  }

  await carregarContatos();

  timerAtualizacao = setInterval(() => {
    carregarContatos();
    carregarConversa();
  }, 7000);
});

window.addEventListener('beforeunload', () => {
  if (timerAtualizacao) {
    clearInterval(timerAtualizacao);
  }
});