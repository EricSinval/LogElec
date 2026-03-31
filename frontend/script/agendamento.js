console.log('Agendamento.js carregado!');

let postagemSelecionada = null;
let empresaLogada = null;
let mapaAgendamentos = new Map();
let agendamentoSelecionadoId = null;

function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'login.html';
}

function formatarDataHora(valor) {
    if (!valor) return 'Data não informada';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function labelStatus(status) {
    if (status === 'AGENDADA') return 'Pendente';
    if (status === 'CONFIRMADA') return 'Em andamento';
    if (status === 'CANCELADA') return 'Cancelado';
    if (status === 'RECUSADO') return 'Recusado';
    if (status === 'REALIZADA') return 'Concluído';
    return status || 'Não informado';
}

function classeStatus(status) {
    if (status === 'AGENDADA') return 'pendente';
    if (status === 'CONFIRMADA') return 'aceito';
    if (status === 'CANCELADA') return 'cancelado';
    if (status === 'RECUSADO') return 'recusado';
    if (status === 'REALIZADA') return 'concluido';
    return 'pendente';
}

function contraparte(agendamento) {
    if (!empresaLogada) return null;
    const coletora = agendamento.empresaColetora || null;
    const solicitante = agendamento.empresaSolicitante || null;
    if (coletora && coletora.id === empresaLogada.id) return solicitante;
    return coletora;
}

function marcarItemAtivo(id) {
    document.querySelectorAll('.agendamento-item').forEach(item => {
        item.classList.toggle('ativo', Number(item.getAttribute('data-id')) === Number(id));
    });
}

function renderListaAgendamentos(containerId, lista) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!lista.length) {
        container.innerHTML = '<p class="vazio-lista">Nenhum agendamento nesta categoria.</p>';
        return;
    }

    container.innerHTML = lista.map(ag => {
        const outra = contraparte(ag);
        const nomeOutra = (outra && (outra.nomeRazao || outra.nome)) || 'Empresa não informada';
        return `
            <div class="agendamento-item" data-id="${ag.id}" onclick="selecionarAgendamentoPainel(${ag.id})">
                <strong>${nomeOutra}</strong>
                <span>${formatarDataHora(ag.dataHora)}</span>
                <span class="status-chip ${classeStatus(ag.status)}">${labelStatus(ag.status)}</span>
            </div>
        `;
    }).join('');
}

function atualizarContadores(categorias) {
    document.getElementById('countAguardando').textContent = String(categorias.aguardando.length);
    document.getElementById('countPropostas').textContent = String(categorias.propostas.length);
    document.getElementById('countAndamento').textContent = String(categorias.andamento.length);
    document.getElementById('countHistorico').textContent = String(categorias.historico.length);
}

function atualizarLinkMensagens(categorias) {
    const link = document.getElementById('linkMensagens');
    if (!link) return;
    const possuiContatoLiberado = categorias.andamento.length > 0 || categorias.historico.some(a => a.status === 'REALIZADA');
    link.classList.toggle('disabled-link', !possuiContatoLiberado);
}

function construirCategorias(coletora, solicitante) {
    const todos = [...coletora, ...solicitante].reduce((acc, item) => {
        if (!acc.some(x => x.id === item.id)) acc.push(item);
        return acc;
    }, []);

    const aguardando = coletora.filter(a => a.status === 'AGENDADA');
    const propostas = solicitante.filter(a => a.status === 'AGENDADA');
    const andamento = todos.filter(a => a.status === 'CONFIRMADA');
    const historico = todos.filter(a => ['REALIZADA', 'CANCELADA', 'RECUSADO'].includes(a.status));

    return { aguardando, propostas, andamento, historico, todos };
}

async function carregarAgendamentosPainel() {
    if (!empresaLogada) return;

    try {
        const [respColetora, respSolicitante] = await Promise.all([
            fetch(`http://localhost:8080/api/agendamentos/coletora/${empresaLogada.id}`),
            fetch(`http://localhost:8080/api/agendamentos/solicitante/${empresaLogada.id}`)
        ]);

        const coletora = respColetora.ok ? await respColetora.json() : [];
        const solicitante = respSolicitante.ok ? await respSolicitante.json() : [];
        const categorias = construirCategorias(coletora, solicitante);

        mapaAgendamentos = new Map(categorias.todos.map(a => [a.id, a]));

        renderListaAgendamentos('listaAguardando', categorias.aguardando);
        renderListaAgendamentos('listaPropostas', categorias.propostas);
        renderListaAgendamentos('listaAndamento', categorias.andamento);
        renderListaAgendamentos('listaHistorico', categorias.historico);
        atualizarContadores(categorias);
        atualizarLinkMensagens(categorias);

        if (agendamentoSelecionadoId && mapaAgendamentos.has(agendamentoSelecionadoId)) {
            selecionarAgendamentoPainel(agendamentoSelecionadoId);
        } else {
            agendamentoSelecionadoId = null;
            document.getElementById('detalhesAgendamento').innerHTML = '<p>Selecione um agendamento para ver os detalhes e ações.</p>';
            document.getElementById('acoesAgendamento').innerHTML = '';
        }
    } catch (error) {
        document.getElementById('listaAguardando').innerHTML = '<p class="vazio-lista">Erro ao carregar agendamentos.</p>';
        document.getElementById('listaPropostas').innerHTML = '<p class="vazio-lista">Erro ao carregar agendamentos.</p>';
        document.getElementById('listaAndamento').innerHTML = '<p class="vazio-lista">Erro ao carregar agendamentos.</p>';
        document.getElementById('listaHistorico').innerHTML = '<p class="vazio-lista">Erro ao carregar agendamentos.</p>';
    }
}

function selecionarAgendamentoPainel(id) {
    const agendamento = mapaAgendamentos.get(id);
    if (!agendamento) return;

    agendamentoSelecionadoId = id;
    marcarItemAtivo(id);

    const outra = contraparte(agendamento);
    const nomeOutra = (outra && (outra.nomeRazao || outra.nome)) || 'Não informado';
    const emailOutra = (outra && outra.email) || 'Não informado';
    const telefoneOutra = (outra && outra.telefone) || 'Não informado';
    const enderecoOutra = (outra && outra.endereco) || 'Não informado';
    const cnpjOutra = (outra && outra.cnpj) || 'Não informado';
    const tipoOutra = (outra && outra.tipo) || 'Não informado';

    document.getElementById('detalhesAgendamento').innerHTML = `
        <p><strong>Empresa:</strong> ${nomeOutra}</p>
        <p><strong>Email:</strong> ${emailOutra}</p>
        <p><strong>Telefone:</strong> ${telefoneOutra}</p>
        <p><strong>CNPJ:</strong> ${cnpjOutra}</p>
        <p><strong>Tipo:</strong> ${tipoOutra}</p>
        <p><strong>Endereço:</strong> ${enderecoOutra}</p>
        <p><strong>Data/Hora:</strong> ${formatarDataHora(agendamento.dataHora)}</p>
        <p><strong>Status:</strong> <span class="status-chip ${classeStatus(agendamento.status)}">${labelStatus(agendamento.status)}</span></p>
    `;

    renderAcoesAgendamento(agendamento);
}

function renderAcoesAgendamento(agendamento) {
    const acoes = [];
    const isColetora = agendamento.empresaColetora && agendamento.empresaColetora.id === empresaLogada.id;
    const isSolicitante = agendamento.empresaSolicitante && agendamento.empresaSolicitante.id === empresaLogada.id;

    if (agendamento.status === 'AGENDADA' && isColetora) {
        acoes.push('<button class="acao-primaria" onclick="atualizarStatusAgendamento(' + agendamento.id + ',\'confirmar\')">Aceitar proposta</button>');
        acoes.push('<button class="acao-perigo" onclick="atualizarStatusAgendamento(' + agendamento.id + ',\'recusar\')">Recusar proposta</button>');
    }

    if (agendamento.status === 'AGENDADA' && isSolicitante) {
        acoes.push('<button class="acao-perigo" onclick="atualizarStatusAgendamento(' + agendamento.id + ',\'cancelar\')">Cancelar proposta</button>');
    }

    if (agendamento.status === 'CONFIRMADA') {
        acoes.push('<button class="acao-primaria" onclick="abrirMensagens()">Abrir mensagens</button>');
        if (isColetora) {
            acoes.push('<button class="acao-secundaria" onclick="atualizarStatusAgendamento(' + agendamento.id + ',\'concluir\')">Concluir coleta</button>');
        }
    }

    if (!acoes.length) {
        acoes.push('<button class="acao-secundaria" onclick="abrirMensagens()">Abrir mensagens</button>');
    }

    document.getElementById('acoesAgendamento').innerHTML = acoes.join('');
}

function abrirMensagens() {
    window.location.href = 'mensagens.html';
}

async function atualizarStatusAgendamento(id, acao) {
    try {
        const response = await fetch(`http://localhost:8080/api/agendamentos/${id}/${acao}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const erro = await response.text();
            showPopup(erro || 'Não foi possível atualizar o agendamento.', { type: 'error' });
            return;
        }

        await carregarAgendamentosPainel();
        showPopup('Status do agendamento atualizado com sucesso.', { type: 'success' });
    } catch (error) {
        showPopup('Erro de conexão ao atualizar agendamento.', { type: 'error' });
    }
}

async function carregarPostagens() {
    const params = new URLSearchParams(window.location.search);
    const postagemId = params.get('id');

    if (!postagemId) {
        return;
    }

    try {
        const resp = await fetch(`http://localhost:8080/api/postagens/${postagemId}`);
        if (!resp.ok) {
            showPopup('Não foi possível carregar a postagem selecionada.', { type: 'error' });
            return;
        }
        const postagemDetalhada = await resp.json();
        selecionarPostagem(postagemDetalhada);
    } catch (error) {
        showPopup('Erro ao carregar os dados da postagem.', { type: 'error' });
    }
}

function selecionarPostagem(postagem) {
    postagemSelecionada = postagem;

    const selecionadoDiv = document.getElementById('postagemSelecionada');
    selecionadoDiv.innerHTML = `
        <div class="postagem-info">
            <h3>${postagem.titulo || 'Sem título'}</h3>
            <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não informado'}</p>
            <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'N/A'}</p>
            <p><strong>Local:</strong> ${postagem.enderecoRetirada || postagem.endereco || 'N/A'}</p>
        </div>
    `;
    selecionadoDiv.classList.add('ativo');

    document.querySelectorAll('.postagem-card').forEach(card => {
        card.classList.toggle('ativo', Number(card.getAttribute('data-id')) === Number(postagem.id));
    });

    preencherSeletoresDiaHora(postagem);
    document.getElementById('seletoresContainer').style.display = 'block';
}

function preencherSeletoresDiaHora(postagem) {
    const diaSelecionado = document.getElementById('diaSelecionado');
    const horarioSelecionado = document.getElementById('horarioSelecionado');

    diaSelecionado.innerHTML = '<option value="">-- Selecione um dia --</option>';
    horarioSelecionado.innerHTML = '<option value="">-- Selecione um horário --</option>';

    const dias = postagem.diasDisponibilidade ? postagem.diasDisponibilidade.split(',') : [];
    const nomesDias = {
        SEGUNDA: 'Segunda-feira',
        TERCA: 'Terça-feira',
        QUARTA: 'Quarta-feira',
        QUINTA: 'Quinta-feira',
        SEXTA: 'Sexta-feira',
        SABADO: 'Sábado',
        DOMINGO: 'Domingo'
    };

    dias.forEach(dia => {
        const option = document.createElement('option');
        option.value = dia;
        option.textContent = nomesDias[dia] || dia;
        diaSelecionado.appendChild(option);
    });

    diaSelecionado.onchange = function () {
        preencherHorarios(postagem);
    };

    if (dias.length > 0) {
        diaSelecionado.value = dias[0];
        preencherHorarios(postagem);
    }
}

async function preencherHorarios(postagem) {
    const diaSelecionado = document.getElementById('diaSelecionado').value;
    const horarioSelecionado = document.getElementById('horarioSelecionado');
    horarioSelecionado.innerHTML = '<option value="">-- Selecione um horário --</option>';

    if (!postagem.horaInicio || !postagem.horaFim) {
        horarioSelecionado.innerHTML += '<option value="">Sem horários definidos</option>';
        return;
    }

    let agendamentosExistentes = [];
    try {
        const response = await fetch(`http://localhost:8080/api/agendamentos/postagem/${postagem.id}`);
        if (response.ok) agendamentosExistentes = await response.json();
    } catch (error) {
        console.error(error);
    }

    const proximaData = getNextDateForDay(diaSelecionado, '00:00');
    if (!proximaData) return;

    const dataFormatada = proximaData.toISOString().slice(0, 10);
    const horariosOcupados = agendamentosExistentes
        .filter(ag => {
            const dataAgendamento = ag.dataAgendamento || (ag.dataHora ? ag.dataHora.split('T')[0] : null);
            return dataAgendamento === dataFormatada && ag.status !== 'CANCELADA';
        })
        .map(ag => ag.horaAgendamento || (ag.dataHora ? ag.dataHora.split('T')[1].substring(0, 5) : null))
        .filter(Boolean);

    const inicio = postagem.horaInicio.split(':');
    const fim = postagem.horaFim.split(':');

    let horaAtual = parseInt(inicio[0], 10);
    let minutoAtual = parseInt(inicio[1], 10);
    const horaFim = parseInt(fim[0], 10);
    const minutoFim = parseInt(fim[1], 10);

    while (horaAtual < horaFim || (horaAtual === horaFim && minutoAtual <= minutoFim)) {
        const horario = String(horaAtual).padStart(2, '0') + ':' + String(minutoAtual).padStart(2, '0');
        if (!horariosOcupados.includes(horario)) {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            horarioSelecionado.appendChild(option);
        }
        minutoAtual += 30;
        if (minutoAtual >= 60) {
            minutoAtual -= 60;
            horaAtual += 1;
        }
    }

    if (horarioSelecionado.options.length === 1) {
        horarioSelecionado.innerHTML = '<option value="">Nenhum horário disponível para este dia</option>';
    }
}

function confirmarAgendamento() {
    const diaSelecionado = document.getElementById('diaSelecionado').value;
    const horarioSelecionado = document.getElementById('horarioSelecionado').value;

    if (!diaSelecionado || !horarioSelecionado || !postagemSelecionada) {
        showPopup('Selecione um dia e horário', { type: 'info' });
        return;
    }

    const dataAgendamentoDate = getNextDateForDay(diaSelecionado, horarioSelecionado);
    if (!dataAgendamentoDate) {
        showPopup('Não foi possível calcular a data de agendamento', { type: 'error' });
        return;
    }

    const payload = {
        empresaSolicitanteId: empresaLogada.id,
        empresaColetoraId: postagemSelecionada.empresa ? postagemSelecionada.empresa.id : postagemSelecionada.empresaId,
        postagemId: postagemSelecionada.id,
        dataAgendamento: dataAgendamentoDate.toISOString().slice(0, 10),
        horaAgendamento: horarioSelecionado,
        observacoes: ''
    };

    fetch('http://localhost:8080/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(async res => {
            if (res.ok) return res.json();
            const text = await res.text();
            throw new Error(text && text.trim() ? text : `HTTP ${res.status}`);
        })
        .then(async () => {
            await carregarAgendamentosPainel();
            const nomeEmpresa = postagemSelecionada && postagemSelecionada.empresa
                ? (postagemSelecionada.empresa.nomeRazao || postagemSelecionada.empresa.nome || 'Empresa')
                : 'Empresa';
            showPopup(`Proposta enviada para empresa ${nomeEmpresa}, aguarde uma resposta e monitore em "Agendamento"`, { type: 'success' });
        })
        .catch(err => {
            showPopup(err.message || 'Erro ao criar agendamento', { type: 'error' });
        });
}

function getNextDateForDay(dia, horario) {
    const map = {
        SEGUNDA: 1,
        TERCA: 2,
        QUARTA: 3,
        QUINTA: 4,
        SEXTA: 5,
        SABADO: 6,
        DOMINGO: 0
    };
    const target = map[dia];
    if (target === undefined) return null;

    const now = new Date();
    const todayDay = now.getDay();
    let daysAhead = (target - todayDay + 7) % 7;

    if (daysAhead === 0 && horario) {
        const parts = horario.split(':');
        const check = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10));
        if (check <= now) daysAhead = 7;
    }

    const result = new Date(now);
    result.setDate(now.getDate() + daysAhead);
    return result;
}

function cancelarAgendamento() {
    postagemSelecionada = null;
    document.getElementById('postagemSelecionada').innerHTML = '<p style="text-align: center; color: #999;">Selecione uma postagem na tela de postagens para enviar proposta de agendamento</p>';
    document.getElementById('postagemSelecionada').classList.remove('ativo');
    document.getElementById('seletoresContainer').style.display = 'none';
}

function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown) dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener('DOMContentLoaded', async function () {
    const salvo = localStorage.getItem('empresaLogada');
    if (!salvo) {
        showPopup('Você precisa fazer login primeiro!', {
            type: 'info',
            buttons: [{ text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } }]
        });
        return;
    }

    empresaLogada = JSON.parse(salvo);
    await Promise.all([carregarPostagens(), carregarAgendamentosPainel()]);
});
