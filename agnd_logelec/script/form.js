   document.addEventListener("DOMContentLoaded", () => {
      const botoesHorario = document.querySelectorAll(".turno button");
      const inputHorario = document.getElementById("horario");
      const form = document.getElementById("form-coleta");
      const mensagem = document.getElementById("mensagem-retorno");

      // Selecionar horário
      botoesHorario.forEach(botao => {
        botao.addEventListener("click", () => {
          botoesHorario.forEach(b => b.classList.remove("selecionado"));
          botao.classList.add("selecionado");
          inputHorario.value = botao.innerText;
        });
      });

      // Enviar formulário sem recarregar
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!inputHorario.value) {
          mensagem.textContent = "Selecione um horário antes de agendar!";
          mensagem.className = "mensagem erro";
          return;
        }

        const dados = {
          data: document.getElementById("data").value,
          horario: inputHorario.value,
          cliente: document.getElementById("cliente").value
        };

        try {
          const response = await fetch("http://localhost:8080/api/agendamentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
          });

          if (response.ok) {
            mensagem.textContent = "Agendamento concluído com sucesso!";
            mensagem.className = "mensagem sucesso";
            form.reset();
            botoesHorario.forEach(b => b.classList.remove("selecionado"));
            inputHorario.value = "";
          } else {
            mensagem.textContent = "Ocorreu um erro. Tente novamente.";
            mensagem.className = "mensagem erro";
          }
        } catch (error) {
          mensagem.textContent = "Ocorreu um erro. Tente novamente.";
          mensagem.className = "mensagem erro";
        }
      });
    });