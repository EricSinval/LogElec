async function fazerLogin(event) {
    event.preventDefault();
    console.log('🔐 Iniciando login...');
    
    // ✅ VERIFICAÇÃO ROBUSTA DOS CAMPOS
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    
    if (!emailInput || !senhaInput) {
        console.error('❌ Campos não encontrados!');
        console.log('Email input:', emailInput);
        console.log('Senha input:', senhaInput);
        alert('Erro: Campos de login não encontrados. Recarregue a página.');
        return;
    }

    const loginData = {
        email: emailInput.value,
        senha: senhaInput.value
    };

    console.log('📤 Dados login:', loginData);

    try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('📥 Status response:', response.status);
        
        if (response.ok) {
            const empresa = await response.json();
            console.log('✅ Login success:', empresa);
            
            localStorage.setItem('empresaLogada', JSON.stringify(empresa));
            alert('🎉 Login realizado com sucesso!');
            window.location.href = 'Home_Page.html';
        } else {
            const error = await response.text();
            console.log('❌ Login error:', error);
            alert('Erro no login: ' + error);
        }
    } catch (error) {
        console.error('💥 Erro completo:', error);
        alert('🌐 Erro de conexão com o servidor.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Inicializando página de login...');
    
    const formLogin = document.getElementById('loginForm');
    console.log('📝 Formulário de login:', formLogin);
    
    if (formLogin) {
        formLogin.addEventListener('submit', fazerLogin);
        console.log('✅ Event listener adicionado');
        
        // ✅ DEBUG: Verificar todos os elementos
        console.log('🔍 Todos os inputs:', document.querySelectorAll('input'));
    } else {
        console.error('❌ Formulário de login não encontrado!');
    }
});