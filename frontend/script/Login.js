async function fazerLogin(event) {
    event.preventDefault();
    console.log('Iniciando login...');

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    const form = document.getElementById('loginForm');
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;

    if (form && form.dataset.submitting === 'true') {
        return;
    }

    if (!emailInput || !senhaInput) {
        console.error('Campos não encontrados!');
        showPopup('Erro: Campos de login não encontrados. Recarregue a página.', { type: 'error' });
        return;
    }

    if (form) {
        form.dataset.submitting = 'true';
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';
    }

    const loginData = {
        email: emailInput.value,
        senha: senhaInput.value
    };

    console.log('Dados login:', loginData);

    try {
        const empresa = await window.authApp.autenticar(loginData);
        console.log('Login success:', empresa);

        const destino = window.authApp.obterDestinoPosLogin(empresa);
        showPopup('Login realizado com sucesso!', { type: 'success', buttons: [ { text: 'Continuar', onClick: () => { window.location.href = window.resolveFrontendPath ? window.resolveFrontendPath(destino) : destino; } } ] });
    } catch (error) {
        if (error && error.message) {
            console.log('Login error:', error.message);
            showPopup('Erro no login: ' + error.message, { type: 'error' });
        } else {
            showPopup('Erro de conexão com o servidor.', { type: 'error' });
        }
    } finally {
        if (form) {
            form.dataset.submitting = 'false';
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página de login...');

    const formLogin = document.getElementById('loginForm');
    console.log('Formulário de login:', formLogin);

    if (formLogin) {
        formLogin.addEventListener('submit', fazerLogin);
        console.log('Event listener adicionado');
        console.log('Todos os inputs:', document.querySelectorAll('input'));
    } else {
        console.error('Formulário de login não encontrado!');
    }
});