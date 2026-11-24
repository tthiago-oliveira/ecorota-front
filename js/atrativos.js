// =====================================================================
// Atrativos: lista com busca, filtro por destino e tipo, e a próxima vaga de cada um
// Rotas: GET /api/destinos · GET /api/atrativos (com ?idDestino= quando há destino escolhido)
//        GET /api/janelas-visitacao (próximo horário com vaga)
// =====================================================================
montarLayout('atrativos');

const lista = document.getElementById('lista');
const campos = {
  busca: document.getElementById('busca'),
  destino: document.getElementById('destino'),
  tipo: document.getElementById('tipo'),
  ordem: document.getElementById('ordem'),
  gratis: document.getElementById('gratis'),
};
let destinos = [];
let atrativos = [];
let proximas = new Map();

async function iniciar() {
  lista.innerHTML = esqueleto(6);
  try {
    const [d, janelas] = await Promise.all([api('/destinos'), api('/janelas-visitacao')]);
    destinos = d;
    proximas = proximasJanelas(janelas);
  } catch (erro) {
    lista.innerHTML = vazio('Não foi possível carregar os atrativos', esc(erro.message));
    return;
  }

  // destinos agrupados por estado no select
  const porUf = new Map();
  for (const d of [...destinos].sort(porNome('nome'))) porUf.set(d.uf, [...(porUf.get(d.uf) || []), d]);
  campos.destino.innerHTML = '<option value="">Todos os destinos</option>' + [...porUf.keys()].sort().map(uf =>
    `<optgroup label="${esc(uf)}">${porUf.get(uf).map(d => `<option value="${d.idDestino}">${esc(d.nome)}</option>`).join('')}</optgroup>`).join('');

  // filtros que chegam pelo endereço (busca da página inicial, cartão de destino)
  campos.busca.value = parametro('busca') || '';
  if (parametro('destino')) campos.destino.value = parametro('destino');
  await buscar();
}

// Com um destino escolhido, quem filtra é a API (GET /api/atrativos?idDestino=)
async function buscar() {
  const idDestino = campos.destino.value;
  try {
    atrativos = await api(idDestino ? `/atrativos?idDestino=${idDestino}` : '/atrativos');
  } catch (erro) {
    lista.innerHTML = vazio('Não foi possível carregar os atrativos', esc(erro.message));
    return;
  }
  const tipos = [...new Set(atrativos.map(a => a.tipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const tipoAtual = campos.tipo.value;
  campos.tipo.innerHTML = '<option value="">Todos os tipos</option>' + tipos.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  if (tipos.includes(tipoAtual)) campos.tipo.value = tipoAtual;

  const destino = destinos.find(d => String(d.idDestino) === idDestino);
  document.getElementById('titulo').textContent = destino ? destino.nome : 'O que fazer';
  document.getElementById('subtitulo').textContent = destino
    ? `${destino.nomeMunicipio}/${destino.uf}${destino.tipo ? ` · ${destino.tipo}` : ''}. Escolha um atrativo para ver os horários e reservar.`
    : 'Grutas, rios de água cristalina, praias e trilhas. Cada horário tem um número limitado de vagas, para o lugar nunca ficar lotado.';
  mostrar();
}

function mostrar() {
  const termo = semAcento(campos.busca.value.trim());
  const destinoPorId = new Map(destinos.map(d => [d.idDestino, d]));
  const chave = a => { const p = proximas.get(a.idAtrativo); return p ? p.dataVisita + p.horaInicio : '9999'; };
  const ordens = {
    vaga: (a, b) => chave(a).localeCompare(chave(b)) || a.nome.localeCompare(b.nome, 'pt-BR'),
    preco: (a, b) => Number(a.valorIngresso) - Number(b.valorIngresso) || a.nome.localeCompare(b.nome, 'pt-BR'),
    nome: porNome('nome'),
  };

  const visiveis = atrativos
    .filter(a => !campos.tipo.value || a.tipo === campos.tipo.value)
    .filter(a => !campos.gratis.checked || Number(a.valorIngresso) === 0)
    .filter(a => !termo || semAcento(`${a.nome} ${a.tipo || ''} ${a.nomeDestino}`).includes(termo))
    .sort(ordens[campos.ordem.value]);

  const filtrando = campos.busca.value || campos.destino.value || campos.tipo.value || campos.gratis.checked;
  document.getElementById('limpar').hidden = !filtrando;
  document.getElementById('resumo').textContent = plural(visiveis.length, 'atrativo', 'atrativos') +
    (filtrando ? ' com esses filtros' : '');

  if (!atrativos.length && !filtrando) {
    lista.innerHTML = vazio('Nenhum atrativo cadastrado ainda',
      'Carregue os dados de demonstração para ver os atrativos com horários e vagas.',
      '<button class="btn" id="demo">Carregar dados de demonstração</button>');
    document.getElementById('demo').addEventListener('click', abrirDemonstracao);
    return;
  }
  lista.innerHTML = visiveis.length
    ? visiveis.map(a => cartaoAtrativo(a, destinoPorId.get(a.idDestino), proximas.get(a.idAtrativo))).join('')
    : vazio('Nenhum atrativo encontrado', 'Tente outra palavra ou limpe os filtros.');
  revelar(lista);
}

campos.busca.addEventListener('input', mostrar);
campos.tipo.addEventListener('change', mostrar);
campos.ordem.addEventListener('change', mostrar);
campos.gratis.addEventListener('change', mostrar);
campos.destino.addEventListener('change', buscar);
document.getElementById('filtros').addEventListener('submit', e => e.preventDefault());
document.getElementById('limpar').addEventListener('click', () => {
  campos.busca.value = '';
  campos.tipo.value = '';
  campos.gratis.checked = false;
  if (campos.destino.value) { campos.destino.value = ''; buscar(); } else mostrar();
});

iniciar();
