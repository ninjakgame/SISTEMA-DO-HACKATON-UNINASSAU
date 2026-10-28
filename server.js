
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORTA = 3000;

// Cria ou abre o arquivo do banco de dados.
const db = new Database(
  path.join(__dirname, "reciclagem.db")
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Cria a tabela de dúvidas.
db.exec(`
  CREATE TABLE IF NOT EXISTS duvidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    categoria TEXT DEFAULT 'Geral'
  );

  CREATE TABLE IF NOT EXISTS pontos_coleta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL,
    materiais TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL
  );
`);

// Adiciona exemplos somente se as tabelas estiverem vazias.
const totalDuvidas = db
  .prepare("SELECT COUNT(*) AS total FROM duvidas")
  .get().total;

if (totalDuvidas === 0) {
  const inserirDuvida = db.prepare(`
    INSERT INTO duvidas (pergunta, resposta, categoria)
    VALUES (?, ?, ?)
  `);

  inserirDuvida.run(
    "O que é reciclagem?",
    "É o processo de reaproveitar materiais descartados para produzir novos materiais ou produtos.",
    "Geral"
  );

  inserirDuvida.run(
    "Quais materiais podem ser reciclados?",
    "Papel, papelão, diversos plásticos, metais e vidros podem ser reciclados, dependendo das regras locais.",
    "Materiais"
  );

  inserirDuvida.run(
    "Preciso lavar as embalagens?",
    "Retire os restos de alimentos e líquidos. Uma limpeza simples ajuda a evitar contaminação.",
    "Descarte"
  );
}

const totalPontos = db
  .prepare("SELECT COUNT(*) AS total FROM pontos_coleta")
  .get().total;

if (totalPontos === 0) {
  const inserirPonto = db.prepare(`
    INSERT INTO pontos_coleta
      (nome, endereco, materiais, x, y)
    VALUES (?, ?, ?, ?, ?)
  `);

  inserirPonto.run(
    "Ponto de Reciclagem Central",
    "Praça Central — endereço demonstrativo",
    "Papel, plástico e metal",
    25,
    30
  );

  inserirPonto.run(
    "Coleta do Bairro Verde",
    "Rua das Flores — endereço demonstrativo",
    "Plástico e vidro",
    65,
    45
  );

  inserirPonto.run(
    "Ponto Sustentável",
    "Avenida das Árvores — endereço demonstrativo",
    "Papel, metal e vidro",
    45,
    75
  );
}

// Entrega as dúvidas ao site.
app.get("/api/duvidas", (req, res) => {
  const duvidas = db.prepare(`
    SELECT id, pergunta, resposta, categoria
    FROM duvidas
    ORDER BY id
  `).all();

  res.json(duvidas);
});

// Entrega os pontos de coleta ao site.
app.get("/api/pontos", (req, res) => {
  const pontos = db.prepare(`
    SELECT id, nome, endereco, materiais, x, y
    FROM pontos_coleta
    ORDER BY id
  `).all();

  res.json(pontos);
});

app.listen(PORTA, "127.0.0.1", () => {
  console.log(
    `Site disponível em http://127.0.0.1:${PORTA}`
  );
});


const mapa = document.getElementById("mapa");
const detalhesPonto = document.getElementById("detalhes-ponto");
const listaDuvidas = document.getElementById("lista-duvidas");

async function carregarPontos() {
  try {
    const resposta = await fetch("/api/pontos");

    if (!resposta.ok) {
      throw new Error("Erro ao buscar os pontos.");
    }

    const pontos = await resposta.json();

    mapa.replaceChildren();

    pontos.forEach((ponto) => {
      const marcador = document.createElement("button");

      marcador.className = "marcador";
      marcador.textContent = `♻ ${ponto.nome}`;
      marcador.style.left = `${ponto.x}%`;
      marcador.style.top = `${ponto.y}%`;
      marcador.setAttribute(
        "aria-label",
        `Ver detalhes de ${ponto.nome}`
      );

      marcador.addEventListener("click", () => {
        document.querySelectorAll(".marcador")
          .forEach((item) => item.classList.remove("selecionado"));

        marcador.classList.add("selecionado");

        detalhesPonto.replaceChildren();

        const titulo = document.createElement("h3");
        titulo.textContent = ponto.nome;

        const endereco = document.createElement("p");
        endereco.textContent = `Endereço: ${ponto.endereco}`;

        const materiais = document.createElement("p");
        materiais.textContent = `Materiais aceitos: ${ponto.materiais}`;

        detalhesPonto.append(titulo, endereco, materiais);
      });

      mapa.appendChild(marcador);
    });
  } catch (erro) {
    mapa.textContent = "Não foi possível carregar os pontos de coleta.";
    console.error(erro);
  }
}

async function carregarDuvidas() {
  try {
    const resposta = await fetch("/api/duvidas");

    if (!resposta.ok) {
      throw new Error("Erro ao buscar as dúvidas.");
    }

    const duvidas = await resposta.json();

    listaDuvidas.replaceChildren();

    duvidas.forEach((duvida) => {
      const cartao = document.createElement("article");
      cartao.className = "duvida";

      const pergunta = document.createElement("h3");
      pergunta.textContent = duvida.pergunta;

      const categoria = document.createElement("small");
      categoria.textContent = `Categoria: ${duvida.categoria}`;

      const respostaTexto = document.createElement("p");
      respostaTexto.textContent = duvida.resposta;

      cartao.append(pergunta, categoria, respostaTexto);
      listaDuvidas.appendChild(cartao);
    });
  } catch (erro) {
    listaDuvidas.textContent =
      "Não foi possível carregar as dúvidas.";
    console.error(erro);
  }
}

carregarPontos();
carregarDuvidas();
