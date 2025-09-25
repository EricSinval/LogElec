const form = document.getElementById("cadastroForm");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");

// Função para exibir o popup
function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
}

// Função para fechar o popup
function closePopup() {
  popup.classList.add("hidden");
}

// Evento de envio do formulário
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Coleta os dados do formulário
  const usuario = {
    nome: form.nome.value,
    cnpj: form.cnpj.value,
    endereco: form.endereco.value,
    email: form.email.value,
    senha: form.senha.value,
  };

  try {
    // Faz requisição para API em Java (Spring Boot por exemplo)
    const response = await fetch("http://localhost:8080/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    if (response.ok) {
      const data = await response.json();
      showPopup(`Conta criada com sucesso!\nBem-vindo, ${data.nome}`);
      form.reset();
    } else {
      const error = await response.text();
      showPopup(`Erro: ${error}`);
    }
  } catch (err) {
    showPopup("Não foi possível conectar ao servidor.");
  }
});