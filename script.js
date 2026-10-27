function mostrarPonto(nome) {
    const locais = {
        "EcoPonto Verde": {
            distancia: "300 metros",
            materiais: "Plástico, papel e papelão",
            endereco: "Rua das Flores, 10",
            horario: "08:00 às 17:00"
        },

        "Centro de Reciclagem": {
            distancia: "600 metros",
            materiais: "Vidro, metal e plástico",
            endereco: "Avenida Central, 200",
            horario: "09:00 às 16:00"
        },

        "Coleta Sustentável": {
            distancia: "850 metros",
            materiais: "Papelão, papel e eletrônicos",
            endereco: "Praça da Área Verde",
            horario: "10:00 às 15:00"
        }
    };

    const local = locais[nome];
    const informacao = document.getElementById("informacao");

    if (!local || !informacao) return;

    // Remove a marcação de todos os pontos
    document.querySelectorAll(".reciclagem").forEach(ponto => {
        ponto.classList.remove("selecionado");
        ponto.setAttribute("aria-pressed", "false");
    });

    // Marca o ponto selecionado
    const botoes = document.querySelectorAll(".reciclagem");

    botoes.forEach(botao => {
        if (botao.getAttribute("onclick").includes(nome)) {
            botao.classList.add("selecionado");
            botao.setAttribute("aria-pressed", "true");
        }
    });

    // Atualiza as informações do local
    informacao.innerHTML = `
        <h3>♻️ ${nome}</h3>

        <p>
            <strong>Distância:</strong>
            ${local.distancia}
        </p>

        <p>
            <strong>Materiais aceitos:</strong>
            ${local.materiais}
        </p>

        <p>
            <strong>Endereço:</strong>
            ${local.endereco}
        </p>

        <p>
            <strong>Horário:</strong>
            ${local.horario}
        </p>
    `;
}


document.querySelectorAll(".faq-pergunta").forEach(botao => {
    botao.addEventListener("click", () => {
      const card = botao.closest(".faq-card");
      const aberto = card.classList.toggle("aberto");

      botao.setAttribute("aria-expanded", aberto);
    });
  });