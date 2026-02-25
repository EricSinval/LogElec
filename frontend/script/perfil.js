// perfil.js - Gerenciamento da página de perfil do usuário
console.log('Perfil.js carregado!');

let empresaOriginal = null;
let modoEdicao = false;

// Função para sair
function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'login.html';
}

// Carregar dados do usuário
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

    // Guardar cópia original para cancelamento
    empresaOriginal = JSON.parse(JSON.stringify(empresaLogada));

    // Preencher campos do formulário
    document.getElementById('nomeRazao').value = empresaLogada.nomeRazao || empresaLogada.nome || '';
    document.getElementById('tipo').value = empresaLogada.tipo === 'COLETA' ? 'Empresa de Coleta' : 'Empresa de Descarte';
    document.getElementById('cnpj').value = formatarCNPJ(empresaLogada.cnpj || '');
    document.getElementById('email').value = empresaLogada.email || '';
    document.getElementById('telefone').value = formatarTelefone(empresaLogada.telefone || '');
    document.getElementById('endereco').value = empresaLogada.endereco || '';

    console.log('Dados do usuário carregados:', empresaLogada);
}

// Formatar CNPJ
function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Formatar Telefone
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

// Ativar modo de edição
function ativarModoEdicao() {
    modoEdicao = true;
    
    // Habilitar campos editáveis (exceto os que devem permanecer desabilitados)
    const camposEditaveis = ['email', 'telefone', 'endereco', 'senhaAtual', 'novaSenha', 'confirmarSenha'];
    camposEditaveis.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = false;
    });

    // Mostrar/ocultar botões
    document.getElementById('btnEditar').style.display = 'none';
    document.getElementById('btnSalvar').style.display = 'inline-block';
    document.getElementById('btnCancelar').style.display = 'inline-block';

    console.log('Modo de edição ativado');
}

// Cancelar edição
function cancelarEdicao() {
    modoEdicao = false;
    
    // Desabilitar campos
    const camposEditaveis = ['email', 'telefone', 'endereco', 'senhaAtual', 'novaSenha', 'confirmarSenha'];
    camposEditaveis.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = true;
    });

    // Limpar campos de senha
    document.getElementById('senhaAtual').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';

    // Restaurar dados originais
    carregarDadosUsuario();

    // Mostrar/ocultar botões
    document.getElementById('btnEditar').style.display = 'inline-block';
    document.getElementById('btnSalvar').style.display = 'none';
    document.getElementById('btnCancelar').style.display = 'none';

    console.log('Edição cancelada');
}

// Salvar alterações
async function salvarAlteracoes(event) {
    event.preventDefault();

    if (!modoEdicao) return;

    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    // Coletar dados do formulário
    const dadosAtualizados = {
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        endereco: document.getElementById('endereco').value.trim()
    };

    // Validar campos obrigatórios
    if (!dadosAtualizados.email) {
        showPopup('O email é obrigatório!', { type: 'error' });
        return;
    }

    // Verificar alteração de senha
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
            
            // Atualizar localStorage
            localStorage.setItem('empresaLogada', JSON.stringify(empresaAtualizada));
            
            // Limpar campos de senha
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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Página de perfil inicializada');
    
    carregarDadosUsuario();

    // Event listeners para botões
    document.getElementById('btnEditar').addEventListener('click', ativarModoEdicao);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicao);
    document.getElementById('formPerfil').addEventListener('submit', salvarAlteracoes);
});
