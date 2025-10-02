// FUNÇÕES DO POPUP
function showPopup(message) {
    document.getElementById("popup-message").textContent = message;
    document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

// PEGA O TIPO DA URL
function getTipoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo');
    console.log("🔍 Tipo da URL:", tipo);
    return tipo || 'DESCARTE'; // Padrão DESCARTE se não tiver
}

// EVENTO DE ENVIO DO FORMULÁRIO
document.getElementById("cadastroForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("🎯 Formulário de cadastro enviado!");

    // Coleta os dados do formulário
    const empresa = {
        nome: document.querySelector('input[name="nome"]').value,
        cnpj: document.querySelector('input[name="cnpj"]').value,
        endereco: document.querySelector('input[name="endereco"]').value,
        email: document.querySelector('input[name="email"]').value,
        senha: document.querySelector('input[name="senha"]').value,
        telefone: "", // Opcional - pode adicionar campo depois
        capacidadeColeta: null, // Só para empresas COLETA
        tipo: getTipoFromURL() // ✅ IMPORTANTE: Pega da URL!
    };

    console.log("📤 Dados enviados:", empresa);

    try {
        // Faz requisição para API
        const response = await fetch("http://localhost:8082/api/empresas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(empresa),
        });

        console.log("📥 Resposta do servidor:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Empresa criada com sucesso:", data);
            
            showPopup(`Conta criada com sucesso!\\nBem-vindo, ${data.nome}\\nTipo: ${data.tipo}`);
            
            // Redireciona para login após 3 segundos
            setTimeout(() => {
                window.location.href = "Login_Page.html";
            }, 3000);
            
        } else {
            const error = await response.text();
            console.log("❌ Erro no cadastro:", error);
            showPopup(`Erro no cadastro: ${error}`);
        }
    } catch (err) {
        console.log("💥 Erro de conexão:", err);
        showPopup("Não foi possível conectar ao servidor.");
    }
});

// LOG PARA DEBUG (opcional)
console.log("✅ Cadastro.js carregado!");
console.log("🔍 Tipo detectado:", getTipoFromURL());