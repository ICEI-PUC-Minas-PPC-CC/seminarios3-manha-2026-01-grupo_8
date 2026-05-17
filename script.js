const TOTAL_PERGUNTAS = 15;

const estado = {
  pontos: 0,
  acertos: 0,
  perguntaAtual: 1,
  questao: null,
  respondida: false
};

const el = {
  telas: document.querySelectorAll(".tela"),
  botoesTela: document.querySelectorAll("[data-tela]"),
  botaoContraste: document.getElementById("botaoContraste"),
  pontos: document.getElementById("pontos"),
  acertos: document.getElementById("acertos"),
  numeroAtual: document.getElementById("numeroAtual"),
  tipoQuestao: document.getElementById("tipoQuestao"),
  pergunta: document.getElementById("pergunta"),
  visualConta: document.getElementById("visualConta"),
  opcoes: document.getElementById("opcoes"),
  feedback: document.getElementById("feedback"),
  botaoProximo: document.getElementById("botaoProximo"),
  botaoReiniciar: document.getElementById("botaoReiniciar"),
  botaoTentarNovamente: document.getElementById("botaoTentarNovamente"),
  acertosFinal: document.getElementById("acertosFinal"),
  pontosFinal: document.getElementById("pontosFinal"),
  fraseFinal: document.getElementById("fraseFinal")
};

function mostrarTela(id) {
  el.telas.forEach(tela => {
    tela.classList.toggle("ativa", tela.id === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "exercicios" && !estado.questao) {
    iniciarQuiz();
  }
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function embaralhar(lista) {
  return lista.sort(() => Math.random() - 0.5);
}

function criarQuestao() {
  const tipos = ["soma", "subtracao", "comparacao"];
  const tipo = tipos[numeroAleatorio(0, tipos.length - 1)];

  let a = numeroAleatorio(1, 10);
  let b = numeroAleatorio(1, 10);
  let resposta;
  let pergunta;
  let nomeTipo;
  let operador;

  if (tipo === "soma") {
    resposta = a + b;
    pergunta = `Quanto é ${a} + ${b}?`;
    nomeTipo = "Adição";
    operador = "+";
  }

  if (tipo === "subtracao") {
    if (b > a) [a, b] = [b, a];
    resposta = a - b;
    pergunta = `Quanto é ${a} − ${b}?`;
    nomeTipo = "Subtração";
    operador = "−";
  }

  if (tipo === "comparacao") {
    while (a === b) {
      b = numeroAleatorio(1, 10);
    }

    resposta = Math.max(a, b);
    pergunta = "Qual número é maior?";
    nomeTipo = "Comparação";
    operador = "ou";
  }

  const opcoes = new Set([resposta]);

  while (opcoes.size < 3) {
    let valor;

    if (tipo === "comparacao") {
      valor = numeroAleatorio(1, 10);
    } else {
      valor = resposta + numeroAleatorio(-4, 4);
    }

    if (valor >= 0 && valor !== resposta) {
      opcoes.add(valor);
    }
  }

  return {
    tipo,
    nomeTipo,
    operador,
    a,
    b,
    resposta,
    pergunta,
    opcoes: embaralhar([...opcoes])
  };
}

function criarGrupoVisual(numero) {
  const grupo = document.createElement("div");
  grupo.className = "grupo-visual";

  const numeroElemento = document.createElement("strong");
  numeroElemento.className = "numero-visual";
  numeroElemento.textContent = numero;

  const bolas = document.createElement("div");
  bolas.className = "grupo-bolas";

  for (let i = 0; i < numero; i++) {
    const bola = document.createElement("span");
    bola.className = "visual-bola";
    bolas.appendChild(bola);
  }

  grupo.appendChild(numeroElemento);
  grupo.appendChild(bolas);

  return grupo;
}

function renderizarVisual(questao) {
  el.visualConta.innerHTML = "";

  const grupoA = criarGrupoVisual(questao.a);
  const operador = document.createElement("strong");
  operador.className = "operador-visual";
  operador.textContent = questao.operador;
  const grupoB = criarGrupoVisual(questao.b);

  el.visualConta.appendChild(grupoA);
  el.visualConta.appendChild(operador);
  el.visualConta.appendChild(grupoB);
}

function renderizarQuestao() {
  estado.questao = criarQuestao();
  estado.respondida = false;

  el.tipoQuestao.textContent = estado.questao.nomeTipo;
  el.pergunta.textContent = estado.questao.pergunta;
  el.numeroAtual.textContent = estado.perguntaAtual;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";

  renderizarVisual(estado.questao);

  el.opcoes.innerHTML = "";

  estado.questao.opcoes.forEach(valor => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "opcao";
    botao.textContent = valor;
    botao.setAttribute("aria-label", `Resposta ${valor}`);
    botao.addEventListener("click", () => responder(valor, botao));
    el.opcoes.appendChild(botao);
  });
}

function responder(valor, botao) {
  if (estado.respondida) return;

  estado.respondida = true;

  document.querySelectorAll(".opcao").forEach(opcao => {
    const numero = Number(opcao.textContent);

    if (numero === estado.questao.resposta) {
      opcao.classList.add("correta");
    }
  });

  if (valor === estado.questao.resposta) {
    estado.acertos += 1;
    estado.pontos += 10;
    botao.classList.add("correta");
    el.feedback.textContent = "Muito bem! Você acertou!";
    el.feedback.className = "feedback ok";
  } else {
    botao.classList.add("errada");
    el.feedback.textContent = `Quase! A resposta certa é ${estado.questao.resposta}.`;
    el.feedback.className = "feedback erro";
  }

  atualizarPlacar();
}

function atualizarPlacar() {
  el.pontos.textContent = estado.pontos;
  el.acertos.textContent = estado.acertos;
}

function proximaPergunta() {
  if (!estado.respondida) {
    el.feedback.textContent = "Escolha uma resposta primeiro.";
    el.feedback.className = "feedback erro";
    return;
  }

  if (estado.perguntaAtual >= TOTAL_PERGUNTAS) {
    finalizarQuiz();
    return;
  }

  estado.perguntaAtual += 1;
  renderizarQuestao();
}

function finalizarQuiz() {
  el.acertosFinal.textContent = estado.acertos;
  el.pontosFinal.textContent = estado.pontos;

  if (estado.acertos >= 13) {
    el.fraseFinal.textContent = "Excelente! Você mandou muito bem!";
  } else if (estado.acertos >= 8) {
    el.fraseFinal.textContent = "Muito bom! Continue praticando!";
  } else {
    el.fraseFinal.textContent = "Você concluiu! Treinar mais ajuda a melhorar.";
  }

  localStorage.setItem("mf_tarso_pontos", estado.pontos);
  localStorage.setItem("mf_tarso_acertos", estado.acertos);

  mostrarTela("resultado");
}

function iniciarQuiz() {
  estado.pontos = 0;
  estado.acertos = 0;
  estado.perguntaAtual = 1;
  estado.questao = null;
  estado.respondida = false;

  atualizarPlacar();
  renderizarQuestao();
}

el.botoesTela.forEach(botao => {
  botao.addEventListener("click", () => {
    mostrarTela(botao.dataset.tela);
  });
});

el.botaoContraste.addEventListener("click", () => {
  document.body.classList.toggle("alto-contraste");
});

el.botaoProximo.addEventListener("click", proximaPergunta);
el.botaoReiniciar.addEventListener("click", iniciarQuiz);
el.botaoTentarNovamente.addEventListener("click", () => {
  iniciarQuiz();
  mostrarTela("exercicios");
});

mostrarTela("inicio");
