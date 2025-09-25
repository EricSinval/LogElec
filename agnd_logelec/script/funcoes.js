document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-coleta");
  const botoesHorario = document.querySelectorAll(".turno button");
  let horarioSelecionado = null;

  // Selecionar horário (destacar botão)
  botoesHorario.forEach(botao => {
    botao.addEventListener("click", () => {
      // remove seleção anterior
      botoesHorario.forEach(b => b.classList.remove("selecionado"));
      // marca o novo
      botao.classList.add("selecionado");
      horarioSelecionado = botao.innerText;
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

    // Montar objeto do agendamento
    const agendamento = {
      data: data,
      horario: horarioSelecionado,
      cliente: cliente
    };

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
})

