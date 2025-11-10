document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Agendamento.js carregado!");

  const form = document.getElementById("form-coleta");
  const botoesHorario = document.querySelectorAll(".turno button");
  let horarioSelecionado = null;

  // Configurar data mínima (hoje)
  const dataInput = document.getElementById("data");
  const hoje = new Date().toISOString().split('T')[0];
  dataInput.min = hoje;

  // Selecionar horário (destacar botão)
  botoesHorario.forEach(botao => {
    botao.addEventListener("click", () => {
      // remove seleção anterior
      botoesHorario.forEach(b => b.classList.remove("selecionado"));
      // marca o novo
      botao.classList.add("selecionado");
      horarioSelecionado = botao.innerText;
      console.log("⏰ Horário selecionado:", horarioSelecionado);
    });
  });

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = document.getElementById("data").value;
    const cliente = document.getElementById("cliente").value;

    if (!horarioSelecionado) {
      alert("Selecione um horário!");
      return;
    }

    if (!data) {
      alert("Selecione uma data!");
      return;
    }

    // Pegar empresa logada
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    
    if (!empresaLogada) {
      alert("Faça login para agendar uma coleta.");
      window.location.href = "Login_Page.html";
      return;
    }

    // Combinar data + horário para criar dataHora completa
    const dataHora = `${data}T${horarioSelecionado}:00`;

    // Montar objeto do agendamento CORRETO para o back-end
    const agendamento = {
      postagemId: 1, // ⚠️ ATENÇÃO: Você precisa pegar o ID da postagem real
      empresaSolicitanteId: empresaLogada.id,
      empresaColetoraId: 2, // ⚠️ ATENÇÃO: Você precisa pegar o ID da empresa coletora real
      dataHora: dataHora,
      status: "AGENDADA" // ⚠️ Use os status do seu banco: AGENDADA, CONFIRMADA, CANCELADA, REALIZADA
    };

    console.log("📅 Tentando agendar:", agendamento);

    try {
      const response = await fetch("http://localhost:8080/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(agendamento)
      });

      if (response.ok) {
        alert("Agendamento realizado com sucesso!");
        form.reset();
        botoesHorario.forEach(b => b.classList.remove("selecionado"));
        horarioSelecionado = null;
      } else {
        const erro = await response.text();
        alert("Erro ao agendar: " + erro);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  });
});

// Função do menu dropdown
function toggleMenu() {
  const dropdown = document.getElementById("dropdown");
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

// Fechar menu ao clicar fora
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("dropdown");
  const menuIcon = document.querySelector(".menu-icon");
  
  if (!menuIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});