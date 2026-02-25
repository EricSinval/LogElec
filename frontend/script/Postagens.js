// Postagens.js - Gerenciamento da página de postagens
console.log('Postagens.js carregado!');

let todasPostagens = [];
let debounceTimer = null; // Para debounce da busca

function truncarTexto(texto, limite = 140) {
    if (!texto) return '';
    if (texto.length <= limite) return texto;

    const corteSeguro = texto.slice(0, limite);
    const ultimoEspaco = corteSeguro.lastIndexOf(' ');
    const resumo = ultimoEspaco > 0 ? corteSeguro.slice(0, ultimoEspaco) : corteSeguro;

    return `${resumo.trim()}...`;
}

// Verificar se usuário está logado
function verificarLogin() {
    const empresaLogada = localStorage.getItem('empresaLogada');
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
    return JSON.parse(empresaLogada);
}

// Carregar postagens do backend
async function carregarPostagens() {
    console.log('Carregando postagens...');
    
    try {
        const response = await fetch('http://localhost:8080/api/postagens');
        
        if (response.ok) {
            todasPostagens = await response.json();
            console.log('Postagens carregadas:', todasPostagens);
            aplicarFiltro();
        } else {
            console.error('Erro ao carregar postagens');
            // Fallback para dados mock se a API não estiver disponível
            carregarPostagensMock();
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        // Fallback para dados mock
        carregarPostagensMock();
    }
}

// Fallback com dados mock (para desenvolvimento)
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
    ];
    aplicarFiltro();
}

// Aplicar filtro automático baseado no tipo da empresa logada
function aplicarFiltro() {
    let postagensFiltradas = [...todasPostagens];
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    if (empresaLogada) {
        if (empresaLogada.tipo === 'DESCARTE') {
            // Empresas de DESCARTE veem postagens de COLETA
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'COLETA'
            );
        } else if (empresaLogada.tipo === 'COLETA') {
            // Empresas de COLETA veem postagens de DESCARTE
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'DESCARTE'
            );
        }
    }
    
    exibirPostagens(postagensFiltradas);
}

// Exibir postagens na página
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
        const endereco = postagem.enderecoRetirada || 'Não informado';
        const status = postagem.status || 'ABERTA';
        const descricao = postagem.descricao || 'Sem descrição disponível';
        const enderecoResumo = truncarTexto(endereco, 90);
        const descricaoResumo = truncarTexto(descricao, 140);
        
        // Definir imagem correta conforme o tipo da empresa da postagem
        const imagemPadrao = '../img/sem-imagem.png'; // Placeholder online
        const imagemPorTipo = obterImagemPorTipoResiduo(tipoResiduo);
        const imagem = (empresa.tipo === 'COLETA')
            ? (postagem.fotoEmpresa || imagemPadrao) // Coleta: usa fotoEmpresa ou placeholder genérico
            : (postagem.fotoResiduos || imagemPadrao);   // Descarte: usa fotoResiduos ou placeholder genérico
        
        return `
        <div class="card" data-id="${postagem.id}">
                <img src="${imagem}" alt="${tipoResiduo}" style="object-fit: cover; width: 100%; height: 250px;">
            <div class="card-header">
                <h3 style="text-align:left; flex:1;">${nomeEmpresa}</h3>
                <span class="tipo-empresa ${empresa.tipo === 'DESCARTE' ? 'descarte' : 'coleta'}" style="margin-left:auto;">${empresa.tipo === 'DESCARTE' ? 'Descarte' : 'Coleta'}</span>
            </div>
            <div class="card-content">
                <p class="status-linha"><strong>Status:</strong> <span class="status ${status.toLowerCase()}">${formatarStatus(status)}</span></p>
                <p class="localizacao-resumo" title="${endereco.replace(/"/g, '&quot;')}"><strong>Localização:</strong> ${enderecoResumo}</p>
                <p class="descricao-resumo" title="${descricao.replace(/"/g, '&quot;')}"><strong>Descrição:</strong> ${descricaoResumo}</p>
            </div>
            <div class="card-actions">
                <button onclick="verDetalhesPostagem(${postagem.id})" class="btn-detalhes">
                    Ver Detalhes
                </button>
                <button onclick="redirecionarAgendamento(${postagem.id})" class="btn-agendar">
                    Verificar disponibilidade
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Redirecionar para agendamento - AGORA ABRE POPUP
function redirecionarAgendamento(postagemId) {
    abrirPopupAgendamento(postagemId);
}

// Função auxiliar para obter imagem baseada no tipo de resíduo
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
        return '../img/Placa mãe.jpg'; // imagem padrão
    }
}

// Formatar status para exibição
function formatarStatus(status) {
    const statusMap = {
        'ABERTA': 'Aberta',
        'CANCELADA': 'Cancelada', 
        'FINALIZADA': 'Finalizada'
    };
    return statusMap[status] || status;
}

// Solicitar agendamento
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
    
    // Aqui você implementaria a chamada para a API de agendamentos
    // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
    showPopup('Solicitação de agendamento enviada com sucesso! A empresa será notificada.', { 
        type: 'success',
        buttons: [
            {
                text: 'OK',
                onClick: () => console.log('Agendamento confirmado')
            }
        ]
    });
}

// Ver detalhes da postagem
function verDetalhesPostagem(id) {
    const postagem = todasPostagens.find(p => p.id === id);
    if (!postagem) {
        showPopup('Postagem não encontrada.', { type: 'error' });
        return;
    }

    const empresa = postagem.empresa || {};
    
    showPopup(`
        <div class="detalhes-postagem">
            <h3>${postagem.titulo || 'Sem título'}</h3>
            <div class="detalhes-section">
                <h4>Informações da Empresa</h4>
                <p><strong>Empresa:</strong> ${empresa.nomeRazao || 'Não informado'}</p>
                <p><strong>Tipo:</strong> ${empresa.tipo === 'DESCARTE' ? 'Empresa que Descarta' : 'Empresa Coletora'}</p>
                <p><strong>Email:</strong> ${empresa.email || 'Não informado'}</p>
            </div>
            <div class="detalhes-section">
                <h4>Informações do Resíduo</h4>
                <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
                <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'Não informado'}</p>
                <p><strong>Endereço para Retirada:</strong> ${postagem.enderecoRetirada || 'Não informado'}</p>
            </div>
            <div class="detalhes-section">
                <h4>Descrição</h4>
                <p>${postagem.descricao || 'Sem descrição disponível'}</p>
            </div>
            <div class="detalhes-section">
                <p><strong>Status:</strong> <span class="status ${postagem.status ? postagem.status.toLowerCase() : 'aberta'}">${formatarStatus(postagem.status)}</span></p>
            </div>
        </div>
    `, { 
        type: 'info',
        buttons: [
            {
                text: 'Fechar',
                onClick: () => console.log('Detalhes fechados')
            }
        ]
    });
}

// Atualizar interface baseada no tipo de empresa
function atualizarInterface() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const nomeUsuarioElement = document.getElementById('nomeUsuario');
    const titulo = document.getElementById('tituloPostagens');
    const subtitulo = document.getElementById('subtituloPostagens');
    
    if (empresaLogada && nomeUsuarioElement) {
        nomeUsuarioElement.textContent = empresaLogada.nomeRazao || 'Usuário';
        
        // Atualizar títulos conforme o tipo
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

// Função para toggle do menu
function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de postagens inicializada');
    
    const empresaLogada = verificarLogin();
    if (empresaLogada) {
        console.log('Usuário logado:', empresaLogada.nomeRazao);
        atualizarInterface();
        carregarPostagens();
        
        // Adicionar evento de busca com debounce
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                // Limpar timer anterior
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                
                // Definir novo timer para debounce (300ms)
                debounceTimer = setTimeout(() => {
                    filtrarPorBusca(e.target.value);
                }, 300);
            });
        }
    }
});

// Função de busca melhorada com suporte a múltiplas palavras e scoring
function filtrarPorBusca(termo) {
    if (!termo.trim()) {
        aplicarFiltro();
        return;
    }
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    // Criar array de termos de busca (suportando múltiplas palavras)
    const termos = termo.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    // Função auxiliar para calcular score de relevância
    function calcularScore(postagem, termos) {
        let score = 0;
        const empresa = postagem.empresa || {};
        
        // Preparar textos para busca
        const titulo = (postagem.titulo || '').toLowerCase();
        const tipoResiduo = (postagem.tipoResiduo || '').toLowerCase();
        const nomeEmpresa = (empresa.nomeRazao || empresa.nome || '').toLowerCase();
        const descricao = (postagem.descricao || '').toLowerCase();
        const endereco = (postagem.enderecoRetirada || '').toLowerCase();
        
        // Verificar cada termo e acumular score
        termos.forEach(termo => {
            // Título: peso 4 (mais importante)
            if (titulo.includes(termo)) score += 4;
            if (titulo.startsWith(termo)) score += 2; // Bônus se começa com o termo
            if (titulo === termo) score += 4; // Bônus se é exatamente igual
            
            // Tipo de resíduo: peso 3
            if (tipoResiduo.includes(termo)) score += 3;
            if (tipoResiduo.startsWith(termo)) score += 1;
            
            // Nome da empresa: peso 3
            if (nomeEmpresa.includes(termo)) score += 3;
            if (nomeEmpresa.startsWith(termo)) score += 1;
            
            // Descrição: peso 2
            if (descricao.includes(termo)) score += 2;
            
            // Endereço: peso 1
            if (endereco.includes(termo)) score += 1;
        });
        
        return score;
    }
    
    // Filtrar postagens que contenham pelo menos um termo
    let postagensFiltradas = todasPostagens
        .map(postagem => ({
            postagem,
            score: calcularScore(postagem, termos)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.postagem);
    
    // Aplicar filtro de tipo de empresa (empresas só veem o tipo oposto)
    if (empresaLogada) {
        if (empresaLogada.tipo === 'DESCARTE') {
            postagensFiltradas = postagensFiltradas.filter(p => p.empresa && p.empresa.tipo === 'COLETA');
        } else if (empresaLogada.tipo === 'COLETA') {
            postagensFiltradas = postagensFiltradas.filter(p => p.empresa && p.empresa.tipo === 'DESCARTE');
        }
    }
    
    exibirPostagens(postagensFiltradas);
}

// Função alternativa para buscar usando a API do backend (para grandes datasets)
async function buscarPeloBackend(termo) {
    try {
        const response = await fetch(`http://localhost:8080/api/postagens/search?q=${encodeURIComponent(termo)}`);
        
        if (response.ok) {
            let resultados = await response.json();
            
            // Aplicar filtro de tipo de empresa
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

// ============================
// FUNÇÕES DE AGENDAMENTO (POPUP)
// ============================

let postagemAgendamento = null;

// Abrir popup de agendamento para uma postagem específica
async function abrirPopupAgendamento(postagemId) {
    // Buscar detalhes completos da postagem
    try {
        const response = await fetch(`http://localhost:8080/api/postagens/${postagemId}`);
        if (!response.ok) throw new Error('Erro ao carregar postagem');
        
        const postagem = await response.json();
        postagemAgendamento = postagem;
        
        // Preencher informações da postagem
        const infoDiv = document.getElementById('postagemAgendamentoInfo');
        const empresa = postagem.empresa || {};
        
        infoDiv.innerHTML = `
            <h3>${postagem.titulo}</h3>
            <p><strong>Empresa:</strong> ${empresa.nomeRazao || 'Não informado'}</p>
            <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
            <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'N/A'}</p>
            <p><strong>Local:</strong> ${postagem.enderecoRetirada || 'Não informado'}</p>
        `;
        
        // Preencher seletores de dia e horário
        await preencherSeletoresDiaHoraPopup(postagem);
        
        // Mostrar popup
        document.getElementById('popupAgendamento').classList.remove('hidden');
        document.getElementById('seletoresAgendamento').style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao abrir popup de agendamento:', error);
        showPopup('❌ Erro ao carregar informações de agendamento', { type: 'error' });
    }
}

// Fechar popup de agendamento
function fecharPopupAgendamento() {
    document.getElementById('popupAgendamento').classList.add('hidden');
    postagemAgendamento = null;
}

// Preencher seletores de dia e horário
async function preencherSeletoresDiaHoraPopup(postagem) {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    
    // Limpar opções
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
    
    // Preencher dias
    dias.forEach(dia => {
        const option = document.createElement('option');
        option.value = dia;
        option.textContent = nomesDias[dia] || dia;
        diaSelect.appendChild(option);
    });
    
    // Adicionar listener para atualizar horários quando dia mudar
    diaSelect.addEventListener('change', function() {
        preencherHorariosPopup(postagem);
    });
    
    // Preencher horários iniciais se houver dias disponíveis
    if (dias.length > 0) {
        diaSelect.value = dias[0];
        await preencherHorariosPopup(postagem);
    }
}

// Preencher horários disponíveis
async function preencherHorariosPopup(postagem) {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    const diaSelecionado = diaSelect.value;
    
    horarioSelect.innerHTML = '<option value="">-- Selecione um horário --</option>';
    
    if (!postagem.horaInicio || !postagem.horaFim) {
        horarioSelect.innerHTML += '<option value="">Sem horários definidos</option>';
        return;
    }
    
    // Buscar agendamentos existentes
    let agendamentosExistentes = [];
    try {
        const response = await fetch(`http://localhost:8080/api/agendamentos/postagem/${postagem.id}`);
        if (response.ok) {
            agendamentosExistentes = await response.json();
        }
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
    }
    
    // Converter dia selecionado para próxima data
    const proximaData = getNextDateForDayPopup(diaSelecionado, '00:00');
    if (!proximaData) return;
    
    const dataFormatada = proximaData.toISOString().slice(0, 10);
    
    // Filtrar horários ocupados
    const horariosOcupados = agendamentosExistentes
        .filter(ag => {
            const dataAgendamento = ag.dataAgendamento || (ag.dataHora ? ag.dataHora.split('T')[0] : null);
            const statusNaoCancelado = ag.status !== 'CANCELADA';
            return dataAgendamento === dataFormatada && statusNaoCancelado;
        })
        .map(ag => ag.horaAgendamento || (ag.dataHora ? ag.dataHora.split('T')[1].substring(0, 5) : null))
        .filter(hora => hora !== null);
    
    // Gerar horários a cada 30 minutos
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

// Confirmar agendamento no popup
async function confirmarAgendamentoPopup() {
    const diaSelect = document.getElementById('diaAgendamento');
    const horarioSelect = document.getElementById('horarioAgendamento');
    const diaSelecionado = diaSelect.value;
    const horarioSelecionado = horarioSelect.value;
    
    if (!diaSelecionado || !horarioSelecionado || !postagemAgendamento) {
        showPopup('⚠️ Selecione um dia e horário', { type: 'info' });
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
        empresaSolicitanteId: empresaLogada.id,
        empresaColetoraId: postagemAgendamento.empresa ? postagemAgendamento.empresa.id : postagemAgendamento.empresaId,
        postagemId: postagemAgendamento.id,
        dataAgendamento: dataAgendamentoDate.toISOString().slice(0,10),
        horaAgendamento: horarioSelecionado,
        observacoes: ''
    };
    
    try {
        const response = await fetch('http://localhost:8080/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Agendamento criado:', data);
            fecharPopupAgendamento();
            showPopup(`Agendamento confirmado para ${diaSelect.options[diaSelect.selectedIndex].text} às ${horarioSelecionado}!`, { 
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

// Calcular próxima data para dia da semana
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