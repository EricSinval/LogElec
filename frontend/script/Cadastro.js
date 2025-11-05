console.log('🎯 Cadastro.js carregado! Vamos configurar...');

// Aguarda a página carregar COMPLETAMENTE
window.addEventListener('load', function() {
    console.log('🏁 Página totalmente carregada, iniciando configuração...');
    configurarCadastro();
});

function configurarCadastro() {
    console.log('🔧 Configurando cadastro...');
    
    // 1. Verificar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo');
    console.log('📋 Tipo da URL:', tipo);
    
    if (!tipo) {
        alert('❌ Tipo de empresa não definido! Volte pela homepage e clique em um dos botões.');
        window.location.href = 'Home_Page.html';
        return;
    }
    
    // 2. Buscar formulário - AGORA COM VERIFICAÇÃO ROBUSTA
    const formCadastro = document.getElementById('formCadastro');
    console.log('🔍 Formulário encontrado:', formCadastro);
    
    if (!formCadastro) {
        console.error('💥 ERRO: Formulário não encontrado!');
        console.log('📝 Todos os formulários:', document.querySelectorAll('form'));
        alert('Erro: Formulário não carregado. Recarregue a página.');
        return;
    }
    
    // 3. Atualizar a página com o tipo
    atualizarInterface(tipo);
    
    // 4. Configurar evento de submit
    formCadastro.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('✅ Formulário submetido! Executando cadastro...');
        executarCadastro(tipo);
    });
    
    console.log('🎉 Cadastro configurado com sucesso!');
}

function atualizarInterface(tipo) {
    console.log('🎨 Atualizando interface para tipo:', tipo);
    
    // Atualizar título
    const titulo = document.querySelector('h2');
    if (titulo) {
        const tipoTexto = tipo === 'DESCARTE' ? 'Descarte' : 'Coleta';
        titulo.textContent = `Cadastro - Empresa de ${tipoTexto}`;
    }
    
    // Atualizar subtítulo
    const subtitulo = document.querySelector('.login-link');
    if (subtitulo) {
        const textoDescricao = tipo === 'DESCARTE' 
            ? 'Cadastre-se para descartar seus resíduos eletrônicos' 
            : 'Cadastre-se para coletar resíduos eletrônicos';
        subtitulo.innerHTML = `${textoDescricao}<br>Já possui uma conta? <a href="Login_Page.html">Clique aqui</a> para fazer o login`;
    }
}

async function executarCadastro(tipo) {
    console.log('🚀 Executando cadastro...');
    
    // Coletar dados do formulário
    const empresaData = {
        nome: document.getElementById('nomeRazao').value,
        cnpj: document.getElementById('cnpj').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        tipo: tipo,
        endereco: document.getElementById('endereco').value,
        telefone: document.getElementById('telefone').value
    };
    
    console.log('📤 Dados enviados:', empresaData);
    
    // Validar dados obrigatórios
    if (!empresaData.nome || !empresaData.cnpj || !empresaData.email || !empresaData.senha || !empresaData.endereco) {
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    try {
        console.log('🌐 Enviando requisição para o servidor...');
        const response = await fetch('http://localhost:8081/api/empresas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empresaData)
        });
        
        console.log('📥 Status da resposta:', response.status);
        
        if (response.ok) {
            const empresa = await response.json();
            console.log('✅ Empresa cadastrada com sucesso:', empresa);
            alert('🎉 Empresa cadastrada com sucesso!');
            window.location.href = 'Login_Page.html';
        } else {
            const errorText = await response.text();
            console.error('❌ Erro no cadastro:', errorText);
            alert('❌ Erro no cadastro: ' + errorText);
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        alert('🌐 Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
}

// Fallback: se a página já estiver carregada
if (document.readyState === 'complete') {
    console.log('⚡ Página já carregada, iniciando diretamente...');
    configurarCadastro();
}