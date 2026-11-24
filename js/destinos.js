// =====================================================================
// Destinos: todos os destinos, com busca e filtro por estado e tipo
// Rotas: GET /api/destinos · GET /api/atrativos (para contar os atrativos de cada destino)
// =====================================================================
montarLayout('destinos');

const lista = document.getElementById('lista');
const busca = document.getElementById('busca');
const selUf = document.getElementById('uf');
const selTipo = document.getElementById('tipo');
let destinos = [];
const porDestino = new Map();

async function carregar() {
  lista.innerHTML = esqueleto(3);
  try {
    const [d, atrativos] = await Promise.all([api('/destinos'), api('/atrativos')]);
    destinos = d.sort(porNome('nome'));
    atrativos.forEach(a => porDestino.set(a.idDestino, (porDestino.get(a.idDestino) || 0) + 1));
  } catch (erro) {
    lista.innerHTML = vazio('Não foi possível carregar os destinos', esc(erro.message));
    return;
  }

  if (!destinos.length) {
    lista.innerHTML = vazio('Nenhum destino cadastrado ainda',
      'Carregue os dados de demonstração ou cadastre um destino na área do gestor.',
      '<button class="btn" id="demo">Carregar dados de demonstração</button>');
    document.getElementById('demo').addEventListener('click', abrirDemonstracao);
    return;
  }

  const ufs = [...new Set(destinos.map(d => d.uf))].sort();
  selUf.innerHTML += ufs.map(uf => `<option value="${esc(uf)}">${esc(uf)}</option>`).join('');
  const tipos = [...new Set(destinos.map(d => d.tipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  selTipo.innerHTML += tipos.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  mostrar();
}

function mostrar() {
  const termo = semAcento(busca.value.trim());
  const visiveis = destinos.filter(d =>
    (!selUf.value || d.uf === selUf.value) &&
    (!selTipo.value || d.tipo === selTipo.value) &&
    (!termo || semAcento(`${d.nome} ${d.nomeMunicipio}`).includes(termo)));

  document.getElementById('resumo').textContent = plural(visiveis.length, 'destino encontrado', 'destinos encontrados');
  lista.innerHTML = visiveis.length
    ? visiveis.map(d => cartaoDestino(d, porDestino.get(d.idDestino) || 0)).join('')
    : vazio('Nenhum destino com esses filtros', 'Tente outro estado ou limpe a busca.');
  revelar(lista);
}

busca.addEventListener('input', mostrar);
selUf.addEventListener('change', mostrar);
selTipo.addEventListener('change', mostrar);
document.getElementById('filtros').addEventListener('submit', e => e.preventDefault());

carregar();
