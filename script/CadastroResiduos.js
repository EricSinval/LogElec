console.log("✅ CadastroResiduos.js carregado!");

// FUNÇÕES DO POPUP
function showPopup(message) {
    console.log("📢 Mostrando popup:", message);
    // Criar popup dinâmico se não existir
    let popup = document.getElementById("popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "popup";
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
            align-items: center; z-index: 1000;
        `;
        
        const popupContent = document.createElement("div");
        popupContent.style.cssText = `
            background: white; padding: 20px; border-radius: 8px; text-align: center;
        `;
        
        const messageEl = document.createElement("span");
        messageEl.id = "popup-message";
        
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "OK";
        closeBtn.onclick = closePopup;
        
        popupContent.appendChild(messageEl);
        popupContent.appendChild(closeBtn);
        popup.appendChild(popupContent);
        document.body.appendChild(popup);
    }
    
    document.getElementById("popup-message").textContent = message;
    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "none";
    }
}

// VARIÁVEL PARA CONTROLAR SE JÁ ESTÁ ENVIANDO
let isSubmitting = false;

// CADASTRO DE RESÍDUO - COM PROTEÇÃO CONTRA DUPLICAÇÃO
function configurarFormulario() {
    const form = document.getElementById("cadastroResiduosForm");
    
    if (!form) {
        console.log("❌ Formulário não encontrado");
        return;
    }
    
    // Remover event listeners antigos para evitar duplicação
    form.replaceWith(form.cloneNode(true));
    const newForm = document.getElementById("cadastroResiduosForm");
    
    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Proteção contra duplo clique
        if (isSubmitting) {
            console.log("⏳ Formulário já está enviando...");
            return;
        }
        
        isSubmitting = true;
        console.log("🎯 Formulário enviado!");

        // Coletar dados do formulário
        const formData = new FormData(e.target);
        
        // Pegar empresa logada
        const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
        
        if (!empresaLogada || !empresaLogada.id) {
            showPopup("Erro: Empresa não identificada. Faça login novamente.");
            isSubmitting = false;
            setTimeout(() => {
                window.location.href = "Login_Page.html";
            }, 2000);
            return;
        }

        // Extrair apenas o número do peso (remover "kg")
        const pesoCompleto = formData.get("peso");
        const pesoNumerico = parseFloat(pesoCompleto.replace(/[^0-9.,]/g, '').replace(',', '.'));

        // Criar objeto com os dados
        const residuoData = {
            nome: formData.get("tipo"),
            descricao: "Resíduos para descarte",
            categoria: "OUTROS",
            peso: pesoNumerico,
            endereco: formData.get("endereco"),
            empresaId: empresaLogada.id
        };

        console.log("📤 Dados do resíduo:", residuoData);

        try {
            const response = await fetch("http://localhost:8082/api/residuos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(residuoData),
            });

            console.log("📥 Resposta do servidor:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Resíduo cadastrado com sucesso:", data);
                
                showPopup(`Resíduo cadastrado com sucesso!\\nTipo: ${data.nome}\\nPeso: ${data.peso}kg`);
                
                // Limpar formulário
                e.target.reset();
                
            } else {
                const error = await response.text();
                console.log("❌ Erro no cadastro:", error);
                showPopup(`Erro no cadastro: ${error}`);
            }
        } catch (err) {
            console.log("💥 Erro de conexão:", err);
            showPopup("Não foi possível conectar ao servidor.");
        } finally {
            // Liberar o formulário para novo envio
            isSubmitting = false;
        }
    });
    
    console.log("✅ Formulário configurado com proteção contra duplicação");
}

// VERIFICAR SE EMPRESA ESTÁ LOGADA
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando CadastroResiduos...");
    
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (!empresaLogada) {
        showPopup("Sessão expirada. Faça login novamente.");
        setTimeout(() => {
            window.location.href = "Login_Page.html";
        }, 2000);
        return;
    }
    
    const empresa = JSON.parse(empresaLogada);
    console.log("🏢 Empresa logada:", empresa);
    
    // Configurar formulário
    configurarFormulario();
});

console.log("✅ CadastroResiduos.js configurado!");