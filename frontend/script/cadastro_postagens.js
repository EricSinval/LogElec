
console.log('CadastroPostagens.js carregado!');

function obterEmpresaLogada() {
    if (window.authApp && typeof window.authApp.obterSessaoLogada === 'function') {
        return window.authApp.obterSessaoLogada();
    }

    const salvo = localStorage.getItem('empresaLogada');
    return salvo ? JSON.parse(salvo) : null;
}

async function cadastrarPostagem(event) {
    event.preventDefault();
    console.log('Iniciando cadastro de postagem...');

    const formPostagem = document.getElementById('formCadastroPostagem');
    const submitButton = formPostagem ? formPostagem.querySelector('button[type="submit"]') : null;

    if (formPostagem && formPostagem.dataset.submitting === 'true') {
        return;
    }

    if (formPostagem) {
        formPostagem.dataset.submitting = 'true';
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
    }
    
    const empresaLogada = obterEmpresaLogada();
    if (!empresaLogada) {
        showPopup('⚠️ Você precisa fazer login primeiro!', { type: 'info', buttons: [ { text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } } ] });
        return;
    }

    
    const nomeEmpresa = empresaLogada.nomeRazao || empresaLogada.nome;
    document.getElementById('nomeEmpresa').value = nomeEmpresa;

    
    const diasCheckboxes = document.querySelectorAll('input[name="dia"]:checked');
    const diasSelecionados = Array.from(diasCheckboxes).map(cb => cb.value);
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFim = document.getElementById('horaFim').value;

    
    let fotoBase64 = null;
    const fotoInput = document.getElementById('foto');
    if (fotoInput.files && fotoInput.files[0]) {
        fotoBase64 = await converterImagemBase64(fotoInput.files[0]);
    }

    
    const isColeta = empresaLogada.tipo === 'COLETA';
    const postagemData = {
        titulo: nomeEmpresa,
        descricao: document.getElementById('descricao').value,
        tipoResiduo: document.getElementById('tipoResiduo').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        diasDisponibilidade: diasSelecionados.join(','),
        horaInicio: horaInicio,
        horaFim: horaFim
    };

    if (isColeta) {
        
        if (fotoBase64) postagemData.fotoEmpresa = fotoBase64;
    } else {
        
        postagemData.enderecoRetirada = document.getElementById('enderecoRetirada').value;
        if (fotoBase64) postagemData.fotoResiduos = fotoBase64;
    }

    console.log('Dados da postagem:', postagemData);

    try {
        const response = await fetch('/api/postagens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postagemData)
        });
        
        console.log('Status da resposta:', response.status);
        
        if (response.ok) {
            const postagem = await response.json();
            console.log('Postagem cadastrada:', postagem);
            showPopup('Postagem cadastrada com sucesso! Ela ficará visível na vitrine após validação do administrador.', { type: 'success', buttons: [ { text: 'Gerenciar postagens', onClick: () => { window.location.href = 'editar_postagens.html'; } } ] });
        } else {
            const error = await response.text();
            console.error('Erro no cadastro:', error);
            showPopup('Erro ao cadastrar postagem: ' + error, { type: 'error' });
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        showPopup('Erro de conexão com o servidor.', { type: 'error' });
    } finally {
        if (formPostagem) {
            formPostagem.dataset.submitting = 'false';
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Cadastrar postagem';
        }
    }
}


function atualizarInterface() {
    const empresaLogada = obterEmpresaLogada();
    const userInfoElement = document.getElementById('userInfo');
    const subtitulo = document.getElementById('subtituloPostagem');
    
    if (empresaLogada && userInfoElement) {
        userInfoElement.innerHTML = `
            <span>Olá, ${empresaLogada.nome}</span>
            <span class="tipo-empresa">(${empresaLogada.tipo === 'DESCARTE' ? 'Descarte' : 'Coleta'})</span>
        `;
        
        
        if (subtitulo) {
            if (empresaLogada.tipo === 'DESCARTE') {
                subtitulo.textContent = 'Cadastre seus resíduos para que empresas de coleta possam encontrá-los';
            } else {
                subtitulo.textContent = 'Cadastre sua disponibilidade para coleta de resíduos';
            }
        }

            
            const linkPostagens = document.getElementById('linkPostagensTipo');
            if (linkPostagens) {
                linkPostagens.textContent = 'Postagens';
                linkPostagens.href = 'postagens.html';
            }
    }
    
    
    if (empresaLogada) {
        configurarCamposPorTipo(empresaLogada.tipo);
    }
}

async function sair() {
    if (window.authApp && typeof window.authApp.encerrarSessao === 'function') {
        await window.authApp.encerrarSessao();
    } else {
        localStorage.removeItem('empresaLogada');
    }

    window.location.href = 'login.html';
}


function converterImagemBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            console.log('Imagem convertida para Base64, tamanho:', reader.result.length, 'caracteres');
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(arquivo);
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página de cadastro de postagens inicializada');

    if (window.authApp && typeof window.authApp.exigirSessao === 'function') {
        const usuario = await window.authApp.exigirSessao({
            redirectPath: 'login.html',
            message: 'Você precisa fazer login primeiro!'
        });

        if (!usuario) {
            return;
        }
    }

    const empresaLogada = obterEmpresaLogada();
    if (!empresaLogada) {
        showPopup('Você precisa fazer login primeiro!', { type: 'info', buttons: [ { text: 'Ir para login', onClick: () => { window.location.href = 'login.html'; } } ] });
        return;
    }

    atualizarInterface();
    
    const nomeEmpresa = empresaLogada.nomeRazao || empresaLogada.nome;
    const nomeEmpresaInput = document.getElementById('nomeEmpresa');
    if (nomeEmpresaInput) nomeEmpresaInput.value = nomeEmpresa;
    
    const formPostagem = document.getElementById('formCadastroPostagem');
    if (formPostagem) {
        formPostagem.addEventListener('submit', cadastrarPostagem);
        console.log('Event listener adicionado ao formulário de postagem');
    }
    
    
    setupImagePreview();
});


function configurarCamposPorTipo(tipo) {
    const isColeta = tipo === 'COLETA';

    
    const labelTipoResiduo = document.querySelector('label[for="tipoResiduo"]');
    const labelPeso = document.querySelector('label[for="peso"]');
    const labelFoto = document.querySelector('label[for="foto"]');
    const labelEndereco = document.querySelector('label[for="enderecoRetirada"]');

    const inputEndereco = document.getElementById('enderecoRetirada');

    
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
            
            labelEndereco.style.display = 'none';
            inputEndereco.style.display = 'none';
            inputEndereco.required = false;
            inputEndereco.value = '';
        } else {
            
            labelEndereco.style.display = '';
            inputEndereco.style.display = '';
            inputEndereco.required = true;
        }
    }
    
    
    configurarMicroDicas(isColeta);
}


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