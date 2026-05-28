
console.log('Perfil.js carregado!');

let empresaOriginal = null;
let modoEdicao = false;


async function sair() {
    if (window.authApp && typeof window.authApp.encerrarSessao === 'function') {
        await window.authApp.encerrarSessao();
    } else {
        localStorage.removeItem('empresaLogada');
    }

    window.location.href = 'login.html';
}


function obterEmpresaLogada() {
    if (window.authApp && typeof window.authApp.obterSessaoLogada === 'function') {
        return window.authApp.obterSessaoLogada();
    }

    const salvo = localStorage.getItem('empresaLogada');
    return salvo ? JSON.parse(salvo) : null;
}


function carregarDadosUsuario(empresaLogada = obterEmpresaLogada()) {
    
    if (!empresaLogada) {
        showPopup('Você precisa fazer login primeiro!', { 
            type: 'info', 
            buttons: [{ 
                text: 'Ir para login', 
                onClick: () => { window.location.href = 'login.html'; } 
            }] 
        });
        return;
    }

    
    empresaOriginal = JSON.parse(JSON.stringify(empresaLogada));

    
    document.getElementById('nomeRazao').value = empresaLogada.nomeRazao || empresaLogada.nome || '';
    document.getElementById('tipo').value = empresaLogada.tipo === 'COLETA' ? 'Empresa de Coleta' : 'Empresa de Descarte';
    document.getElementById('cnpj').value = formatarCNPJ(empresaLogada.cnpj || '');
    document.getElementById('email').value = empresaLogada.email || '';
    document.getElementById('telefone').value = formatarTelefone(empresaLogada.telefone || '');
    document.getElementById('endereco').value = empresaLogada.endereco || '';

    console.log('Dados do usuário carregados:', empresaLogada);
}


function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}


function formatarTelefone(telefone) {
    if (!telefone) return '';
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11) {
        return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
        return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return telefone;
}


function ativarModoEdicao() {
    modoEdicao = true;
    
    
    const camposEditaveis = ['email', 'telefone', 'endereco', 'senhaAtual', 'novaSenha', 'confirmarSenha'];
    camposEditaveis.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = false;
    });

    
    document.getElementById('btnEditar').style.display = 'none';
    document.getElementById('btnSalvar').style.display = 'inline-block';
    document.getElementById('btnCancelar').style.display = 'inline-block';

    console.log('Modo de edição ativado');
}


function cancelarEdicao() {
    modoEdicao = false;
    
    
    const camposEditaveis = ['email', 'telefone', 'endereco', 'senhaAtual', 'novaSenha', 'confirmarSenha'];
    camposEditaveis.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = true;
    });

    
    document.getElementById('senhaAtual').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';

    
    carregarDadosUsuario();

    
    document.getElementById('btnEditar').style.display = 'inline-block';
    document.getElementById('btnSalvar').style.display = 'none';
    document.getElementById('btnCancelar').style.display = 'none';

    console.log('Edição cancelada');
}


async function salvarAlteracoes(event) {
    event.preventDefault();

    if (!modoEdicao) return;

    const empresaLogada = obterEmpresaLogada();
    if (!empresaLogada) {
        showPopup('Você precisa fazer login primeiro!', { type: 'info' });
        return;
    }
    
    
    const dadosAtualizados = {
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        endereco: document.getElementById('endereco').value.trim()
    };

    
    if (!dadosAtualizados.email) {
        showPopup('O email é obrigatório!', { type: 'error' });
        return;
    }

    
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha || confirmarSenha || senhaAtual) {
        if (!senhaAtual) {
            showPopup('⚠️ Digite sua senha atual para alterá-la!', { type: 'error' });
            return;
        }
        if (novaSenha !== confirmarSenha) {
            showPopup('⚠️ As senhas não coincidem!', { type: 'error' });
            return;
        }
        if (novaSenha.length < 6) {
            showPopup('⚠️ A nova senha deve ter pelo menos 6 caracteres!', { type: 'error' });
            return;
        }
        dadosAtualizados.senhaAtual = senhaAtual;
        dadosAtualizados.novaSenha = novaSenha;
    }

    console.log('📤 Enviando dados atualizados:', dadosAtualizados);

    try {
        const response = await fetch('/api/empresas/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            const empresaAtualizada = await response.json();
            console.log('✅ Perfil atualizado:', empresaAtualizada);
            
            
            if (window.authApp && typeof window.authApp.persistirSessao === 'function') {
                window.authApp.persistirSessao(empresaAtualizada);
            } else {
                localStorage.setItem('empresaLogada', JSON.stringify(empresaAtualizada));
            }
            
            
            document.getElementById('senhaAtual').value = '';
            document.getElementById('novaSenha').value = '';
            document.getElementById('confirmarSenha').value = '';
            
            showPopup('✅ Perfil atualizado com sucesso!', { 
                type: 'success',
                buttons: [{
                    text: 'OK',
                    onClick: () => {
                        cancelarEdicao();
                        carregarDadosUsuario();
                    }
                }]
            });
        } else {
            const erro = await response.text();
            console.error('❌ Erro ao atualizar perfil:', erro);
            showPopup(`❌ Erro ao atualizar perfil: ${erro}`, { type: 'error' });
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        showPopup('🌐 Erro de conexão com o servidor.', { type: 'error' });
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    console.log('👤 Página de perfil inicializada');

    if (window.authApp && typeof window.authApp.exigirSessao === 'function') {
        const empresaLogada = await window.authApp.exigirSessao({
            redirectPath: 'login.html',
            message: 'Você precisa fazer login primeiro!'
        });

        if (!empresaLogada) {
            return;
        }
    }
    
    carregarDadosUsuario();

    
    document.getElementById('btnEditar').addEventListener('click', ativarModoEdicao);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicao);
    document.getElementById('formPerfil').addEventListener('submit', salvarAlteracoes);
});


function confirmarExclusao() {
    showPopup('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.', {
        type: 'error',
        buttons: [
            { text: 'Cancelar', onClick: () => {} },
            { text: 'Continuar', onClick: () => pedirSenhaParaExclusao() }
        ]
    });
}


function pedirSenhaParaExclusao() {
    showPopup(
        '<strong>Confirme sua identidade</strong><br><br>' +
        'Digite sua senha para excluir definitivamente a conta:<br>' +
        '<input type="password" id="senhaConfirmacaoExclusao" class="ui-popup-inline-input" placeholder="Sua senha" autocomplete="current-password">',
        {
            type: 'error',
            showCloseButton: true,
            closeOnBackdrop: false,
            buttons: [
                { text: 'Cancelar', onClick: () => {} },
                {
                    text: 'Excluir definitivamente',
                    onClick: () => {
                        const senha = document.getElementById('senhaConfirmacaoExclusao')?.value;
                        if (!senha) {
                            setTimeout(() => showPopup('Digite sua senha para confirmar.', { type: 'error' }), 100);
                            return;
                        }
                        excluirContaComSenha(senha);
                    }
                }
            ]
        }
    );
}


async function excluirContaComSenha(senha) {
    const empresaLogada = obterEmpresaLogada();
    if (!empresaLogada) return;

    try {
        
        if (window.authApp && typeof window.authApp.autenticar === 'function') {
            await window.authApp.autenticar({ email: empresaLogada.email, senha });
        } else {
            const loginResp = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: empresaLogada.email, senha })
            });

            if (!loginResp.ok) {
                showPopup('Senha incorreta. Exclusão cancelada.', { type: 'error' });
                return;
            }
        }

        const response = await fetch('/api/empresas/me', {
            method: 'DELETE'
        });

        if (response.status === 401) {
            showPopup('Senha incorreta. Exclusão cancelada.', { type: 'error' });
            return;
        }

        if (response.status === 204) {
            if (window.authApp && typeof window.authApp.limparSessao === 'function') {
                window.authApp.limparSessao();
            } else {
                localStorage.removeItem('empresaLogada');
            }
            showPopup('Conta excluída com sucesso.', {
                type: 'success',
                buttons: [{ text: 'OK', onClick: () => { window.location.href = 'login.html'; } }]
            });
        } else if (response.status === 409) {
            const msg = await response.text();
            showPopup(msg, { type: 'error' });
        } else {
            showPopup('Erro ao excluir conta. Tente novamente.', { type: 'error' });
        }
    } catch (error) {
        showPopup('Erro de conexão com o servidor.', { type: 'error' });
    }
}
