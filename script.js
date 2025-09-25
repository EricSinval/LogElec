document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroResiduosForm");

  if (form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
    
      const tipo = document.getElementById("tipo").value;
      const peso = document.getElementById("peso").value;
      const endereco = document.getElementById("endereco").value;

      alert(
        `✅ Resíduo cadastrado com sucesso!\n\n` +
        `📦 Tipo: ${tipo}\n⚖️ Peso: ${peso}\n📍 Endereço: ${endereco}`
      );

      form.reset();
    });
  }
});
