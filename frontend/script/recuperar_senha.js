const API_URL = 'http://localhost:8080/api/auth/recuperar-senha';


document.getElementById('cnpj').addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    this.value = value;
});

document.getElementById('recuperarForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    
    if (novaSenha !== confirmarSenha) {
        showPopup('As senhas não coincidem.', { type: 'error' });
        return;
    }

    if (novaSenha.length < 6) {
        showPopup('A nova senha deve ter pelo menos 6 caracteres.', { type: 'error' });
        return;
    }

    
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, cnpj: cnpjLimpo, novaSenha })
        });

        const texto = await response.text();

        if (response.ok) {
            showPopup('Senha redefinida com sucesso! Redirecionando...', { type: 'success' });
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            
            
            let mensagem = texto;
            try {
                const json = JSON.parse(texto);
                mensagem = json.message || json.error || 'Erro ao redefinir a senha. Tente novamente.';
            } catch (_) {
                
            }
            showPopup(mensagem || 'Erro ao redefinir a senha. Tente novamente.', { type: 'error' });
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
        showPopup('Não foi possível conectar ao servidor.', { type: 'error' });
    }
});
