console.log("✅ Login.js carregado!");

// FUNÇÕES DO POPUP
function showPopup(message) {
    console.log("📢 Mostrando popup:", message);
    document.getElementById("popup-message").textContent = message;
    document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

// LOGIN - CÓDIGO CORRIGIDO
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM carregado, configurando event listener...");
    
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        console.log("✅ Formulário encontrado!");
        
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("🎯 Formulário enviado!");
            
            const formData = new FormData(e.target);
            const data = {
                email: formData.get("email"),
                senha: formData.get("senha")
            };

            console.log("📤 Dados enviados:", data);
            console.log("📤 Email:", data.email);
            console.log("📤 Senha (raw):", data.senha);
            console.log("📤 Senha (length):", data.senha.length);

            try {
                console.log("🔄 Fazendo requisição para: http://localhost:8082/api/auth/login");
                
                const response = await fetch("http://localhost:8082/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                console.log("📥 Status da resposta:", response.status);
                console.log("📥 Resposta OK?", response.ok);
                
                const responseText = await response.text();
                console.log("📥 Conteúdo da resposta:", responseText);

                if (response.ok) {
                    const empresa = JSON.parse(responseText);
                    console.log("✅ Login bem-sucedido!", empresa);
                    
                    // ✅ SALVAR EMPRESA NO LOCALSTORAGE
                    localStorage.setItem('empresaLogada', JSON.stringify(empresa));
                    
                    showPopup(`Login realizado com sucesso! Bem-vindo, ${empresa.nome} ✅`);
                    
                    setTimeout(() => {
                        console.log("🔄 Redirecionando para:", empresa.tipo);
                        if (empresa.tipo === "DESCARTE") {
                            window.location.href = "Postagem_Descarte.html";
                        } else if (empresa.tipo === "COLETA") {
                            window.location.href = "Postagem_Coleta.html";
                        } else {
                            window.location.href = "Home_Page.html";
                        }
                    }, 2000);
                    
                } else {
                    console.log("❌ Erro no login:", responseText);
                    showPopup("Email ou senha inválidos ❌");
                }
            } catch (err) {
                console.log("💥 Erro de conexão:", err);
                showPopup("Erro de conexão com servidor");
            }
        });
        
    } else {
        console.log("❌ Formulário de login não encontrado!");
    }
});

console.log("🎉 Event listener configurado!");