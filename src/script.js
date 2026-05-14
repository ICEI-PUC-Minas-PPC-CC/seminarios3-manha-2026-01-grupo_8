const estado = {
  pontos: Number(localStorage.getItem("mf_pontos")) || 0,
  acertos: Number(localStorage.getItem("mf_acertos")) || 0,
  tentativas: Number(localStorage.getItem("mf_tentativas")) || 0,
  questaoAtual: null,
  respondida: false
};

const el = {
  botaoContraste: document.getElementById("botaoContraste"),
  botaoAprender: document.getElementById("botaoAprender"),
  pontos: document.getElementById("pontos"),
  acertos: document.getElementById("acertos"),
  tentativas: document.getElementById("tentativas"),
  tipoQuestao: document.getElementById("tipoQuestao"),
  pergunta: document.getElementById("pergunta"),
  visualConta: document.getElementById("visualConta"),
  opcoes: document.getElementById("opcoes"),
  feedback: document.getElementById("feedback"),
  botaoProximo: document.getElementById("botaoProximo"),
  botaoReiniciar: document.getElementById("botaoReiniciar"),
  botaoDica: document.getElementById("botaoDica"),
  textoAssistente: document.getElementById("textoAssistente")
};

const tiposQuestoes = [
  {
    tipo: "Adição",
    operador: "+",
    texto: "Adição é juntar.",
    dica: "Conte o primeiro grupo e depois junte com o segundo."
  },
  {
    tipo: "Subtração",
    operador: "-",
    texto: "Subtração é tirar.",
    dica: "Comece com o total e tire a segunda quantidade."
  },
  {
    tipo: "Comparação",
    operador: ">",
    texto: "Comparar é ver qual número é maior.",
    dica: "Olhe os dois números. O maior representa mais quantidade."
  }
];

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function embaralhar(lista) {
  return lista.sort(() => Math.random() - 0.5);
}

function criarQuestao() {
  const modelo = tiposQuestoes[numeroAleatorio(0, tiposQuestoes.length - 1)];
  let a = numeroAleatorio(1, 9);
  let b = numeroAleatorio(1, 9);
  let resposta;
  let pergunta;

  if (modelo.operador === "-") {
    if (b > a) [a, b] = [b, a];
    resposta = a - b;
    pergunta = `Quanto é ${a} - ${b}?`;
  } else if (modelo.operador === "+") {
    resposta = a + b;
    pergunta = `Quanto é ${a} + ${b}?`;
  } else {
    resposta = Math.max(a, b);
    pergunta = `Qual número é maior?`;
    while (a === b) {
      b = numeroAleatorio(1, 9);
      resposta = Math.max(a, b);
    }
  }

  const opcoes = new Set([resposta]);

  while (opcoes.size < 3) {
    let valor;
    if (modelo.operador === ">") {
      valor = numeroAleatorio(1, 9);
    } else {
      valor = resposta + numeroAleatorio(-3, 3);
    }

    if (valor >= 0 && valor !== resposta) {
      opcoes.add(valor);
    }
  }

  return {
    tipo: modelo.tipo,
    operador: modelo.operador,
    texto: modelo.texto,
    dica: modelo.dica,
    a,
    b,
    resposta,
    pergunta,
    opcoes: embaralhar([...opcoes])
  };
}

function criarBolas(quantidade) {
  const grupo = document.createElement("div");
  grupo.className = "grupo-bolas";

  for (let i = 0; i < quantidade; i++) {
    const bola = document.createElement("span");
    bola.className = "visual-bola";
    grupo.appendChild(bola);
  }

  return grupo;
}

function renderizarVisual(questao) {
  el.visualConta.innerHTML = "";

  const grupoA = criarBolas(questao.a);
  const operador = document.createElement("strong");
  operador.className = "operador-visual";

  if (questao.operador === ">") {
    operador.textContent = "ou";
  } else {
    operador.textContent = questao.operador;
  }

  const grupoB = criarBolas(questao.b);

  el.visualConta.appendChild(grupoA);
  el.visualConta.appendChild(operador);
  el.visualConta.appendChild(grupoB);
}

function renderizarQuestao() {
  estado.questaoAtual = criarQuestao();
  estado.respondida = false;

  const q = estado.questaoAtual;

  el.tipoQuestao.textContent = q.tipo;
  el.pergunta.textContent = q.pergunta;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.textoAssistente.textContent = "Observe as imagens. Elas ajudam a descobrir a resposta.";

  renderizarVisual(q);

  el.opcoes.innerHTML = "";

  q.opcoes.forEach(valor => {
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
  estado.tentativas++;

  document.querySelectorAll(".opcao").forEach(item => {
    const numero = Number(item.textContent);

    if (numero === estado.questaoAtual.resposta) {
      item.classList.add("correta");
    }
  });

  if (valor === estado.questaoAtual.resposta) {
    estado.acertos++;
    estado.pontos += 10;
    botao.classList.add("correta");
    el.feedback.textContent = "Muito bem! Você acertou! 🎉";
    el.feedback.className = "feedback ok";
    el.textoAssistente.textContent = "Parabéns! Você observou com atenção e escolheu certo.";
  } else {
    botao.classList.add("errada");
    el.feedback.textContent = `Quase! A resposta certa é ${estado.questaoAtual.resposta}.`;
    el.feedback.className = "feedback erro";
    el.textoAssistente.textContent = "Tudo bem errar. Olhe as imagens com calma e tente o próximo.";
  }

  salvarPlacar();
  atualizarPlacar();
}

function salvarPlacar() {
  localStorage.setItem("mf_pontos", estado.pontos);
  localStorage.setItem("mf_acertos", estado.acertos);
  localStorage.setItem("mf_tentativas", estado.tentativas);
}

function atualizarPlacar() {
  el.pontos.textContent = estado.pontos;
  el.acertos.textContent = estado.acertos;
  el.tentativas.textContent = estado.tentativas;
}

function mostrarDica() {
  const q = estado.questaoAtual;
  if (!q) return;

  let dicaVisual;

  if (q.operador === "+") {
    dicaVisual = `Conte ${q.a} bolinhas. Depois junte mais ${q.b}.`;
  } else if (q.operador === "-") {
    dicaVisual = `Comece com ${q.a} bolinhas. Tire ${q.b}.`;
  } else {
    dicaVisual = `Compare os dois grupos. O grupo com mais bolinhas mostra o maior número.`;
  }

  el.textoAssistente.textContent = `${q.texto} ${q.dica} ${dicaVisual}`;
}

el.botaoContraste.addEventListener("click", () => {
  document.body.classList.toggle("alto-contraste");
});

el.botaoAprender.addEventListener("click", () => {
  document.getElementById("aprender").scrollIntoView({ behavior: "smooth" });
});

el.botaoProximo.addEventListener("click", renderizarQuestao);

el.botaoReiniciar.addEventListener("click", () => {
  const confirmar = confirm("Deseja zerar seus pontos?");
  if (!confirmar) return;

  estado.pontos = 0;
  estado.acertos = 0;
  estado.tentativas = 0;

  salvarPlacar();
  atualizarPlacar();
  renderizarQuestao();
});

el.botaoDica.addEventListener("click", mostrarDica);

atualizarPlacar();
renderizarQuestao();
