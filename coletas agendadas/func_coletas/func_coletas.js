async function carregarColetas() {
  // Mudem pra api que fizerem:
  // const response = await fetch("/api/coletas/historico");
  // const coletas = await resposta.json();

 
  const coletas = [
    {
      empresa: "E-WASTE",
      descricao: "Todos os tipos de resíduos eletrônicos.",
      pesoMax: "500Kg",
      data: "01/11/2025",
      horario: "17:00",
      status: "Cancelar",
      logo: "/img_coletas/e_weste.jpg"
    },
    {
      empresa: "EcoTech",
      descricao: "Desktops e laptops antigos e novos.",
      pesoMax: "1000Kg",
      data: "14/12/2027",
      horario: "15:30",
      status: "Cancelar",
      logo: "/img_coletas/ecotech.jpg"
    },
  
  ];

  renderizarColetas(coletas);
}

function renderizarColetas(coletas) {
  const container = document.getElementById("lista-coletas");
  container.innerHTML = "";

  coletas.forEach(c => {
    const card = document.createElement("div");
    card.classList.add("coleta-card");

    card.innerHTML = `
      <div class="coleta-info">
        <img src="${c.logo}" alt="${c.empresa}">
        <div class="coleta-texto">
          <h3>${c.empresa}</h3>
          <p>Tipos: ${c.descricao}</p>
          <p>Peso máx: ${c.pesoMax}</p>
        </div>
      </div>
      <div>
        <p>Data: ${c.data}</p>
        <p>Horário: ${c.horario}</p>
        <button class="status-btn">${c.status}</button>
      </div>
    `;

    container.appendChild(card);
  });
}


window.onload = carregarColetas;