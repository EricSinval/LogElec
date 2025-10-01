/// postagemdesc.js - VERSÃO COMPLETAMENTE CORRIGIDA
let todosResiduos = [];

// Função para carregar resíduos do BACKEND
async function carregarResiduos() {
    try {
        console.log('🔄 Carregando resíduos da API...');
        
        const response = await fetch('http://localhost:8093/api/residuos');
        
        if (response.ok) {
            todosResiduos = await response.json();
            console.log('✅ Resíduos carregados da API:', todosResiduos);
            exibirResiduos(todosResiduos);
        } else {
            console.error('❌ Erro ao carregar da API, status:', response.status);
            // Fallback: tentar do localStorage
            carregarDoLocalStorage();
        }
    } catch (error) {
        console.error('❌ Erro de conexão com API:', error);
        // Fallback: usar localStorage
        carregarDoLocalStorage();
    }
}

// Função fallback para carregar do localStorage
function carregarDoLocalStorage() {
    const empresasLocal = JSON.parse(localStorage.getItem('empresasCadastradas')) || [];
    todosResiduos = empresasLocal;
    console.log('📦 Resíduos carregados do localStorage:', todosResiduos);
    exibirResiduos(todosResiduos);
}

// Função para exibir resíduos na tela - VERSÃO CORRIGIDA
function exibirResiduos(residuos) {
    const cardsContainer = document.getElementById('cardsContainer');
    
    console.log('🔍 Dados recebidos para exibição:', residuos);
    
    if (!residuos || residuos.length === 0) {
        cardsContainer.innerHTML = '<p class="sem-residuos">Nenhum resíduo disponível para coleta no momento.</p>';
        return;
    }

    cardsContainer.innerHTML = '';

    residuos.forEach(residuo => {
        console.log('📋 Resíduo individual:', residuo);
        
        // ⚠️ CORREÇÃO: PEGAR NOME DA EMPRESA DOS CAMPOS CORRETOS
        let nomeEmpresa = 'Empresa não identificada';
        if (residuo.empresa) {
            if (typeof residuo.empresa === 'string') {
                nomeEmpresa = residuo.empresa;
            } else if (typeof residuo.empresa === 'object') {
                // Tentar vários campos possíveis para nome da empresa
                nomeEmpresa = residuo.empresa.nome || 
                             residuo.empresa.razaoSocial || 
                             residuo.empresa.nomeEmpresa ||
                             'Tech Solutions';
            }
        } else if (residuo.nomeEmpresa) {
            nomeEmpresa = residuo.nomeEmpresa;
        }
        
        // ⚠️ CORREÇÃO CRÍTICA: PEGAR ENDEREÇO DOS CAMPOS CORRETOS
        let endereco = 'Endereço a combinar';
        
        // Prioridade 1: enderecoRetirada (campo da API)
        if (residuo.enderecoRetirada) {
            endereco = residuo.enderecoRetirada;
        } 
        // Prioridade 2: endereco (campo do localStorage)
        else if (residuo.endereco) {
            endereco = residuo.endereco;
        }
        // Prioridade 3: endereço dentro do objeto empresa
        else if (residuo.empresa && residuo.empresa.endereço) {
            endereco = residuo.empresa.endereço;
        }
        
        // ⚠️ CORREÇÃO: PEGAR TIPO DOS CAMPOS CORRETOS
        let tipoResiduo = 'Tipo não especificado';
        if (residuo.tipo) {
            tipoResiduo = residuo.tipo;
        } else if (residuo.tipoResiduo) {
            tipoResiduo = residuo.tipoResiduo;
        } else if (residuo.descricao) {
            tipoResiduo = residuo.descricao;
        }
        
        // ⚠️ CORREÇÃO: PEGAR PESO
        const peso = residuo.peso || '0';
        const residuoId = residuo.id || residuo._id || Date.now();
        
        // ⚠️ CORREÇÃO: TRATAR FOTO
        let fotoUrl = 'img/E-waste.png';
        if (residuo.fotoPath) {
            fotoUrl = `http://localhost:8093/${residuo.fotoPath}`;
        } else if (residuo.foto) {
            fotoUrl = residuo.foto;
        }
        
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => redirecionarParaAgendamento(residuoId);
        
        card.innerHTML = `
            <img src="${fotoUrl}" 
                 alt="${tipoResiduo}" 
                 onerror="this.src='img/E-waste.png'">
            <h3>${nomeEmpresa}</h3>
            <p>
                <strong>Tipos de resíduos:</strong> ${tipoResiduo}<br>
                <strong>Peso estimado:</strong> ${peso}kg<br>
                <strong>Endereço:</strong> ${endereco}<br>
                <strong>Status:</strong> <span class="status-pendente">${residuo.status || 'PENDENTE'}</span>
            </p>
        `;
        
        cardsContainer.appendChild(card);
    });
}

// Função para redirecionar para agendamento
function redirecionarParaAgendamento(residuoId) {
    const residuo = todosResiduos.find(r => 
        (r.id && r.id.toString() === residuoId.toString()) || 
        (r._id && r._id.toString() === residuoId.toString()) ||
        (r.id === residuoId) ||
        (r._id === residuoId)
    );
    
    if (residuo) {
        localStorage.setItem('residuoSelecionado', JSON.stringify(residuo));
        
        // Pegar nome da empresa para mostrar no alerta
        let nomeEmpresa = 'Empresa';
        if (residuo.empresa && typeof residuo.empresa === 'object') {
            nomeEmpresa = residuo.empresa.nome || residuo.empresa.razaoSocial || 'Empresa';
        } else if (residuo.nomeEmpresa) {
            nomeEmpresa = residuo.nomeEmpresa;
        }
        
        // Pegar tipo do resíduo
        const tipoResiduo = residuo.tipo || residuo.tipoResiduo || 'Resíduo eletrônico';
        
        alert(`🔔 Redirecionando para agendamento com: ${nomeEmpresa}\n\nTipo: ${tipoResiduo}\nPeso: ${residuo.peso || '0'}kg`);
        
        // window.location.href = 'agendamento.html'; // Descomente quando criar a página
    } else {
        console.error('Resíduo não encontrado:', residuoId);
        alert('❌ Resíduo não encontrado!');
    }
}

// Função para configurar busca
function configurarBusca() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const termo = e.target.value.toLowerCase();
            const residuosFiltrados = todosResiduos.filter(residuo => {
                // Buscar em múltiplos campos possíveis
                const nome = (residuo.empresa && residuo.empresa.nome) || residuo.nomeEmpresa || '';
                const tipo = residuo.tipo || residuo.tipoResiduo || '';
                const endereco = residuo.enderecoRetirada || residuo.endereco || '';
                const descricao = residuo.descricao || '';
                
                return nome.toLowerCase().includes(termo) || 
                       tipo.toLowerCase().includes(termo) ||
                       endereco.toLowerCase().includes(termo) ||
                       descricao.toLowerCase().includes(termo);
            });
            exibirResiduos(residuosFiltrados);
        });
    }
}

// Função do menu dropdown
function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdown');
    const headerIcons = document.querySelector('.header-icons');
    
    if (dropdown && headerIcons && !headerIcons.contains(e.target)) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    }
});

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    carregarResiduos();
    configurarBusca();
    
    // Atualizar nome do usuário (empresa coletora)
    const nomeUsuario = "Recicla Tech Co.";
    const titulo = document.querySelector('h1');
    if (titulo) {
        titulo.textContent = `Seja bem vindo, ${nomeUsuario}`;
    }
});

// Função para testar a API (útil para debug)
async function testarAPI() {
    try {
        console.log('🧪 Testando conexão com API...');
        const response = await fetch('http://localhost:8093/api/residuos');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API conectada! Resíduos encontrados:', data.length);
            if (data.length > 0) {
                console.log('📋 Exemplo de dados:', data[0]);
                console.log('🔑 Campos disponíveis:', Object.keys(data[0]));
            }
            return true;
        } else {
            console.error('❌ API retornou erro:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com API:', error);
        return false;
    }
}

// Executar teste da API (opcional)
// testarAPI();