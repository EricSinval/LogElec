// CadastroPostagens.js - Gerenciamento do cadastro de postagens
console.log('📝 CadastroPostagens.js carregado!');

async function cadastrarPostagem(event) {
    event.preventDefault();
    console.log('📝 Iniciando cadastro de postagem...');
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { type: 'info', buttons: [ { text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } } ] });
        return;
    }

    // Nome da empresa sempre do localStorage
    const nomeEmpresa = empresaLogada.nomeRazao || empresaLogada.nome;
    document.getElementById('nomeEmpresa').value = nomeEmpresa;

    // Coletar dias selecionados
    const diasCheckboxes = document.querySelectorAll('input[name="dia"]:checked');
    const diasSelecionados = Array.from(diasCheckboxes).map(cb => cb.value);
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFim = document.getElementById('horaFim').value;

    // Converter imagem para Base64
    let fotoBase64 = null;
    const fotoInput = document.getElementById('foto');
    if (fotoInput.files && fotoInput.files[0]) {
        fotoBase64 = await converterImagemBase64(fotoInput.files[0]);
    }

    const postagemData = {
        titulo: nomeEmpresa,
        descricao: document.getElementById('descricao').value,
        tipoResiduo: document.getElementById('tipoResiduo').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        enderecoRetirada: document.getElementById('enderecoRetirada').value,
        diasDisponibilidade: diasSelecionados.join(','),
        horaInicio: horaInicio,
        horaFim: horaFim,
        fotoResiduos: fotoBase64,
        empresa: { id: empresaLogada.id }
    };

    console.log('📤 Dados da postagem:', postagemData);

    try {
        const response = await fetch('http://localhost:8080/api/postagens', {
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
            showPopup('🎉 Postagem cadastrada com sucesso!', { type: 'success', buttons: [ { text: 'Ver postagens', onClick: () => { window.location.href = 'postagens.html'; } } ] });
        } else {
            const error = await response.text();
            console.error('❌ Erro no cadastro:', error);
            showPopup('❌ Erro ao cadastrar postagem: ' + error, { type: 'error' });
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        showPopup('🌐 Erro de conexão com o servidor.', { type: 'error' });
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

            // Atualizar link do dropdown para mostrar o tipo de postagens relevantes
            const linkPostagens = document.getElementById('linkPostagensTipo');
            if (linkPostagens) {
                // Se a empresa for DESCARTE, mostramos 'Postagens coleta' (ou seja, empresas que coletam)
                // Se a empresa for COLETA, mostramos 'Postagens descarte'
                const label = empresaLogada.tipo === 'DESCARTE' ? 'Postagens coleta' : 'Postagens descarte';
                linkPostagens.textContent = label;
                linkPostagens.href = 'postagens.html';
            }
    }
}

function sair() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'login.html';
}

// Converter imagem para Base64
function converterImagemBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            console.log('📸 Imagem convertida para Base64, tamanho:', reader.result.length, 'caracteres');
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(arquivo);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Página de cadastro de postagens inicializada');
    
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { type: 'info', buttons: [ { text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } } ] });
        return;
    }
    atualizarInterface();
    // Preencher campo nomeEmpresa
    const nomeEmpresa = empresaLogada.nomeRazao || empresaLogada.nome;
    const nomeEmpresaInput = document.getElementById('nomeEmpresa');
    if (nomeEmpresaInput) nomeEmpresaInput.value = nomeEmpresa;
    
    const formPostagem = document.getElementById('formCadastroPostagem');
    if (formPostagem) {
        formPostagem.addEventListener('submit', cadastrarPostagem);
        console.log('✅ Event listener adicionado ao formulário de postagem');
    }
});