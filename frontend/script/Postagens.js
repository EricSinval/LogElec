// Postagens.js - Gerenciamento da página de postagens
console.log('📄 Postagens.js carregado!');

let todasPostagens = [];

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
    console.log('📥 Carregando postagens...');
    
    try {
        const response = await fetch('http://localhost:8080/api/postagens');
        
        if (response.ok) {
            todasPostagens = await response.json();
            console.log('✅ Postagens carregadas:', todasPostagens);
            aplicarFiltro();
        } else {
            console.error('❌ Erro ao carregar postagens');
            // Fallback para dados mock se a API não estiver disponível
            carregarPostagensMock();
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        // Fallback para dados mock
        carregarPostagensMock();
    }
}

// Fallback com dados mock (para desenvolvimento)
function carregarPostagensMock() {
    console.log('🔄 Usando dados mock para desenvolvimento');
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
                <p>📭 Nenhuma postagem disponível no momento.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = postagens.map(postagem => {
        const empresa = postagem.empresa || {};
        const nomeEmpresa = empresa.nomeRazao || empresa.nome || 'Empresa';
        const tipoResiduo = postagem.tipoResiduo || 'Não especificado';
        const peso = postagem.peso ? `${postagem.peso} kg` : 'Não informado';
        const endereco = postagem.enderecoRetirada || 'Não informado';
        const status = postagem.status || 'ABERTA';
        const descricao = postagem.descricao || 'Sem descrição disponível';
        
        // Definir imagem baseada no tipo de resíduo
        const imagem = obterImagemPorTipoResiduo(tipoResiduo);
        
        return `
        <div class="card" data-id="${postagem.id}">
                <img src="${postagem.fotoResiduos || imagem}" alt="${tipoResiduo}" style="object-fit: cover; width: 100%; height: 250px;">
            <div class="card-header">
                <h3 style="text-align:left; flex:1;">${nomeEmpresa}</h3>
                <span class="tipo-empresa ${empresa.tipo === 'DESCARTE' ? 'descarte' : 'coleta'}" style="margin-left:auto;">${empresa.tipo === 'DESCARTE' ? '📤 Descarte' : '📥 Coleta'}</span>
            </div>
            <div class="card-content">
                <p><strong>Tipo de resíduos:</strong> ${tipoResiduo}</p>
                <p><strong>Peso:</strong> ${peso}</p>
                <p><strong>Localização:</strong> ${endereco}</p>
                <p class="status ${status.toLowerCase()}"><strong>Status:</strong> ${formatarStatus(status)}</p>
                <p><strong>Descrição:</strong> ${descricao}</p>
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

function redirecionarAgendamento(postagemId) {
    window.location.href = 'agendamento.html?id=' + postagemId;
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
    console.log('📅 Solicitar agendamento para postagem:', postagemId);
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
    console.log('✅ Confirmando agendamento:', { postagemId, empresaId });
    
    // Aqui você implementaria a chamada para a API de agendamentos
    // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
    showPopup('✅ Solicitação de agendamento enviada com sucesso! A empresa será notificada.', { 
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
                <h4>📋 Informações da Empresa</h4>
                <p><strong>Empresa:</strong> ${empresa.nomeRazao || 'Não informado'}</p>
                <p><strong>Tipo:</strong> ${empresa.tipo === 'DESCARTE' ? 'Empresa que Descarta' : 'Empresa Coletora'}</p>
                <p><strong>Email:</strong> ${empresa.email || 'Não informado'}</p>
            </div>
            <div class="detalhes-section">
                <h4>🗑️ Informações do Resíduo</h4>
                <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
                <p><strong>Peso:</strong> ${postagem.peso ? postagem.peso + ' kg' : 'Não informado'}</p>
                <p><strong>Endereço para Retirada:</strong> ${postagem.enderecoRetirada || 'Não informado'}</p>
            </div>
            <div class="detalhes-section">
                <h4>📝 Descrição</h4>
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
    console.log('📄 Página de postagens inicializada');
    
    const empresaLogada = verificarLogin();
    if (empresaLogada) {
        console.log('👤 Usuário logado:', empresaLogada.nomeRazao);
        atualizarInterface();
        carregarPostagens();
        
        // Adicionar evento de busca
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filtrarPorBusca(e.target.value);
            });
        }
    }
});

// Função de busca
function filtrarPorBusca(termo) {
    if (!termo.trim()) {
        aplicarFiltro();
        return;
    }
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const termoLower = termo.toLowerCase();
    
    let postagensFiltradas = todasPostagens.filter(postagem => {
        const empresa = postagem.empresa || {};
        return (
            (postagem.titulo && postagem.titulo.toLowerCase().includes(termoLower)) ||
            (postagem.tipoResiduo && postagem.tipoResiduo.toLowerCase().includes(termoLower)) ||
            (empresa.nomeRazao && empresa.nomeRazao.toLowerCase().includes(termoLower)) ||
            (postagem.descricao && postagem.descricao.toLowerCase().includes(termoLower))
        );
    });
    
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