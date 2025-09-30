console.log("✅ Login.js carregado!");

// FUNÇÕES DO POPUP
function showPopup(message) {
  console.log("📢 Mostrando popup:", message);
  document.getElementById("popup-message").innerText = message;
  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  console.log("🎯 Formulário enviado!");
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    email: formData.get("email"),
    senha: formData.get("senha")
  };

  console.log("📤 Enviando dados:", data);

  try {
    const response = await fetch("http://localhost:8093/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    console.log("📥 Resposta recebida, status:", response.status);

    if (response.ok) {
      const empresa = await response.json();
      console.log("✅ Login sucesso! Empresa:", empresa);
      
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
      console.log("❌ Login falhou");
      showPopup("Email ou senha inválidos ❌");
    }
  } catch (err) {
    console.log("💥 Erro:", err);
    showPopup("Erro de conexão com servidor");
  }
});

console.log("🎉 Event listener configurado!");