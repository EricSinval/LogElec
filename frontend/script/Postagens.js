// Postagens.js - Gerenciamento da página de postagens
console.log('📄 Postagens.js carregado!');

let todasPostagens = [];
let filtroAtual = 'TODAS';

// Verificar se usuário está logado
function verificarLogin() {
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (!empresaLogada) {
        alert('⚠️ Você precisa fazer login primeiro!');
        window.location.href = 'Login_Page.html';
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
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
    }
}

// Aplicar filtro nas postagens
function aplicarFiltro() {
    let postagensFiltradas = [...todasPostagens];
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    // Filtrar baseado no tipo da empresa logada
    if (empresaLogada) {
        if (filtroAtual === 'DESCARTE') {
            // Empresas de DESCARTE veem postagens de COLETA
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'COLETA'
            );
        } else if (filtroAtual === 'COLETA') {
            // Empresas de COLETA veem postagens de DESCARTE
            postagensFiltradas = postagensFiltradas.filter(p => 
                p.empresa && p.empresa.tipo === 'DESCARTE'
            );
        }
        // Se for 'TODAS', mostra todas as postagens
    }
    
    exibirPostagens(postagensFiltradas);
}

// Exibir postagens na página
function exibirPostagens(postagens) {
    const container = document.getElementById('listaPostagens');
    
    if (postagens.length === 0) {
        container.innerHTML = `
            <div class="sem-postagens">
                <p>📭 Nenhuma postagem disponível no momento.</p>
                <a href="CadastroPostagens_Page.html" class="btn-nova-postagem">Criar Primeira Postagem</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = postagens.map(postagem => `
        <div class="postagem-card" data-id="${postagem.id}">
            <div class="postagem-header">
                <h3>${postagem.titulo || 'Sem título'}</h3>
                <span class="tipo-empresa-badge ${postagem.empresa.tipo === 'DESCARTE' ? 'descarte' : 'coleta'}">
                    ${postagem.empresa.tipo === 'DESCARTE' ? '📤 Descarte' : '📥 Coleta'}
                </span>
            </div>
            <p class="empresa-nome"><strong>Empresa:</strong> ${postagem.empresa.nome}</p>
            <p><strong>Tipo de Resíduo:</strong> ${postagem.tipoResiduo || 'Não especificado'}</p>
            <p><strong>Peso:</strong> ${postagem.peso || 0} kg</p>
            <p><strong>Endereço:</strong> ${postagem.enderecoRetirada || 'Não informado'}</p>
            <p><strong>Status:</strong> <span class="status ${postagem.status.toLowerCase()}">${postagem.status}</span></p>
            <div class="postagem-actions">
                <button onclick="verDetalhesPostagem(${postagem.id})" class="btn-detalhes">
                    Ver Detalhes
                </button>
                <button onclick="solicitarAgendamento(${postagem.id})" class="btn-agendar">
                    Solicitar Agendamento
                </button>
            </div>
        </div>
    `).join('');
}

// Solicitar agendamento
function solicitarAgendamento(postagemId) {
    console.log('📅 Solicitar agendamento para postagem:', postagemId);
    alert(`Solicitar agendamento para postagem ${postagemId} - Em desenvolvimento`);
}

// Ver detalhes da postagem
function verDetalhesPostagem(id) {
    console.log('🔍 Ver detalhes da postagem:', id);
    alert(`Detalhes da postagem ${id} - Em desenvolvimento`);
}

// Atualizar interface baseada no tipo de empresa
function atualizarInterface() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const userInfoElement = document.getElementById('userInfo');
    const titulo = document.getElementById('tituloPostagens');
    const subtitulo = document.getElementById('subtituloPostagens');
    
    if (empresaLogada && userInfoElement) {
        userInfoElement.innerHTML = `
            <span>👋 Olá, ${empresaLogada.nome}</span>
            <span class="tipo-empresa">(${empresaLogada.tipo === 'DESCARTE' ? 'Descarte' : 'Coleta'})</span>
        `;
        
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

// Configurar filtros
function configurarFiltros() {
    const btnTodas = document.getElementById('btnTodas');
    const btnDescarte = document.getElementById('btnDescarte');
    const btnColeta = document.getElementById('btnColeta');
    
    if (btnTodas) btnTodas.addEventListener('click', () => mudarFiltro('TODAS'));
    if (btnDescarte) btnDescarte.addEventListener('click', () => mudarFiltro('DESCARTE'));
    if (btnColeta) btnColeta.addEventListener('click', () => mudarFiltro('COLETA'));
}

function mudarFiltro(novoFiltro) {
    filtroAtual = novoFiltro;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filtros button').forEach(btn => {
        btn.classList.remove('filtro-ativo');
    });
    
    document.getElementById(`btn${novoFiltro.charAt(0) + novoFiltro.slice(1).toLowerCase()}`)
        ?.classList.add('filtro-ativo');
    
    aplicarFiltro();
}

function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'Login_Page.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página de postagens inicializada');
    
    const empresaLogada = verificarLogin();
    if (empresaLogada) {
        console.log('👤 Usuário logado:', empresaLogada.nome);
        atualizarInterface();
        configurarFiltros();
        carregarPostagens();
    }
});