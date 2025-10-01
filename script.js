// cadastro.js - VERSÃO CORRIGIDA
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cadastroResiduosForm");

    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
    
    // Testar conexão com backend ao carregar a página
    testarBackend();
});

// Função para salvar no localStorage
function salvarNoLocalStorage(dadosFormulario, respostaAPI) {
    try {
        const residuoParaLocalStorage = {
            id: respostaAPI.id || Date.now(),
            nomeEmpresa: "Tech Solutions",
            tipoResiduo: dadosFormulario.tipo,
            peso: dadosFormulario.peso,
            endereco: dadosFormulario.endereco,
            enderecoRetirada: dadosFormulario.endereco, // ADICIONADO para compatibilidade
            status: 'PENDENTE',
            dataCadastro: new Date().toISOString()
        };
        
        let residuosExistentes = JSON.parse(localStorage.getItem('empresasCadastradas')) || [];
        residuosExistentes.push(residuoParaLocalStorage);
        localStorage.setItem('empresasCadastradas', JSON.stringify(residuosExistentes));
        
        console.log('💾 Salvo no localStorage:', dadosFormulario.endereco);
        console.log('📊 Total no localStorage:', residuosExistentes.length);
    } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error);
    }
}

// Função principal de submit do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Coletar dados do formulário
    const tipo = document.getElementById('tipo').value;
    const peso = document.getElementById('peso').value;
    const endereco = document.getElementById('endereco').value;
    const foto = document.getElementById('foto').files[0];
    
    console.log('📍 DADOS DO FORMULÁRIO:');
    console.log('Tipo:', tipo);
    console.log('Peso:', peso);
    console.log('Endereço:', endereco);
    console.log('Foto:', foto ? foto.name : 'Nenhuma');
    
    // Validar campos obrigatórios
    if (!tipo || !peso || !endereco) {
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    // Criar FormData para envio
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('peso', peso);
    formData.append('endereco', endereco);
    formData.append('enderecoRetirada', endereco); // ADICIONADO para API
    
    if (foto) {
        formData.append('foto', foto);
    }
    
    formData.append('empresaId', '3');
    
    try {
        // Mostrar loading
        const button = event.target.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Cadastrando...';
        button.disabled = true;
        
        console.log('🔄 Enviando dados para API...');
        
        // Fazer requisição para o backend
        const response = await fetch('http://localhost:8093/api/residuos', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const residuoCadastrado = await response.json();
            console.log('✅ Resposta da API:', residuoCadastrado);
            
            // SALVAR NO LOCALSTORAGE também
            salvarNoLocalStorage({ tipo, peso, endereco }, residuoCadastrado);
            
            alert(`✅ Resíduo cadastrado com sucesso!\n\n📦 Tipo: ${tipo}\n⚖️ Peso: ${peso}kg\n📍 Endereço: ${endereco}\n\nRedirecionando...`);
            document.getElementById('cadastroResiduosForm').reset();
            
            // REDIRECIONAMENTO CORRIGIDO
            setTimeout(() => {
                console.log('🔄 Redirecionando para postagemdesc.html');
                window.location.href = 'postagemdesc.html';
            }, 2000);
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            alert('❌ Erro ao cadastrar: ' + erro);
        }
        
    } catch (error) {
        console.error('❌ Erro de conexão:', error);
        alert('❌ Erro de conexão com o servidor. Verifique se o backend está rodando.');
        
        // FALLBACK: Salvar apenas no localStorage
        const dadosFormulario = { tipo, peso, endereco };
        salvarNoLocalStorage(dadosFormulario, { id: Date.now() });
        alert('✅ Cadastrado localmente (backend offline). Redirecionando...');
        
        setTimeout(() => {
            window.location.href = 'postagemdesc.html';
        }, 2000);
    } finally {
        // Restaurar botão
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.textContent = 'Cadastrar Resíduo';
            button.disabled = false;
        }
    }
}

// Função para testar conexão com backend
async function testarBackend() {
    try {
        console.log('🧪 Testando conexão com backend...');
        const response = await fetch('http://localhost:8093/api/residuos');
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
            return true;
        } else {
            console.warn('⚠️ Backend com problemas, status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Backend offline:', error);
        return false;
    }
}

// Função do menu dropdown
function toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown) {
        if (dropdown.style.display === "flex") {
            dropdown.style.display = "none";
        } else {
            dropdown.style.display = "flex";
        }
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdown');
    const headerIcons = document.querySelector('.header-icons');
    
    if (dropdown && headerIcons && !headerIcons.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});