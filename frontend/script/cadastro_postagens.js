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

    // Montar payload de forma condicional por tipo de empresa
    const isColeta = empresaLogada.tipo === 'COLETA';
    const postagemData = {
        titulo: nomeEmpresa,
        descricao: document.getElementById('descricao').value,
        tipoResiduo: document.getElementById('tipoResiduo').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        diasDisponibilidade: diasSelecionados.join(','),
        horaInicio: horaInicio,
        horaFim: horaFim,
        empresa: { id: empresaLogada.id }
    };

    if (isColeta) {
        // COLETA: enviar fotoEmpresa; não enviar endereço de retirada
        if (fotoBase64) postagemData.fotoEmpresa = fotoBase64;
    } else {
        // DESCARTE: enviar endereçoRetirada e fotoResiduos
        postagemData.enderecoRetirada = document.getElementById('enderecoRetirada').value;
        if (fotoBase64) postagemData.fotoResiduos = fotoBase64;
    }

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
    
    // Ajustar campos exibidos e textos conforme tipo
    configurarCamposPorTipo(empresaLogada.tipo);
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
    
    // Configurar preview de imagem
    setupImagePreview();
});

// Exibir/ocultar campos e ajustar labels conforme tipo de empresa
function configurarCamposPorTipo(tipo) {
    const isColeta = tipo === 'COLETA';

    // Seletores de labels
    const labelTipoResiduo = document.querySelector('label[for="tipoResiduo"]');
    const labelPeso = document.querySelector('label[for="peso"]');
    const labelFoto = document.querySelector('label[for="foto"]');
    const labelEndereco = document.querySelector('label[for="enderecoRetirada"]');

    const inputEndereco = document.getElementById('enderecoRetirada');

    // Ajuste de textos
    if (labelTipoResiduo) {
        labelTipoResiduo.textContent = isColeta ? 'Tipos de resíduos que coletamos' : 'Tipos de resíduos que está descartando';
    }
    if (labelPeso) {
        labelPeso.textContent = isColeta ? 'Peso máximo de resíduos (kg)' : 'Peso aproximado (kg)';
    }
    if (labelFoto) {
        labelFoto.textContent = isColeta ? 'Foto da logo/foto da empresa' : 'Foto dos resíduos';
    }
    if (labelEndereco && inputEndereco) {
        if (isColeta) {
            // COLETA: esconder endereço e remover required
            labelEndereco.style.display = 'none';
            inputEndereco.style.display = 'none';
            inputEndereco.required = false;
            inputEndereco.value = '';
        } else {
            // DESCARTE: mostrar endereço e exigir preenchimento
            labelEndereco.style.display = '';
            inputEndereco.style.display = '';
            inputEndereco.required = true;
        }
    }
    
    // Configurar micro-dicas contextuais
    configurarMicroDicas(isColeta);
}

// Configurar micro-dicas (hints) baseadas no tipo de empresa
function configurarMicroDicas(isColeta) {
    const hintDescricao = document.getElementById('hintDescricao');
    const hintTipoResiduo = document.getElementById('hintTipoResiduo');
    const hintPeso = document.getElementById('hintPeso');
    const hintEndereco = document.getElementById('hintEndereco');
    const hintFoto = document.getElementById('hintFoto');
    const hintHorario = document.getElementById('hintHorario');
    
    if (isColeta) {
        if (hintDescricao) hintDescricao.textContent = 'Explique quais tipos de resíduos você coleta e como funciona o serviço.';
        if (hintTipoResiduo) hintTipoResiduo.textContent = 'Liste os principais tipos de resíduos eletrônicos que sua empresa coleta.';
        if (hintPeso) hintPeso.textContent = 'Indique o peso máximo que sua empresa consegue coletar por vez.';
        if (hintEndereco) hintEndereco.style.display = 'none';
        if (hintFoto) hintFoto.textContent = 'Envie uma foto da sua empresa ou logo para identificação.';
        if (hintHorario) hintHorario.textContent = 'Defina os dias e horários em que sua empresa está disponível para realizar coletas.';
    } else {
        if (hintDescricao) hintDescricao.textContent = 'Descreva os resíduos que você deseja descartar e seu estado.';
        if (hintTipoResiduo) hintTipoResiduo.textContent = 'Especifique o tipo de resíduo eletrônico (ex: computadores, cabos, baterias).';
        if (hintPeso) hintPeso.textContent = 'Informe o peso aproximado do material a ser descartado.';
        if (hintEndereco) {
            hintEndereco.style.display = '';
            hintEndereco.textContent = 'Informe o endereço completo onde os resíduos podem ser retirados.';
        }
        if (hintFoto) hintFoto.textContent = 'Envie uma foto dos resíduos para que empresas de coleta visualizem.';
        if (hintHorario) hintHorario.textContent = 'Indique os dias e horários em que empresas podem retirar os resíduos.';
    }
}

// Preview de imagem ao selecionar arquivo
function setupImagePreview() {
    const fotoInput = document.getElementById('foto');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreview');
    
    if (fotoInput && previewContainer && previewImg) {
        fotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
}