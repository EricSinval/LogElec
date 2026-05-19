console.log('Editar Postagens - Script carregado');

let postagemSelecionada = null;
let postagens = [];
let empresaLogadaAtual = null;

function formatarDataHora(valor) {
    if (!valor) return 'Não informado';

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;

    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function classeStatusModeracao(status) {
    const valor = (status || 'PENDENTE').toString().toUpperCase();

    if (valor === 'APROVADA') return 'aprovada';
    if (valor === 'REJEITADA') return 'rejeitada';
    if (valor === 'BLOQUEADA') return 'bloqueada';
    return 'pendente';
}

function encontrarIndicePostagemPorId(id) {
    return postagens.findIndex((postagem) => Number(postagem.id) === Number(id));
}

window.addEventListener('load', function() {
    console.log('Página carregada, inicializando...');
    inicializar();
});

async function inicializar() {
    const autenticado = await verificarAutenticacao();
    if (!autenticado) {
        return;
    }

    carregarPostagens();
}

async function verificarAutenticacao() {
    if (window.authApp && typeof window.authApp.exigirSessao === 'function') {
        const empresa = await window.authApp.exigirSessao({
            redirectPath: 'login.html',
            message: 'Você precisa fazer login primeiro!'
        });

        if (!empresa) {
            return false;
        }

        empresaLogadaAtual = empresa;
    } else {
        const empresaLogada = localStorage.getItem('empresaLogada');
        if (!empresaLogada) {
            window.location.href = 'login.html';
            return false;
        }

        empresaLogadaAtual = JSON.parse(empresaLogada);
    }

    document.getElementById('nomeEmpresa').value = empresaLogadaAtual.nomeRazao || empresaLogadaAtual.nome || '';
    document.getElementById('linkPostagensTipo').textContent = 'Postagens';

    configurarCamposPorTipo();
    return true;
}

function obterTipoEmpresa() {
    return (empresaLogadaAtual && (empresaLogadaAtual.tipo || empresaLogadaAtual.tipoEmpresa)) || '';
}

function normalizarStatusPostagem(status) {
    const statusNormalizado = (status || 'ABERTA').toString().toUpperCase();

    if (statusNormalizado === 'FECHADA' || statusNormalizado === 'FINALIZADA') {
        return 'ENCERRADA';
    }

    if (['ABERTA', 'PAUSADA', 'ENCERRADA', 'CANCELADA'].includes(statusNormalizado)) {
        return statusNormalizado;
    }

    return 'ABERTA';
}

function configurarCamposPorTipo() {
    const isColeta = obterTipoEmpresa() === 'COLETA';
    const labelEndereco = document.querySelector('label[for="enderecoRetirada"]');
    const inputEndereco = document.getElementById('enderecoRetirada');
    const hintEndereco = document.getElementById('hintEndereco');

    if (!inputEndereco || !labelEndereco) {
        return;
    }

    if (isColeta) {
        labelEndereco.style.display = 'none';
        inputEndereco.style.display = 'none';
        inputEndereco.required = false;
        if (hintEndereco) {
            hintEndereco.style.display = 'none';
        }
    } else {
        labelEndereco.style.display = '';
        inputEndereco.style.display = '';
        inputEndereco.required = true;
        if (hintEndereco) {
            hintEndereco.style.display = '';
        }
    }
}

async function carregarPostagens() {
    try {
        console.log('Carregando postagens da empresa autenticada');

        const response = await fetch('http://localhost:8080/api/postagens/empresa/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar postagens');
        }

        postagens = await response.json();
        console.log('Postagens carregadas:', postagens);

        exibirListaPostagens();
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        document.getElementById('listaPostagens').innerHTML = 
            '<p class="loading" style="color: red;">Erro ao carregar postagens</p>';
    }
}

function exibirListaPostagens() {
    const container = document.getElementById('listaPostagens');
    
    if (postagens.length === 0) {
        container.innerHTML = '<p class="loading">Nenhuma postagem encontrada</p>';
        return;
    }

    container.innerHTML = postagens.map((postagem, index) => `
        <div class="item-postagem" onclick="selecionarPostagem(${index})" data-id="${postagem.id}">
            <div class="item-postagem-titulo">${postagem.titulo || postagem.tipoResiduo || 'Postagem sem título'}</div>
            <div class="item-postagem-tipo">${postagem.tipoResiduo || 'N/A'} | Moderação: ${normalizarStatusModeracao(postagem.statusModeracao)}</div>
        </div>
    `).join('');
}

function normalizarStatusModeracao(status) {
    const valor = (status || 'PENDENTE').toString().toUpperCase();
    const mapa = {
        PENDENTE: 'Pendente',
        APROVADA: 'Aprovada',
        REJEITADA: 'Rejeitada',
        BLOQUEADA: 'Bloqueada'
    };
    return mapa[valor] || 'Pendente';
}

function selecionarPostagem(index) {
    console.log('Selecionando postagem índice:', index);
    
    postagemSelecionada = postagens[index];
    
    
    document.querySelectorAll('.item-postagem').forEach((item, i) => {
        item.classList.toggle('ativo', i === index);
    });

    
    document.getElementById('mensagemEscolher').style.display = 'none';
    const formulario = document.getElementById('formEdicaoPostagem');
    formulario.style.display = 'flex';

    
    preencherFormulario(postagemSelecionada);
}

function preencherFormulario(postagem) {
    console.log('Preenchendo formulário com:', postagem);

    document.getElementById('descricao').value = postagem.descricao || '';
    document.getElementById('tipoResiduo').value = postagem.tipoResiduo || '';
    document.getElementById('peso').value = postagem.peso || '';
    document.getElementById('maxPesoColeta').value = postagem.maxPesoColeta || '';
    document.getElementById('enderecoRetirada').value = postagem.enderecoRetirada || '';
    document.getElementById('horaInicio').value = postagem.horaInicio || '';
    document.getElementById('horaFim').value = postagem.horaFim || '';
    document.getElementById('status').value = normalizarStatusPostagem(postagem.status);

    
    document.querySelectorAll('input[name="dia"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    if (postagem.diasDisponibilidade) {
        const dias = postagem.diasDisponibilidade.split(',');
        document.querySelectorAll('input[name="dia"]').forEach(checkbox => {
            if (dias.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }

    
    const fotoAtual = postagem.fotoResiduos || postagem.fotoEmpresa;
    if (fotoAtual) {
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('imagePreview').src = fotoAtual;
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }

    
    document.getElementById('foto').value = '';
        renderizarPainelModeracao(postagem);
}

    function renderizarPainelModeracao(postagem) {
        const painel = document.getElementById('painelModeracao');
        const resumo = document.getElementById('resumoModeracaoAtual');
        const historicoLista = document.getElementById('historicoModeracaoLista');

        if (!painel || !resumo || !historicoLista) {
            return;
        }

        painel.hidden = false;

        const statusAtual = normalizarStatusModeracao(postagem.statusModeracao);
        const classeAtual = classeStatusModeracao(postagem.statusModeracao);
        const historico = Array.isArray(postagem.historicoModeracao) ? postagem.historicoModeracao : [];
        const decisoesAnteriores = historico.slice(1);
        const motivoAtual = postagem.motivoModeracao || '';
        const moderadoPorAtual = postagem.moderadoPor || 'Administrador não informado';
        const moderadoEmAtual = postagem.moderadoEm ? formatarDataHora(postagem.moderadoEm) : 'Ainda sem decisão administrativa';

        resumo.classList.toggle('sem-historico', historico.length === 0 && classeAtual === 'pendente');
        resumo.innerHTML = `
            <div class="resumo-moderacao-topo">
                <strong>Status atual da moderação</strong>
                <span class="moderacao-status-badge ${classeAtual}">${statusAtual}</span>
            </div>
            <div class="resumo-moderacao-meta">
                <span><strong>Administrador:</strong> ${moderadoPorAtual}</span>
                <span><strong>Data da última decisão:</strong> ${moderadoEmAtual}</span>
            </div>
            ${motivoAtual ? `<div class="resumo-moderacao-motivo"><strong>Motivo atual:</strong> ${motivoAtual}</div>` : '<div class="resumo-moderacao-motivo"><strong>Motivo atual:</strong> Nenhuma observação ativa no momento.</div>'}
        `;

        if (!historico.length) {
            historicoLista.innerHTML = '<div class="historico-moderacao-vazio">Ainda não há decisões de moderação registradas para esta postagem.</div>';
            return;
        }

        if (!decisoesAnteriores.length) {
            historicoLista.innerHTML = '<div class="historico-moderacao-vazio">Esta é a primeira decisão registrada para esta postagem. Quando houver novas revisões, as anteriores aparecerão aqui.</div>';
            return;
        }

        historicoLista.innerHTML = decisoesAnteriores.map((item, index) => `
            <article class="moderacao-item">
                <div class="moderacao-item-topo">
                    <span class="moderacao-item-titulo">Decisão anterior ${index + 1}</span>
                    <span class="moderacao-status-badge ${classeStatusModeracao(item.statusModeracao)}">${normalizarStatusModeracao(item.statusModeracao)}</span>
                </div>
                <div class="moderacao-item-meta">
                    <span><strong>Administrador:</strong> ${item.moderadoPor || 'Administrador não informado'}</span>
                    <span><strong>Data:</strong> ${formatarDataHora(item.moderadoEm)}</span>
                </div>
                <div class="moderacao-item-motivo"><strong>Motivo:</strong> ${item.motivoModeracao || 'Sem observações.'}</div>
            </article>
        `).join('');
    }

document.getElementById('formEdicaoPostagem').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formEdicao = document.getElementById('formEdicaoPostagem');
    const btn = formEdicao ? formEdicao.querySelector('.btn-salvar') : document.querySelector('.btn-salvar');

    if (formEdicao && formEdicao.dataset.submitting === 'true') {
        return;
    }
    
    if (!postagemSelecionada) {
        showPopup('Nenhuma postagem selecionada', { type: 'error' });
        return;
    }

    if (formEdicao) {
        formEdicao.dataset.submitting = 'true';
    }

    console.log('Salvando alterações para postagem ID:', postagemSelecionada.id);

    const diasSelecionados = Array.from(document.querySelectorAll('input[name="dia"]:checked'))
        .map(cb => cb.value)
        .join(',');

    const tipoEmpresa = obterTipoEmpresa();
    const isColeta = tipoEmpresa === 'COLETA';

    const dadosAtualizados = {
        titulo: postagemSelecionada.titulo || document.getElementById('tipoResiduo').value,
        descricao: document.getElementById('descricao').value,
        tipoResiduo: document.getElementById('tipoResiduo').value,
        peso: parseFloat(document.getElementById('peso').value) || 0,
        maxPesoColeta: parseFloat(document.getElementById('maxPesoColeta').value) || 0,
        enderecoRetirada: isColeta ? null : document.getElementById('enderecoRetirada').value,
        horaInicio: document.getElementById('horaInicio').value || null,
        horaFim: document.getElementById('horaFim').value || null,
        status: normalizarStatusPostagem(document.getElementById('status').value),
        diasDisponibilidade: diasSelecionados
    };

    const fotoInput = document.getElementById('foto');
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        const fotoBase64 = await converterImagemBase64(fotoInput.files[0]);

        if (isColeta) {
            dadosAtualizados.fotoEmpresa = fotoBase64;
        } else {
            dadosAtualizados.fotoResiduos = fotoBase64;
        }
    }

    console.log('Dados a atualizar:', dadosAtualizados);

    const textOriginal = btn ? btn.textContent : 'Salvar Alterações';

    try {
        if (btn) {
            btn.textContent = 'Salvando...';
            btn.disabled = true;
        }

        const response = await fetch(`http://localhost:8080/api/postagens/${postagemSelecionada.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        console.log('Status resposta:', response.status);

        if (response.ok) {
            const postagemAtualizada = await response.json();
            console.log('Postagem atualizada:', postagemAtualizada);

            await carregarPostagens();
            const indiceAtualizado = encontrarIndicePostagemPorId(postagemAtualizada.id);
            if (indiceAtualizado !== -1) {
                selecionarPostagem(indiceAtualizado);
            }

            showPopup('Postagem atualizada com sucesso! Ela retornou para validação administrativa.', {
                type: 'success',
                buttons: [{ text: 'OK', onClick: () => {} }]
            });
        } else {
            const erro = await response.text();
            console.error('Erro na resposta:', erro);
            showPopup('Erro ao salvar postagem: ' + (erro || 'Requisição inválida'), { type: 'error' });
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        showPopup('Erro de conexão ao salvar postagem', { type: 'error' });
    } finally {
        if (formEdicao) {
            formEdicao.dataset.submitting = 'false';
        }
        if (btn) {
            btn.textContent = textOriginal;
            btn.disabled = false;
        }
    }
});

function confirmarDelecao() {
    if (!postagemSelecionada) {
        showPopup('Nenhuma postagem selecionada', { type: 'error' });
        return;
    }

    showPopup('Tem certeza que deseja deletar esta postagem? Esta ação não pode ser desfeita.', {
        type: 'warning',
        buttons: [
            { text: 'Cancelar', onClick: () => {} },
            { 
                text: 'Deletar', 
                onClick: () => deletarPostagem()
            }
        ]
    });
}

async function deletarPostagem() {
    if (!postagemSelecionada) return;

    const postagemId = postagemSelecionada.id;

    console.log('Deletando postagem ID:', postagemId);

    try {
        const response = await fetch(`http://localhost:8080/api/postagens/${postagemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Status resposta delete:', response.status);

        if (response.ok) {
            showPopup('Postagem deletada com sucesso!', {
                type: 'success',
                buttons: [{ 
                    text: 'OK', 
                    onClick: () => {
                        postagens = postagens.filter(p => p.id !== postagemId);
                        postagemSelecionada = null;
                        cancelarEdicao();
                        exibirListaPostagens();
                    }
                }]
            });
        } else {
            const erro = await response.text();
            console.error('Erro na deletação:', erro);
            showPopup('Erro ao deletar postagem: ' + (erro || 'Não foi possível excluir'), { type: 'error' });
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        showPopup('Erro de conexão ao deletar postagem', { type: 'error' });
    }
}

function cancelarEdicao() {
    console.log('Cancelando edição');
    
    postagemSelecionada = null;
    document.getElementById('formEdicaoPostagem').style.display = 'none';
    document.getElementById('mensagemEscolher').style.display = 'flex';
    document.querySelectorAll('.item-postagem').forEach(item => {
        item.classList.remove('ativo');
    });
    document.getElementById('formEdicaoPostagem').reset();
    document.getElementById('painelModeracao').hidden = true;
}

function converterImagemBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(arquivo);
    });
}

function configurarPreviewImagem() {
    const fotoInput = document.getElementById('foto');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreview');

    if (!fotoInput || !previewContainer || !previewImg) {
        return;
    }

    fotoInput.addEventListener('change', function(event) {
        const arquivo = event.target.files && event.target.files[0];
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(loadEvent) {
            previewImg.src = loadEvent.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(arquivo);
    });
}

configurarPreviewImagem();
