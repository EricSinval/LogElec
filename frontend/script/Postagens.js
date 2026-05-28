
console.log('Postagens.js carregado!');

let todasPostagens = [];
let debounceTimer = null; 

function postagemAprovadaParaVitrine(postagem) {
    const statusModeracao = (postagem && postagem.statusModeracao ? postagem.statusModeracao : 'APROVADA').toString().toUpperCase();
    return statusModeracao === 'APROVADA';
}

function truncarTexto(texto, limite = 140) {
    if (!texto) return '';
    if (texto.length <= limite) return texto;

    const corteSeguro = texto.slice(0, limite);
    const ultimoEspaco = corteSeguro.lastIndexOf(' ');
    const resumo = ultimoEspaco > 0 ? corteSeguro.slice(0, ultimoEspaco) : corteSeguro;

    return `${resumo.trim()}...`;
}

function formatarPeso(peso) {
    if (peso === null || peso === undefined || peso === '') return 'Não informado';

    const valor = Number(peso);
    if (Number.isNaN(valor)) return 'Não informado';

    return `${valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })} kg`;
}


function verificarLogin() {
    const empresaLogada = window.authApp && typeof window.authApp.obterSessaoLogada === 'function'
        ? window.authApp.obterSessaoLogada()
        : localStorage.getItem('empresaLogada');
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { 
            type: 'info', 
            buttons: [{ 
                text: 'Ir para login', 
                onClick: () => { window.location.href = 'login.html'; } 
            }] 
        });
        return null;
    }

    return typeof empresaLogada === 'string' ? JSON.parse(empresaLogada) : empresaLogada;
}


async function carregarPostagens() {
    console.log('Carregando postagens...');
    
    try {
        const response = await fetch('/api/postagens');
        
        if (response.ok) {
            todasPostagens = (await response.json()).filter(postagemAprovadaParaVitrine);
            console.log('Postagens carregadas:', todasPostagens);
            aplicarFiltro();
        } else {
            console.error('Erro ao carregar postagens');
            
            carregarPostagensMock();
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        
        carregarPostagensMock();
    }
}


function carregarPostagensMock() {
    console.log('Usando dados mock para desenvolvimento');
    todasPostagens = [
        {
            id: 1,
            titulo: 'Resíduos de Placas-Mãe - 150kg',
            descricao: 'Precisamos descartar 150kg de placas-mãe antigas de computadores.',
            tipoResiduo: 'Placas Eletrônicas',
            peso: 150.00,
            enderecoRetirada: 'Av. Paulista, 1000 - São Paulo/SP',
            status: 'ABERTA',
            empresa: {
                id: 1,
                nomeRazao: 'Tech Descarte Ltda',
                tipo: 'DESCARTE',
                email: 'descarte@tech.com'
            }
        },
        {
            id: 2,
            titulo: 'Coleta Express - Zona Sul SP',
            descricao: 'Serviço profissional de coleta de resíduos eletrônicos na Zona Sul.',
            tipoResiduo: 'Eletrônicos em Geral',
            peso: 500.00,
            enderecoRetirada: 'Atendemos toda Zona Sul de São Paulo',
            status: 'ABERTA',
            empresa: {
                id: 2,
                nomeRazao: 'Eco Coleta S.A.',
                tipo: 'COLETA',
                email: 'coleta@eco.com'
            }
        }
    ].filter(postagemAprovadaParaVitrine);
    aplicarFiltro();
}


function aplicarFiltro() {
    let postagensFiltradas = [...todasPostagens];
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    if (empresaLogada) {
        if (empresaLogada.tipo === 'DESCARTE') {
            
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'COLETA'
            );
        } else if (empresaLogada.tipo === 'COLETA') {
            
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'DESCARTE'
            );
        }
    }
    
    exibirPostagens(postagensFiltradas);
}


function exibirPostagens(postagens) {
    const container = document.getElementById('listaPostagens');
    
    if (!postagens || postagens.length === 0) {
        container.innerHTML = `
            <div class="sem-postagens">
                <p>Nenhuma postagem disponível no momento.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = postagens.map(postagem => {
        const empresa = postagem.empresa || {};
        const nomeEmpresa = empresa.nomeRazao || empresa.nome || 'Empresa';
        const tipoResiduo = postagem.tipoResiduo || 'Não especificado';
        const status = postagem.status || 'ABERTA';
        const descricao = postagem.descricao || 'Sem descrição disponível';
        const descricaoResumo = descricao;
        const pesoFormatado = formatarPeso(postagem.peso);
        
        
        const imagemPadrao = '../img/sem-imagem.png';
        const imagemPorTipo = obterImagemPorTipoResiduo(tipoResiduo);
        const imagem = (empresa.tipo === 'COLETA')
            ? (postagem.fotoEmpresa || imagemPorTipo || imagemPadrao)
            : (postagem.fotoResiduos || imagemPorTipo || imagemPadrao);
        
        return `
        <div class="card" data-id="${postagem.id}">
                <img src="${imagem}" alt="${tipoResiduo}" class="card-media">
            <div class="card-header">
                <h3>${nomeEmpresa}</h3>
            </div>
            <div class="card-content">
                <p><strong>Tipo de resíduos:</strong> ${tipoResiduo}</p>
                <p><strong>Peso:</strong> ${pesoFormatado}</p>
                <p class="descricao-resumo"><strong>Descrição:</strong> ${descricaoResumo}</p>
                <p class="status-linha"><strong>Status:</strong> <span class="status ${status.toLowerCase()}">${formatarStatus(status)}</span></p>
            </div>
            <div class="card-actions">
                <button onclick="verDetalhesPostagem(${postagem.id})" class="btn-detalhes">
                    Descrição
                </button>
                <button onclick="redirecionarAgendamento(${postagem.id})" class="btn-agendar">
                    Enviar proposta de agendamento
                </button>
            </div>
        </div>
        `;
    }).join('');
}


function redirecionarAgendamento(postagemId) {
    abrirPopupAgendamento(postagemId);
}


function obterImagemPorTipoResiduo(tipoResiduo) {
    const tipo = tipoResiduo.toLowerCase();
    if (tipo.includes('placa') || tipo.includes('eletrônic')) {
        return '../img/Placa mãe.jpg';
    } else if (tipo.includes('monitor') || tipo.includes('lcd')) {
        return '../img/E-waste.png';
    } else if (tipo.includes('bateria') || tipo.includes('pilha')) {
        return '../img/Electronic.png';
    } else if (tipo.includes('cabo') || tipo.includes('fio')) {
        return '../img/E-recyclers.png';
    } else {
        return '../img/Placa mãe.jpg'; 
    }
}


function formatarStatus(status) {
    const statusMap = {
        'ABERTA': 'Aberta',
        'PAUSADA': 'Pausada',
        'ENCERRADA': 'Encerrada',
        'CANCELADA': 'Cancelada',
        'FINALIZADA': 'Encerrada'
    };
    return statusMap[status] || status;
}


function solicitarAgendamento(postagemId) {
    console.log('Solicitar agendamento para postagem:', postagemId);
    const empresaLogada = verificarLogin();
    if (!empresaLogada) return;

    const postagem = todasPostagens.find(p => p.id === postagemId);
    if (!postagem) return;

    showPopup(`Deseja solicitar agendamento com ${postagem.empresa.nomeRazao}?`, { 
        type: 'confirm',
        buttons: [
            { 
                text: 'Cancelar', 
                onClick: () => console.log('Agendamento cancelado') 
            },
            { 
                text: 'Confirmar', 
                onClick: () => confirmarAgendamento(postagemId, empresaLogada.id) 
            }
        ]
    });
}

function confirmarAgendamento(postagemId, empresaId) {
    console.log('Confirmando agendamento:', { postagemId, empresaId });

    const postagem = todasPostagens.find(p => p.id === postagemId);
    const nomeEmpresa = postagem && postagem.empresa
        ? (postagem.empresa.nomeRazao || postagem.empresa.nome || 'Empresa')
        : 'Empresa';

    showPopup(`Proposta enviada para empresa ${nomeEmpresa}, aguarde uma resposta e monitore em "Agendamento"`, { 
        type: 'success',
        buttons: [
            {
                text: 'OK',
                onClick: () => console.log('Agendamento confirmado')
            }
        ]
    });
}


function verDetalhesPostagem(id) {
    const postagem = todasPostagens.find(p => p.id === id);
    if (!postagem) {
        showPopup('Postagem não encontrada.', { type: 'error' });
        return;
    }

    const empresa = postagem.empresa || {};
    const nomeEmpresa = empresa.nomeRazao || empresa.nome || 'Não informado';
    const tipoEmpresa = empresa.tipo === 'DESCARTE'
        ? 'Empresa que Descarta'
        : empresa.tipo === 'COLETA'
            ? 'Empresa Coletora'
            : 'Não informado';

    showPopup(`
        <div class="detalhes-postagem">
            <h3>${postagem.titulo || 'Sem título'}</h3>
            <div class="detalhes-card">
                <div class="detalhes-row"><span class="detalhes-label">Empresa</span><span>${nomeEmpresa}</span></div>
                <div class="detalhes-row"><span class="detalhes-label">Tipo de empresa</span><span>${tipoEmpresa}</span></div>
                <div class="detalhes-row"><span class="detalhes-label">Email</span><span>${empresa.email || 'Não informado'}</span></div>
                <div class="detalhes-divider"></div>
                <div class="detalhes-row"><span class="detalhes-label">Tipo de resíduo</span><span>${postagem.tipoResiduo || 'Não especificado'}</span></div>
                <div class="detalhes-row"><span class="detalhes-label">Peso</span><span>${postagem.peso ? postagem.peso + ' kg' : 'Não informado'}</span></div>
                <div class="detalhes-row"><span class="detalhes-label">Endereço de retirada</span><span>${postagem.enderecoRetirada || 'Não informado'}</span></div>
                <div class="detalhes-divider"></div>
                <div class="detalhes-row"><span class="detalhes-label">Status</span><span class="status ${postagem.status ? postagem.status.toLowerCase() : 'aberta'}">${formatarStatus(postagem.status)}</span></div>
                <div class="detalhes-row detalhes-descricao"><span class="detalhes-label">Descrição</span><span>${postagem.descricao || 'Sem descrição disponível'}</span></div>
            </div>
        </div>
    `, {
        type: 'info',
        buttons: [
            {
                text: 'Voltar',
                className: 'ui-btn-detalhes',
                onClick: () => {}
            },
            {
                text: 'Enviar proposta de agendamento',
                className: 'ui-btn-primary',
                onClick: () => abrirPopupAgendamento(id)
            }
        ]
    });
}


function atualizarInterface() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const nomeUsuarioElement = document.getElementById('nomeUsuario');
    const titulo = document.getElementById('tituloPostagens');
    const subtitulo = document.getElementById('subtituloPostagens');
    
    if (empresaLogada && nomeUsuarioElement) {
        nomeUsuarioElement.textContent = empresaLogada.nomeRazao || 'Usuário';
        
        
        if (titulo && subtitulo) {
            if (empresaLogada.tipo === 'DESCARTE') {
                titulo.textContent = 'Empresas de Coleta Disponíveis';
                subtitulo.textContent = 'Encontre empresas para coletar seus resíduos eletrônicos';
            } else {
                titulo.textContent = 'Resíduos para Coleta';
                subtitulo.textContent = 'Encontre empresas com resíduos eletrônicos para coletar';
            }
        }
    }
}


function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página de postagens inicializada');

    if (window.authApp && typeof window.authApp.carregarSessao === 'function') {
        try {
            await window.authApp.carregarSessao();
        } catch (error) {
            console.warn('Não foi possível sincronizar a sessão na página de postagens:', error);
        }
    }
    
    const empresaLogada = verificarLogin();
    if (empresaLogada) {
        console.log('Usuário logado:', empresaLogada.nomeRazao);
        atualizarInterface();
        carregarPostagens();
        
        
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                
                
                debounceTimer = setTimeout(() => {
                    filtrarPorBusca(e.target.value);
                }, 300);
            });
        }
    }
});


function filtrarPorBusca(termo) {
    if (!termo.trim()) {
        aplicarFiltro();
        return;
    }
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    
    const termos = termo.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    
    function calcularScore(postagem, termos) {
        let score = 0;
        const empresa = postagem.empresa || {};
        
        
        const titulo = (postagem.titulo || '').toLowerCase();
        const tipoResiduo = (postagem.tipoResiduo || '').toLowerCase();
        const nomeEmpresa = (empresa.nomeRazao || empresa.nome || '').toLowerCase();
        const descricao = (postagem.descricao || '').toLowerCase();
        const endereco = (postagem.enderecoRetirada || '').toLowerCase();
        
        
        termos.forEach(termo => {
            
            if (titulo.includes(termo)) score += 4;
            if (titulo.startsWith(termo)) score += 2; 
            if (titulo === termo) score += 4; 
            
            
            if (tipoResiduo.includes(termo)) score += 3;
            if (tipoResiduo.startsWith(termo)) score += 1;
            
            
            if (nomeEmpresa.includes(termo)) score += 3;
            if (nomeEmpresa.startsWith(termo)) score += 1;
            
            
            if (descricao.includes(termo)) score += 2;
            
            
            if (endereco.includes(termo)) score += 1;
        });
        
        return score;
    }
    
    
    let postagensFiltradas = todasPostagens
        .map(postagem => ({
            postagem,
            score: calcularScore(postagem, termos)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.postagem);
    
    
    if (empresaLogada) {
        if (empresaLogada.tipo === 'DESCARTE') {
            postagensFiltradas = postagensFiltradas.filter(p => p.empresa && p.empresa.tipo === 'COLETA');
        } else if (empresaLogada.tipo === 'COLETA') {
            postagensFiltradas = postagensFiltradas.filter(p => p.empresa && p.empresa.tipo === 'DESCARTE');
        }
    }
    
    exibirPostagens(postagensFiltradas);
}


async function buscarPeloBackend(termo) {
    try {
        const response = await fetch(`/api/postagens/search?q=${encodeURIComponent(termo)}`);
        
        if (response.ok) {
            let resultados = await response.json();
            
            
            const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
            if (empresaLogada) {
                if (empresaLogada.tipo === 'DESCARTE') {
                    resultados = resultados.filter(p => p.empresa && p.empresa.tipo === 'COLETA');
                } else if (empresaLogada.tipo === 'COLETA') {
                    resultados = resultados.filter(p => p.empresa && p.empresa.tipo === 'DESCARTE');
                }
            }
            
            exibirPostagens(resultados);
        } else {
            console.warn('Erro na busca pelo backend, usando busca local');
            filtrarPorBusca(termo);
        }
    } catch (error) {
        console.warn('Erro ao buscar no backend, usando busca local:', error);
        filtrarPorBusca(termo);
    }
}





let postagemAgendamento = null;


async function abrirPopupAgendamento(postagemId) {
    
    try {
        const response = await fetch(`/api/postagens/${postagemId}`);
        if (!response.ok) throw new Error('Erro ao carregar postagem');
        
        const postagem = await response.json();
        postagemAgendamento = postagem;
        
        
        const infoDiv = document.getElementById('postagemAgendamentoInfo');
        const empresa = postagem.empresa || {};
        
        infoDiv.innerHTML = `
            <h3>${postagem.titulo}</h3>
            <p><strong>Empresa:</strong> ${empresa.nomeRazao || 'Não informado'}</p>
            <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
            <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'N/A'}</p>
            <p><strong>Local:</strong> ${postagem.enderecoRetirada || 'Não informado'}</p>
        `;
        
        
        await preencherSeletoresDiaHoraPopup(postagem);
        
        
        document.getElementById('popupAgendamento').classList.remove('hidden');
        document.getElementById('seletoresAgendamento').style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao abrir popup de agendamento:', error);
        showPopup('❌ Erro ao carregar informações de agendamento', { type: 'error' });
    }
}


function fecharPopupAgendamento() {
    document.getElementById('popupAgendamento').classList.add('hidden');
    postagemAgendamento = null;
}


async function preencherSeletoresDiaHoraPopup(postagem) {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    
    
    diaSelect.innerHTML = '<option value="">-- Selecione um dia --</option>';
    horarioSelect.innerHTML = '<option value="">-- Selecione um horário --</option>';
    
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
    
    
    dias.forEach(dia => {
        const option = document.createElement('option');
        option.value = dia;
        option.textContent = nomesDias[dia] || dia;
        diaSelect.appendChild(option);
    });
    
    
    diaSelect.addEventListener('change', function() {
        preencherHorariosPopup(postagem);
    });
    
    
    if (dias.length > 0) {
        diaSelect.value = dias[0];
        await preencherHorariosPopup(postagem);
    }
}


async function preencherHorariosPopup(postagem) {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    const diaSelecionado = diaSelect.value;
    
    horarioSelect.innerHTML = '<option value="">-- Selecione um horário --</option>';
    
    if (!postagem.horaInicio || !postagem.horaFim) {
        horarioSelect.innerHTML += '<option value="">Sem horários definidos</option>';
        return;
    }
    
    
    let agendamentosExistentes = [];
    try {
        const response = await fetch(`/api/agendamentos/postagem/${postagem.id}/horarios-ocupados`);
        if (response.ok) {
            agendamentosExistentes = await response.json();
        }
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
    }
    
    
    const proximaData = getNextDateForDayPopup(diaSelecionado, '00:00');
    if (!proximaData) return;
    
    const dataFormatada = proximaData.toISOString().slice(0, 10);
    
    
    const horariosOcupados = agendamentosExistentes
        .filter(ag => {
            const dataAgendamento = ag.dataAgendamento || (ag.dataHora ? ag.dataHora.split('T')[0] : null);
            const statusNaoCancelado = ag.status !== 'CANCELADA';
            return dataAgendamento === dataFormatada && statusNaoCancelado;
        })
        .map(ag => ag.horaAgendamento || (ag.dataHora ? ag.dataHora.split('T')[1].substring(0, 5) : null))
        .filter(hora => hora !== null);
    
    
    const inicio = postagem.horaInicio.split(':');
    const fim = postagem.horaFim.split(':');
    
    let horaAtual = parseInt(inicio[0]);
    let minutoAtual = parseInt(inicio[1]);
    const horaFim = parseInt(fim[0]);
    const minutoFim = parseInt(fim[1]);
    
    while (horaAtual < horaFim || (horaAtual === horaFim && minutoAtual <= minutoFim)) {
        const horario = String(horaAtual).padStart(2, '0') + ':' + String(minutoAtual).padStart(2, '0');
        
        if (!horariosOcupados.includes(horario)) {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            horarioSelect.appendChild(option);
        }
        
        minutoAtual += 30;
        if (minutoAtual >= 60) {
            minutoAtual -= 60;
            horaAtual++;
        }
    }
    
    if (horarioSelect.options.length === 1) {
        horarioSelect.innerHTML = '<option value="">Nenhum horário disponível para este dia</option>';
    }
}

function exibirAvisoAgendamentoERetomar(mensagem) {
    if (!postagemAgendamento || !postagemAgendamento.id) {
        showPopup(mensagem, { type: 'info' });
        return;
    }

    const postagemId = postagemAgendamento.id;
    fecharPopupAgendamento();
    showPopup(mensagem, {
        type: 'info',
        onClose: () => abrirPopupAgendamento(postagemId)
    });
}


async function confirmarAgendamentoPopup() {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    const diaSelecionado = diaSelect.value;
    const horarioSelecionado = horarioSelect.value;
    
    if (!postagemAgendamento) {
        showPopup('⚠️ Não foi possível identificar a postagem para o agendamento', { type: 'error' });
        return;
    }

    if (!diaSelecionado) {
        exibirAvisoAgendamentoERetomar('⚠️ Selecione um dia antes de enviar uma proposta de agendamento');
        return;
    }

    if (!horarioSelecionado) {
        exibirAvisoAgendamentoERetomar('⚠️ Selecione um horário antes de enviar uma proposta de agendamento');
        return;
    }
    
    const dataAgendamentoDate = getNextDateForDayPopup(diaSelecionado, horarioSelecionado);
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
        postagemId: postagemAgendamento.id,
        dataAgendamento: dataAgendamentoDate.toISOString().slice(0,10),
        horaAgendamento: horarioSelecionado,
        observacoes: ''
    };
    
    try {
        const response = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Agendamento criado:', data);
            const empresa = postagemAgendamento.empresa || {};
            const nomeEmpresa = empresa.nomeRazao || empresa.nome || 'não informada';
            fecharPopupAgendamento();

            showPopup(`Proposta enviada para a empresa ${nomeEmpresa}, aguarde confirmação de agendamento na tela de agendamentos`, {
                type: 'success'
            });
        } else {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        const mensagem = error && error.message ? error.message : 'Erro ao criar agendamento';
        showPopup(`❌ ${mensagem}`, { type: 'error' });
    }
}


function getNextDateForDayPopup(dia, horario) {
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
    
    if (daysAhead === 0 && horario) {
        const parts = horario.split(':');
        const check = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]));
        if (check <= now) daysAhead = 7;
    }
    
    const result = new Date(now);
    result.setDate(now.getDate() + daysAhead);
    return result;
}