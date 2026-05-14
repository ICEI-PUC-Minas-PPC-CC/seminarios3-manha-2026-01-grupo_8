const chave = "conecta_comunidade_simples";

const el = {
  menuBotao: document.getElementById("menuBotao"),
  menuLinks: document.getElementById("menuLinks"),
  contrasteBotao: document.getElementById("contrasteBotao"),
  verResumo: document.getElementById("verResumo"),
  form: document.getElementById("formDemanda"),
  id: document.getElementById("idDemanda"),
  nome: document.getElementById("nome"),
  contato: document.getElementById("contato"),
  categoria: document.getElementById("categoria"),
  prioridade: document.getElementById("prioridade"),
  descricao: document.getElementById("descricao"),
  salvarBotao: document.getElementById("salvarBotao"),
  limparBotao: document.getElementById("limparBotao"),
  mensagem: document.getElementById("mensagem"),
  busca: document.getElementById("busca"),
  filtro: document.getElementById("filtro"),
  lista: document.getElementById("listaDemandas"),
  cardTotal: document.getElementById("cardTotal"),
  cardUrgentes: document.getElementById("cardUrgentes"),
  cardCategorias: document.getElementById("cardCategorias"),
  librasBotao: document.getElementById("librasBotao"),
  textoLibras: document.getElementById("textoLibras")
};

let demandas = carregar();

function carregar() {
  const salvas = localStorage.getItem(chave);

  if (salvas) {
    try {
      return JSON.parse(salvas);
    } catch {
      return [];
    }
  }

  return [
    {
      id: crypto.randomUUID(),
      nome: "Coordenação Comunitária",
      contato: "(31) 99999-0000",
      categoria: "Educação",
      prioridade: "Média",
      descricao: "Organizar uma oficina de informática básica para moradores.",
      data: new Date().toLocaleDateString("pt-BR")
    }
  ];
}

function salvarLocal() {
  localStorage.setItem(chave, JSON.stringify(demandas));
}

function avisar(texto, tipo = "sucesso") {
  el.mensagem.textContent = texto;
  el.mensagem.className = `mensagem ${tipo}`;

  setTimeout(() => {
    el.mensagem.textContent = "";
    el.mensagem.className = "mensagem";
  }, 3000);
}

function limpar() {
  el.form.reset();
  el.id.value = "";
  el.salvarBotao.textContent = "Salvar";
  el.nome.focus();
}

function dadosFormulario() {
  return {
    id: el.id.value || crypto.randomUUID(),
    nome: el.nome.value.trim(),
    contato: el.contato.value.trim(),
    categoria: el.categoria.value,
    prioridade: el.prioridade.value,
    descricao: el.descricao.value.trim(),
    data: new Date().toLocaleDateString("pt-BR")
  };
}

function validar() {
  if (!el.nome.value.trim() || !el.contato.value.trim() || !el.categoria.value || !el.prioridade.value || !el.descricao.value.trim()) {
    avisar("Preencha todos os campos obrigatórios.", "erro");
    return false;
  }

  return true;
}

function enviarFormulario(event) {
  event.preventDefault();

  if (!validar()) return;

  const demanda = dadosFormulario();
  const indice = demandas.findIndex(item => item.id === demanda.id);

  if (indice >= 0) {
    demandas[indice] = demanda;
    avisar("Demanda atualizada com sucesso!");
  } else {
    demandas.unshift(demanda);
    avisar("Demanda cadastrada com sucesso!");
  }

  salvarLocal();
  limpar();
  renderizar();
}

function textoNormal(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function demandasFiltradas() {
  const busca = textoNormal(el.busca.value);
  const filtro = el.filtro.value;

  return demandas.filter(demanda => {
    const texto = textoNormal(`${demanda.nome} ${demanda.contato} ${demanda.categoria} ${demanda.descricao}`);
    const bateBusca = !busca || texto.includes(busca);
    const bateFiltro = !filtro || demanda.prioridade === filtro;

    return bateBusca && bateFiltro;
  });
}

function classePrioridade(prioridade) {
  if (prioridade === "Alta") return "alta";
  if (prioridade === "Média") return "media";
  return "baixa";
}

function renderizar() {
  const lista = demandasFiltradas();
  el.lista.innerHTML = "";

  if (lista.length === 0) {
    el.lista.innerHTML = `
      <article class="demanda-card">
        <h3>Nenhuma demanda encontrada</h3>
        <p>Cadastre uma nova demanda ou mude a busca.</p>
      </article>
    `;
  }

  lista.forEach(demanda => {
    const card = document.createElement("article");
    const classe = classePrioridade(demanda.prioridade);

    card.className = `demanda-card ${classe}`;
    card.innerHTML = `
      <div class="demanda-topo">
        <div>
          <h3>${demanda.nome}</h3>
          <p><strong>Categoria:</strong> ${demanda.categoria}</p>
        </div>
        <span class="etiqueta-prioridade ${classe}">${demanda.prioridade}</span>
      </div>

      <p><strong>Contato:</strong> ${demanda.contato}</p>
      <p><strong>Descrição:</strong> ${demanda.descricao}</p>
      <p><strong>Data:</strong> ${demanda.data}</p>

      <div class="acoes-card">
        <button class="botao botao-claro" data-editar="${demanda.id}">Editar</button>
        <button class="botao botao-perigo" data-excluir="${demanda.id}">Excluir</button>
      </div>
    `;

    el.lista.appendChild(card);
  });

  atualizarResumo();
}

function atualizarResumo() {
  const categorias = new Set(demandas.map(item => item.categoria));
  const urgentes = demandas.filter(item => item.prioridade === "Alta").length;

  el.cardTotal.textContent = demandas.length;
  el.cardUrgentes.textContent = urgentes;
  el.cardCategorias.textContent = categorias.size;
}

function editar(id) {
  const demanda = demandas.find(item => item.id === id);
  if (!demanda) return;

  el.id.value = demanda.id;
  el.nome.value = demanda.nome;
  el.contato.value = demanda.contato;
  el.categoria.value = demanda.categoria;
  el.prioridade.value = demanda.prioridade;
  el.descricao.value = demanda.descricao;
  el.salvarBotao.textContent = "Atualizar";

  window.location.hash = "#demandas";
  el.nome.focus();
}

function excluir(id) {
  const confirmar = confirm("Deseja excluir esta demanda?");
  if (!confirmar) return;

  demandas = demandas.filter(item => item.id !== id);
  salvarLocal();
  renderizar();
  avisar("Demanda excluída com sucesso!");
}

el.menuBotao.addEventListener("click", () => {
  const aberto = el.menuLinks.classList.toggle("aberto");
  el.menuBotao.setAttribute("aria-expanded", aberto.toString());
});

el.menuLinks.addEventListener("click", event => {
  if (event.target.tagName === "A") {
    el.menuLinks.classList.remove("aberto");
    el.menuBotao.setAttribute("aria-expanded", "false");
  }
});

el.contrasteBotao.addEventListener("click", () => {
  document.body.classList.toggle("alto-contraste");
});

el.verResumo.addEventListener("click", () => {
  alert(`Resumo: ${demandas.length} demandas cadastradas. ${demandas.filter(d => d.prioridade === "Alta").length} são urgentes.`);
});

el.form.addEventListener("submit", enviarFormulario);
el.limparBotao.addEventListener("click", limpar);
el.busca.addEventListener("input", renderizar);
el.filtro.addEventListener("change", renderizar);

el.lista.addEventListener("click", event => {
  const editarBotao = event.target.closest("[data-editar]");
  const excluirBotao = event.target.closest("[data-excluir]");

  if (editarBotao) editar(editarBotao.dataset.editar);
  if (excluirBotao) excluir(excluirBotao.dataset.excluir);
});

el.librasBotao.addEventListener("click", () => {
  el.textoLibras.textContent = "Aqui pode entrar um vídeo em Libras, link acessível ou o recurso VLibras para tradução do conteúdo.";
});

renderizar();
