function showPopup(message) {
  document.getElementById("popup-message").innerText = message;
  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const data = {
    email: formData.get("email"),
    senha: formData.get("senha")
  };

  try {
    const response = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showPopup("Login realizado com sucesso ✅");
    } else {
      showPopup("Ocorreu um erro ❌");
    }
  } catch (err) {
    showPopup("Erro de conexão com servidor");
  }
});

document.getElementById("cadastroForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const data = {
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj"),
    endereco: formData.get("endereco"),
    email: formData.get("email"),
    senha: formData.get("senha")
  };

  try {
    const response = await fetch("http://localhost:8080/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showPopup("Cadastro realizado com sucesso 🎉");
    } else {
      showPopup("Erro ao cadastrar ❌");
    }
  } catch (err) {
    showPopup("Erro de conexão com servidor");
  }
});
