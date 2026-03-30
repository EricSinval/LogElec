
console.log('Perfil.js carregado!');

let empresaOriginal = null;
let modoEdicao = false;


function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'login.html';
}


function carregarDadosUsuario() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
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

    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    
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
        const response = await fetch(`http://localhost:8080/api/empresas/${empresaLogada.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            const empresaAtualizada = await response.json();
            console.log('✅ Perfil atualizado:', empresaAtualizada);
            
            
            localStorage.setItem('empresaLogada', JSON.stringify(empresaAtualizada));
            
            
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


document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Página de perfil inicializada');
    
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
        '<input type="password" id="senhaConfirmacaoExclusao" placeholder="Sua senha" ' +
        'style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;margin-top:10px;box-sizing:border-box;">',
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
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) return;

    try {
        
        const loginResp = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: empresaLogada.email, senha })
        });

        if (!loginResp.ok) {
            showPopup('Senha incorreta. Exclusão cancelada.', { type: 'error' });
            return;
        }

        const response = await fetch(`http://localhost:8080/api/empresas/${empresaLogada.id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            localStorage.removeItem('empresaLogada');
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
