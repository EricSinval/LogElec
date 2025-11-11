// Cadastro.js - Versão Atualizada com Validações
console.log('🎯 Cadastro.js carregado! Vamos configurar...');

// Aguarda a página carregar COMPLETAMENTE
window.addEventListener('load', function() {
    console.log('🏁 Página totalmente carregada, iniciando configuração...');
    configurarCadastro();
});

function configurarCadastro() {
    console.log('🔧 Configurando cadastro...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo');
    console.log('📋 Tipo da URL:', tipo);
    
    if (!tipo) {
        showPopup('Tipo de empresa não definido! Selecione um tipo de empresa na próxima página.', {
            buttons: [
                { text: 'Voltar', onClick: () => { window.location.href = 'home.html'; } }
            ]
        });
        return;
    }
    
    const formCadastro = document.getElementById('formCadastro');
    console.log('🔍 Formulário encontrado:', formCadastro);
    
    if (!formCadastro) {
        console.error('💥 ERRO: Formulário não encontrado!');
        showPopup('Erro: Formulário não carregado. Recarregue a página.', { type: 'error' });
        return;
    }
    
    // ✅ CONFIGURAR VALIDAÇÕES EM TEMPO REAL
    configurarValidacoesEmTempoReal();
    atualizarInterface(tipo);
    
    formCadastro.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('✅ Formulário submetido! Executando cadastro...');
        
        // ✅ VALIDAÇÃO FINAL ANTES DE ENVIAR
        if (validarFormulario()) {
            executarCadastro(tipo);
        }
    });
    
    console.log('🎉 Cadastro configurado com sucesso!');
}

// ✅ CONFIGURAR VALIDAÇÕES EM TEMPO REAL
function configurarValidacoesEmTempoReal() {
    const emailInput = document.getElementById('email');
    const cnpjInput = document.getElementById('cnpj');
    const telefoneInput = document.getElementById('telefone');
    const senhaInput = document.getElementById('senha');
    const nomeInput = document.getElementById('nomeRazao');
    
    if (emailInput) {
        emailInput.addEventListener('blur', validarEmail);
        emailInput.addEventListener('input', limparErroEmail);
    }
    
    if (cnpjInput) {
        cnpjInput.addEventListener('blur', validarCNPJ);
        cnpjInput.addEventListener('input', formatarCNPJ);
        cnpjInput.addEventListener('input', limparErroCNPJ);
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
        telefoneInput.addEventListener('blur', validarTelefone);
    }
    
    if (senhaInput) {
        senhaInput.addEventListener('blur', validarSenha);
        senhaInput.addEventListener('input', limparErroSenha);
    }
    
    if (nomeInput) {
        nomeInput.addEventListener('blur', validarNome);
        nomeInput.addEventListener('input', limparErroNome);
    }
}

// ✅ VALIDAÇÃO DE EMAIL
function validarEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError') || criarElementoErro(emailInput, 'emailError');
    
    // Regex para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        emailError.textContent = '❌ Email inválido. Use o formato: exemplo@dominio.com';
        emailInput.style.borderColor = '#e74c3c';
        return false;
    }
    
    emailError.textContent = '';
    emailInput.style.borderColor = '#27ae60';
    return true;
}

function limparErroEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    if (emailError) emailError.textContent = '';
    emailInput.style.borderColor = '';
}

// ✅ VALIDAÇÃO DE NOME
function validarNome() {
    const nomeInput = document.getElementById('nomeRazao');
    const nome = nomeInput.value.trim();
    const nomeError = document.getElementById('nomeError') || criarElementoErro(nomeInput, 'nomeError');
    
    if (nome && (nome.length < 2 || nome.length > 255)) {
        nomeError.textContent = '❌ Nome deve ter entre 2 e 255 caracteres';
        nomeInput.style.borderColor = '#e74c3c';
        return false;
    }
    
    nomeError.textContent = '';
    nomeInput.style.borderColor = '#27ae60';
    return true;
}

function limparErroNome() {
    const nomeInput = document.getElementById('nomeRazao');
    const nomeError = document.getElementById('nomeError');
    if (nomeError) nomeError.textContent = '';
    nomeInput.style.borderColor = '';
}

// ✅ VALIDAÇÃO DE SENHA
function validarSenha() {
    const senhaInput = document.getElementById('senha');
    const senha = senhaInput.value;
    const senhaError = document.getElementById('senhaError') || criarElementoErro(senhaInput, 'senhaError');
    
    if (senha && senha.length < 6) {
        senhaError.textContent = '❌ Senha deve ter no mínimo 6 caracteres';
        senhaInput.style.borderColor = '#e74c3c';
        return false;
    }
    
    senhaError.textContent = '';
    senhaInput.style.borderColor = '#27ae60';
    return true;
}

function limparErroSenha() {
    const senhaInput = document.getElementById('senha');
    const senhaError = document.getElementById('senhaError');
    if (senhaError) senhaError.textContent = '';
    senhaInput.style.borderColor = '';
}

// ✅ VALIDAÇÃO E FORMATAÇÃO DE CNPJ
function validarCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    let cnpj = cnpjInput.value.replace(/\D/g, '');
    const cnpjError = document.getElementById('cnpjError') || criarElementoErro(cnpjInput, 'cnpjError');
    
    if (cnpj && cnpj.length !== 14) {
        cnpjError.textContent = '❌ CNPJ deve ter 14 dígitos';
        cnpjInput.style.borderColor = '#e74c3c';
        return false;
    }
    
    cnpjError.textContent = '';
    cnpjInput.style.borderColor = '#27ae60';
    return true;
}

function formatarCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    let cnpj = cnpjInput.value.replace(/\D/g, '');
    
    // Aplica a máscara: XX.XXX.XXX/XXXX-XX
    if (cnpj.length <= 14) {
        if (cnpj.length > 12) {
            cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
        } else if (cnpj.length > 8) {
            cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
        } else if (cnpj.length > 5) {
            cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (cnpj.length > 2) {
            cnpj = cnpj.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
        }
        cnpjInput.value = cnpj;
    }
}

function limparErroCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    const cnpjError = document.getElementById('cnpjError');
    if (cnpjError) cnpjError.textContent = '';
    cnpjInput.style.borderColor = '';
}

// ✅ VALIDAÇÃO DE TELEFONE
function validarTelefone() {
    const telefoneInput = document.getElementById('telefone');
    const telefone = telefoneInput.value;
    const telefoneError = document.getElementById('telefoneError') || criarElementoErro(telefoneInput, 'telefoneError');
    
    // Telefone é opcional, mas se preenchido, deve estar no formato correto
    if (telefone && telefone.trim() !== '') {
        const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!telefoneRegex.test(telefone)) {
            telefoneError.textContent = '❌ Telefone inválido. Use: (11) 99999-9999';
            telefoneInput.style.borderColor = '#e74c3c';
            return false;
        }
    }
    
    telefoneError.textContent = '';
    telefoneInput.style.borderColor = '#27ae60';
    return true;
}

function formatarTelefone() {
    const telefoneInput = document.getElementById('telefone');
    let telefone = telefoneInput.value.replace(/\D/g, '');
    
    if (telefone.length <= 11) {
        if (telefone.length > 10) {
            telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length > 6) {
            telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (telefone.length > 2) {
            telefone = telefone.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (telefone.length > 0) {
            telefone = telefone.replace(/^(\d{0,2})/, '($1');
        }
        telefoneInput.value = telefone;
    }
}

// ✅ VALIDAÇÃO FINAL DO FORMULÁRIO
function validarFormulario() {
    const camposObrigatorios = [
        { id: 'nomeRazao', nome: 'Nome/Razão Social' },
        { id: 'cnpj', nome: 'CNPJ' },
        { id: 'email', nome: 'Email' },
        { id: 'senha', nome: 'Senha' },
        { id: 'endereco', nome: 'Endereço' }
    ];
    
    let formularioValido = true;
    let primeiroCampoInvalido = null;
    
    // Validar campos obrigatórios
    for (const campo of camposObrigatorios) {
        const input = document.getElementById(campo.id);
        if (!input || !input.value.trim()) {
            criarElementoErro(input, `${campo.id}Error`).textContent = `❌ ${campo.nome} é obrigatório`;
            input.style.borderColor = '#e74c3c';
            formularioValido = false;
            if (!primeiroCampoInvalido) primeiroCampoInvalido = input;
        }
    }
    
    // Validar campos específicos
    if (formularioValido) {
        if (!validarNome()) { formularioValido = false; primeiroCampoInvalido = document.getElementById('nomeRazao'); }
        if (!validarEmail()) { formularioValido = false; primeiroCampoInvalido = document.getElementById('email'); }
        if (!validarCNPJ()) { formularioValido = false; primeiroCampoInvalido = document.getElementById('cnpj'); }
        if (!validarSenha()) { formularioValido = false; primeiroCampoInvalido = document.getElementById('senha'); }
        if (!validarTelefone()) { formularioValido = false; primeiroCampoInvalido = document.getElementById('telefone'); }
    }
    
    if (primeiroCampoInvalido) {
        primeiroCampoInvalido.focus();
    }
    
    return formularioValido;
}

// ✅ FUNÇÃO AUXILIAR: Criar elemento de erro
function criarElementoErro(input, id) {
    let errorElement = document.getElementById(id);
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = id;
        errorElement.className = 'error-message';
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        errorElement.style.fontWeight = 'bold';
        input.parentNode.appendChild(errorElement);
    }
    return errorElement;
}

// ✅ ATUALIZAR A FUNÇÃO executarCadastro PARA LIDAR COM NOVAS RESPOSTAS
async function executarCadastro(tipo) {
    console.log('🚀 Executando cadastro...');
    
    // Coletar dados do formulário
    const empresaData = {
        nome: document.getElementById('nomeRazao').value.trim(),
        cnpj: document.getElementById('cnpj').value.replace(/\D/g, ''), // Remove formatação
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value,
        tipo: tipo,
        endereco: document.getElementById('endereco').value.trim(),
        telefone: document.getElementById('telefone').value
    };
    
    console.log('📤 Dados enviados:', { ...empresaData, senha: '***' }); // Não logar senha
    
    // Mostrar loading
    const btnSubmit = document.querySelector('button[type="submit"]');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Cadastrando...';
    btnSubmit.disabled = true;
    
    try {
        console.log('🌐 Enviando requisição para o servidor...');
        const response = await fetch('http://localhost:8080/api/empresas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empresaData)
        });
        
        console.log('📥 Status da resposta:', response.status);
        const responseText = await response.text();
        
        if (response.ok) {
            const empresa = JSON.parse(responseText);
            console.log('✅ Empresa cadastrada com sucesso:', empresa);
            showPopup('🎉 Empresa cadastrada com sucesso!', {
                type: 'success',
                buttons: [ { text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } } ]
            });
        } else {
            console.error('❌ Erro no cadastro:', responseText);
            
            // ✅ TRATAMENTO MELHORADO PARA ERROS DO BACKEND
            if (responseText.includes('•')) {
                // Se o backend retornou múltiplos erros
                showPopup('❌ Erros no cadastro:\n' + responseText.replace(/•/g, '\n•'), { type: 'error' });
            } else {
                // Erro simples
                showPopup('❌ Erro no cadastro: ' + responseText, { type: 'error' });
            }
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
    showPopup('🌐 Erro de conexão com o servidor. Verifique se o backend está rodando.', { type: 'error' });
    } finally {
        // Restaurar botão
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
    }
}

// ... (as funções atualizarInterface e outras permanecem iguais)
function atualizarInterface(tipo) {
    console.log('🎨 Atualizando interface para tipo:', tipo);
    
    const titulo = document.querySelector('h2');
    if (titulo) {
        const tipoTexto = tipo === 'DESCARTE' ? 'Descarte' : 'Coleta';
        titulo.textContent = `Cadastro - Empresa de ${tipoTexto}`;
    }
    
    const subtitulo = document.querySelector('.login-link');
    if (subtitulo) {
        const textoDescricao = tipo === 'DESCARTE' 
            ? 'Cadastre-se para descartar seus resíduos eletrônicos' 
            : 'Cadastre-se para coletar resíduos eletrônicos';
        subtitulo.innerHTML = `${textoDescricao}<br>Já possui uma conta? <a href="Login_Page.html">Clique aqui</a> para fazer o login`;
    }
}

// Fallback: se a página já estiver carregada
if (document.readyState === 'complete') {
    console.log('⚡ Página já carregada, iniciando diretamente...');
    configurarCadastro();
}