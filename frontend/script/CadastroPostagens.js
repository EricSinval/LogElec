// CadastroPostagens.js - Gerenciamento do cadastro de postagens
console.log('📝 CadastroPostagens.js carregado!');

async function cadastrarPostagem(event) {
    event.preventDefault();
    console.log('📝 Iniciando cadastro de postagem...');
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        alert('⚠️ Você precisa fazer login primeiro!');
        window.location.href = 'Login_Page.html';
        return;
    }

    const postagemData = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        tipoResiduo: document.getElementById('tipoResiduo').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        enderecoRetirada: document.getElementById('enderecoRetirada').value,
        empresa: { id: empresaLogada.id } // Apenas o ID da empresa
    };

    console.log('📤 Dados da postagem:', postagemData);

    try {
        const response = await fetch('http://localhost:8081/api/postagens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postagemData)
        });
        
        console.log('📥 Status da resposta:', response.status);
        
        if (response.ok) {
            const postagem = await response.json();
            console.log('✅ Postagem cadastrada:', postagem);
            alert('🎉 Postagem cadastrada com sucesso!');
            window.location.href = 'Postagens_Page.html';
        } else {
            const error = await response.text();
            console.error('❌ Erro no cadastro:', error);
            alert('❌ Erro ao cadastrar postagem: ' + error);
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        alert('🌐 Erro de conexão com o servidor.');
    }
}

// Atualizar interface baseada no tipo de empresa
function atualizarInterface() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const userInfoElement = document.getElementById('userInfo');
    const subtitulo = document.getElementById('subtituloPostagem');
    
    if (empresaLogada && userInfoElement) {
        userInfoElement.innerHTML = `
            <span>👋 Olá, ${empresaLogada.nome}</span>
            <span class="tipo-empresa">(${empresaLogada.tipo === 'DESCARTE' ? 'Descarte' : 'Coleta'})</span>
        `;
        
        // Atualizar subtítulo conforme o tipo
        if (subtitulo) {
            if (empresaLogada.tipo === 'DESCARTE') {
                subtitulo.textContent = 'Cadastre seus resíduos para que empresas de coleta possam encontrá-los';
            } else {
                subtitulo.textContent = 'Cadastre sua disponibilidade para coleta de resíduos';
            }
        }
    }
}

function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'Login_Page.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Página de cadastro de postagens inicializada');
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        alert('⚠️ Você precisa fazer login primeiro!');
        window.location.href = 'Login_Page.html';
        return;
    }
    
    atualizarInterface();
    
    const formPostagem = document.getElementById('formCadastroPostagem');
    if (formPostagem) {
        formPostagem.addEventListener('submit', cadastrarPostagem);
        console.log('✅ Event listener adicionado ao formulário de postagem');
    }
});