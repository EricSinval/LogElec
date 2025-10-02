console.log("✅ PostagemColeta.js carregado!");

// FUNÇÕES DO MENU DROPDOWN
function toggleMenu() {
    const dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("show");
}

// Fechar dropdown ao clicar fora
window.onclick = function(event) {
    if (!event.target.matches('.menu-icon')) {
        const dropdowns = document.getElementsByClassName("dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// CARREGAR RESÍDUOS DISPONÍVEIS
async function carregarResiduosDisponiveis() {
    try {
        console.log("🔄 Carregando resíduos disponíveis...");
        
        const response = await fetch("http://localhost:8082/api/residuos/disponiveis");
        
        if (response.ok) {
            const residuos = await response.json();
            console.log("✅ Resíduos carregados:", residuos);
            exibirResiduos(residuos);
        } else {
            console.log("❌ Erro ao carregar resíduos");
            exibirResiduos([]); // Exibir mensagem de nenhum resíduo
        }
    } catch (err) {
        console.log("💥 Erro de conexão:", err);
        exibirResiduos([]); // Exibir mensagem de erro
    }
}

// EXIBIR RESÍDUOS EM CARDS
function exibirResiduos(residuos) {
    const cardsContainer = document.querySelector(".cards");
    
    if (!cardsContainer) {
        console.log("❌ Container de cards não encontrado");
        return;
    }
    
    // Limpar cards estáticos
    cardsContainer.innerHTML = "";
    
    if (residuos.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-residuos">
                <p>Nenhum resíduo disponível no momento.</p>
                <p>As empresas ainda não cadastraram resíduos para coleta.</p>
            </div>
        `;
        return;
    }
    
    // Criar cards dinâmicos com os resíduos
    residuos.forEach(residuo => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="../img/Placa mãe.jpg" alt="${residuo.categoria}">
            <h3>${residuo.empresa.nome}</h3>
            <p>
                <strong>Tipos de resíduos:</strong> ${residuo.nome}<br> 
                <strong>Descrição:</strong> ${residuo.descricao}<br>
                <strong>Categoria:</strong> ${residuo.categoria}<br>
                <strong>Peso:</strong> ${residuo.peso} kg<br>
                <strong>Localização:</strong> ${residuo.enderecoRetirada}
            </p>
            <button class="btn-coleta" onclick="solicitarColeta(${residuo.id})">Solicitar Coleta</button>
        `;
        cardsContainer.appendChild(card);
    });
}

// SOLICITAR COLETA
function solicitarColeta(residuoId) {
    console.log("📦 Solicitar coleta para resíduo:", residuoId);
    
    // Pegar empresa logada
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    if (!empresaLogada) {
        alert("Faça login para solicitar coleta.");
        return;
    }
    
    // TODO: Implementar solicitação de coleta
    alert(`Coleta solicitada para o resíduo ID: ${residuoId}!\n\nEmpresa solicitante: ${empresaLogada.nome}\n\nFuncionalidade de agendamento em desenvolvimento.`);
}

// ATUALIZAR NOME DA EMPRESA LOGADA
function atualizarNomeEmpresa() {
    const empresaLogada = localStorage.getItem('empresaLogada');
    
    if (empresaLogada) {
        const empresa = JSON.parse(empresaLogada);
        const titulo = document.querySelector("h1");
        if (titulo) {
            titulo.textContent = `Seja bem vindo, ${empresa.nome}`;
        }
    }
}

// VERIFICAR SE É EMPRESA DE COLETA E CARREGAR DADOS
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando PostagemColeta...");
    
    const empresaLogada = localStorage.getItem('empresaLogada');
    
    if (!empresaLogada) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "Login_Page.html";
        return;
    }
    
    const empresa = JSON.parse(empresaLogada);
    console.log("🏢 Empresa logada:", empresa);
    
    // Verificar se é empresa de coleta
    if (empresa.tipo !== "COLETA") {
        alert("Apenas empresas de coleta podem acessar esta página.");
        window.location.href = "Postagem_Descarte.html";
        return;
    }
    
    // Atualizar interface
    atualizarNomeEmpresa();
    
    // Carregar resíduos disponíveis
    carregarResiduosDisponiveis();
    
    console.log("✅ PostagemColeta inicializada com sucesso!");
});

// BUSCA (opcional - para implementar depois)
function configurarBusca() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            console.log("🔍 Buscando:", e.target.value);
            // Implementar filtro depois
        });
    }
}