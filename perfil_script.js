document.addEventListener("DOMContentLoaded", () => {
  const perfilForm = document.getElementById("perfilForm");

  if (perfilForm) {
    perfilForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;

      alert(
        `✅ Perfil atualizado com sucesso!\n\n` +
        `👤 Nome: ${nome}\n📧 Email: ${email}`
      );

      perfilForm.reset();
    });
  }
});
