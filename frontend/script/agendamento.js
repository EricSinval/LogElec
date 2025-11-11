// agendamento.js - Gerenciamento da página de agendamentos
console.log('📅 Agendamento.js carregado!');

let postagemSelecionada = null;
let todasPostagens = [];

// Função para sair
function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'login.html';
}

// Carregar postagens da query string ou do URL
function carregarPostagemDoURL() {
    const params = new URLSearchParams(window.location.search);
    const postagemId = params.get('id');
    
    if (postagemId) {
        console.log('📍 Postagem ID da URL:', postagemId);
        // Será carregada após obter as postagens
    }
}

// Carregar postagens ativas da empresa logada
async function carregarPostagens() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { 
            type: 'info', 
            buttons: [{ 
                text: 'Ir para login', 
                onClick: () => { window.location.href = 'login.html'; } 
            }] 
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/postagens');
        if (response.ok) {
            const postagens = await response.json();
            // Carregar todas as postagens (será filtrado na UI quando necessário)
            todasPostagens = postagens;
            console.log('✅ Postagens carregadas:', todasPostagens);
            exibirPostagensNaSidebar();

            // Se veio de um clique em "Verificar disponibilidade", carregar postagem específica
            const params = new URLSearchParams(window.location.search);
            const postagemId = params.get('id');
            if (postagemId) {
                // Buscar postagem detalhada no backend (garante que temos empresa.id)
                const resp = await fetch(`http://localhost:8080/api/postagens/${postagemId}`);
                if (resp.ok) {
                    const postagemDetalhada = await resp.json();
                    selecionarPostagem(postagemDetalhada);
                }
            }
        }
    } catch (error) {
        console.error('💥 Erro ao carregar postagens:', error);
        showPopup('❌ Erro ao carregar postagens', { type: 'error' });
    }
}

// Exibir postagens na sidebar (lateral esquerda - label "Clientes")
function exibirPostagensNaSidebar() {
    const container = document.getElementById('listaPostagens');
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    if (!todasPostagens || todasPostagens.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma postagem ativa</p>';
        return;
    }
    
    // Filtrar postagens para exibir apenas as do tipo oposto
    let postagensFiltradas = todasPostagens;
    if (empresaLogada) {
        if (empresaLogada.tipo === 'DESCARTE') {
            // Empresas de DESCARTE veem apenas postagens de COLETA
            postagensFiltradas = todasPostagens.filter(p => p.empresa && p.empresa.tipo === 'COLETA');
        } else if (empresaLogada.tipo === 'COLETA') {
            // Empresas de COLETA veem apenas postagens de DESCARTE
            postagensFiltradas = todasPostagens.filter(p => p.empresa && p.empresa.tipo === 'DESCARTE');
        }
    }
    
    if (postagensFiltradas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma postagem disponível para agendamento</p>';
        return;
    }
    
    container.innerHTML = postagensFiltradas.map(postagem => `
        <div class="postagem-card" onclick="selecionarPostagemById(${postagem.id})">
            <h4>${postagem.titulo}</h4>
            <p><strong>Tipo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
            <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'N/A'}</p>
            <p><strong>Local:</strong> ${postagem.enderecoRetirada ? postagem.enderecoRetirada.substring(0, 30) + '...' : 'N/A'}</p>
        </div>
    `).join('');
}

// Seleciona postagem a partir do ID (utilizado pela sidebar)
function selecionarPostagemById(id) {
    // Sempre buscar detalhes da postagem no backend para garantir que
    // os campos de disponibilidade e a relação com empresa estejam presentes
    fetch(`http://localhost:8080/api/postagens/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar postagem');
            return res.json();
        })
        .then(postagemDetalhada => {
            selecionarPostagem(postagemDetalhada);
        })
        .catch(err => {
            console.error('Erro ao buscar postagem detalhada:', err);
            showPopup('❌ Não foi possível carregar a postagem selecionada', { type: 'error' });
        });
}

// Selecionar uma postagem e exibir seus horários
function selecionarPostagem(postagem) {
    postagemSelecionada = postagem;

    // Atualizar card de seleção
    const selecionadoDiv = document.getElementById('postagemSelecionada');
    selecionadoDiv.innerHTML = `
        <div class="postagem-info">
            <h3>${postagem.titulo}</h3>
            <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo}</p>
            <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'N/A'}</p>
            <p><strong>Local:</strong> ${postagem.enderecoRetirada || postagem.endereco || 'N/A'}</p>
        </div>
    `;
    selecionadoDiv.classList.add('ativo');

    // Marcar card como ativo na sidebar (procura pelo índice correspondente)
    document.querySelectorAll('.postagem-card').forEach(card => card.classList.remove('ativo'));

    // Preencher seletores de dia e horário
    preencherSeletoresDiaHora(postagem);

    // Mostrar container de seletores
    document.getElementById('seletoresContainer').style.display = 'block';
}

// Preencher seletores de dia e horário baseado na disponibilidade
function preencherSeletoresDiaHora(postagem) {
    const diaSelecionado = document.getElementById('diaSelecionado');
    const horarioSelecionado = document.getElementById('horarioSelecionado');
    
    // Limpar opções anteriores
    diaSelecionado.innerHTML = '<option value="">-- Selecione um dia --</option>';
    horarioSelecionado.innerHTML = '<option value="">-- Selecione um horário --</option>';
    
    const dias = postagem.diasDisponibilidade ? postagem.diasDisponibilidade.split(',') : [];
    const nomesDias = {
        'SEGUNDA': 'Segunda-feira',
        'TERCA': 'Terça-feira',
        'QUARTA': 'Quarta-feira',
        'QUINTA': 'Quinta-feira',
        'SEXTA': 'Sexta-feira',
        'SABADO': 'Sábado',
        'DOMINGO': 'Domingo'
    };
    
    // Preencher dias
    dias.forEach(dia => {
        const option = document.createElement('option');
        option.value = dia;
        option.textContent = nomesDias[dia] || dia;
        diaSelecionado.appendChild(option);
    });
    
    // Adicionar listener para atualizar horários quando dia mudar
    diaSelecionado.addEventListener('change', function() {
        preencherHorarios(postagem);
    });
    
    // Preencher horários iniciais se houver dias disponíveis
    if (dias.length > 0) {
        diaSelecionado.value = dias[0];
        preencherHorarios(postagem);
    }
}

// Preencher horários disponíveis
async function preencherHorarios(postagem) {
    const diaSelecionado = document.getElementById('diaSelecionado').value;
    const horarioSelecionado = document.getElementById('horarioSelecionado');
    horarioSelecionado.innerHTML = '<option value="">-- Selecione um horário --</option>';
    
    if (!postagem.horaInicio || !postagem.horaFim) {
        horarioSelecionado.innerHTML += '<option value="">Sem horários definidos</option>';
        return;
    }
    
    // Buscar agendamentos existentes para esta postagem
    let agendamentosExistentes = [];
    try {
        const response = await fetch(`http://localhost:8080/api/agendamentos/postagem/${postagem.id}`);
        if (response.ok) {
            agendamentosExistentes = await response.json();
            console.log('[DEBUG] Agendamentos existentes para postagem:', agendamentosExistentes);
        }
    } catch (error) {
        console.error('Erro ao buscar agendamentos existentes:', error);
    }
    
    // Converter dia selecionado para próxima data correspondente
    const proximaData = getNextDateForDay(diaSelecionado, '00:00');
    if (!proximaData) return;
    
    const dataFormatada = proximaData.toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Filtrar agendamentos que coincidem com o dia selecionado e que não estão cancelados
    const horariosOcupados = agendamentosExistentes
        .filter(ag => {
            const dataAgendamento = ag.dataAgendamento || (ag.dataHora ? ag.dataHora.split('T')[0] : null);
            const statusNaoCancelado = ag.status !== 'CANCELADA';
            return dataAgendamento === dataFormatada && statusNaoCancelado;
        })
        .map(ag => ag.horaAgendamento || (ag.dataHora ? ag.dataHora.split('T')[1].substring(0, 5) : null))
        .filter(hora => hora !== null);
    
    console.log('[DEBUG] Horários ocupados para', dataFormatada, ':', horariosOcupados);
    
    // Gerar horários a cada 30 minutos
    const inicio = postagem.horaInicio.split(':');
    const fim = postagem.horaFim.split(':');
    
    let horaAtual = parseInt(inicio[0]);
    let minutoAtual = parseInt(inicio[1]);
    const horaFim = parseInt(fim[0]);
    const minutoFim = parseInt(fim[1]);
    
    while (horaAtual < horaFim || (horaAtual === horaFim && minutoAtual <= minutoFim)) {
        const horario = String(horaAtual).padStart(2, '0') + ':' + String(minutoAtual).padStart(2, '0');
        
        // Só adicionar o horário se NÃO estiver ocupado
        if (!horariosOcupados.includes(horario)) {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            horarioSelecionado.appendChild(option);
        }
        
        minutoAtual += 30;
        if (minutoAtual >= 60) {
            minutoAtual -= 60;
            horaAtual++;
        }
    }
    
    // Se não houver horários disponíveis, mostrar mensagem
    if (horarioSelecionado.options.length === 1) {
        horarioSelecionado.innerHTML = '<option value="">Nenhum horário disponível para este dia</option>';
    }
}

// Confirmar agendamento
function confirmarAgendamento() {
    const diaSelecionado = document.getElementById('diaSelecionado').value;
    const horarioSelecionado = document.getElementById('horarioSelecionado').value;
    
    if (!diaSelecionado || !horarioSelecionado || !postagemSelecionada) {
        showPopup('⚠️ Selecione um dia e horário', { type: 'info' });
        return;
    }

    // Converter dia da semana selecionado em uma data próxima (YYYY-MM-DD)
    const dataAgendamentoDate = getNextDateForDay(diaSelecionado, horarioSelecionado);
    if (!dataAgendamentoDate) {
        showPopup('⚠️ Não foi possível calcular a data de agendamento', { type: 'error' });
        return;
    }

    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { type: 'info' });
        return;
    }

    const payload = {
        empresaSolicitanteId: empresaLogada.id,
        empresaColetoraId: postagemSelecionada.empresa ? postagemSelecionada.empresa.id : postagemSelecionada.empresaId,
        postagemId: postagemSelecionada.id,
        dataAgendamento: dataAgendamentoDate.toISOString().slice(0,10), // YYYY-MM-DD
        horaAgendamento: horarioSelecionado,
        observacoes: ''
    };

    // Enviar para API
    fetch('http://localhost:8080/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        // Se o servidor respondeu OK, parseamos JSON
        if (res.ok) {
            // tentar parsear JSON (resposta de sucesso deve ser JSON)
            return res.json();
        }

        // Em caso de erro (ex: 400) o backend retorna uma mensagem textual.
        // Lemos o body como texto e lançamos um Error com essa mensagem para o catch.
        const text = await res.text();
        // Se o body estiver vazio, usar mensagem padrão
        throw new Error(text && text.trim() ? text : `HTTP ${res.status}`);
    })
    .then(data => {
        console.log('Agendamento criado:', data);
        showPopup(`✅ Agendamento confirmado para ${diaSelecionado} às ${horarioSelecionado}!`, { 
            type: 'success',
            buttons: [
                {
                    text: 'Ver postagens',
                    onClick: () => { window.location.href = 'postagens.html'; }
                }
            ]
        });
    })
    .catch(err => {
        // Mostrar mensagem detalhada retornada pelo backend (se houver)
        console.error('Erro ao criar agendamento:', err);
        const mensagem = err && err.message ? err.message : 'Erro ao criar agendamento';
        showPopup(`❌ ${mensagem}`, { type: 'error' });
    });
}

// Calcula a próxima data (ou hoje) que corresponde ao dia da semana informado
function getNextDateForDay(dia, horario) {
    const map = {
        'SEGUNDA': 1,
        'TERCA': 2,
        'QUARTA': 3,
        'QUINTA': 4,
        'SEXTA': 5,
        'SABADO': 6,
        'DOMINGO': 0
    };
    const target = map[dia];
    if (target === undefined) return null;

    const now = new Date();
    const todayDay = now.getDay();
    let daysAhead = (target - todayDay + 7) % 7;

    // Se for hoje, verificar se o horário já passou
    if (daysAhead === 0 && horario) {
        const parts = horario.split(':');
        const check = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]));
        if (check <= now) daysAhead = 7; // escolher próximo
    }

    const result = new Date(now);
    result.setDate(now.getDate() + daysAhead);
    return result;
}

// Cancelar agendamento
function cancelarAgendamento() {
    postagemSelecionada = null;
    document.getElementById('postagemSelecionada').innerHTML = '<p style="text-align: center; color: #999;">Clique em uma postagem para verificar disponibilidade</p>';
    document.getElementById('postagemSelecionada').classList.remove('ativo');
    document.getElementById('seletoresContainer').style.display = 'none';
    document.querySelectorAll('.postagem-card').forEach(card => {
        card.classList.remove('ativo');
    });
}

// Função toggle do menu
function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 Página de agendamento inicializada');
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { 
            type: 'info', 
            buttons: [{ 
                text: 'Ir para login', 
                onClick: () => { window.location.href = 'login.html'; } 
            }] 
        });
        return;
    }
    
    carregarPostagens();
});