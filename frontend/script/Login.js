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
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        console.log('Status response:', response.status);

        if (response.ok) {
            const empresa = await response.json();
            console.log('Login success:', empresa);

            localStorage.setItem('empresaLogada', JSON.stringify(empresa));
            showPopup('Login realizado com sucesso!', { type: 'success', buttons: [ { text: 'Continuar', onClick: () => { window.location.href = 'postagens.html'; } } ] });
        } else {
            const error = await response.text();
            console.log('Login error:', error);
            showPopup('Erro no login: ' + error, { type: 'error' });
        }
    } catch (error) {
        showPopup('Erro de conexão com o servidor.', { type: 'error' });
    } finally {
        if (form) {
            form.dataset.submitting = 'false';
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
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