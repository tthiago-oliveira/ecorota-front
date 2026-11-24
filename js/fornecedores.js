// =====================================================================
// Fornecedores: ranking com Selo EcoRota, nota e resposta às avaliações; cadastro de novos perfis
// Rotas: GET /api/fornecedores · GET /api/avaliacoes · GET /api/certificacoes · GET /api/municipios
//        POST /api/fornecedores
// =====================================================================
montarLayout('fornecedores');

const lista = document.getElementById('lista');
const f = {
  busca: document.getElementById('busca'),
  municipio: document.getElementById('municipio'),
  tipo: document.getElementById('tipo'),
  selo: document.getElementById('so-selo'),
};
let itens = [];          // { fornecedor, resumo, situacao }
let municipios = [];

async function carregar() {
  lista.innerHTML = esqueleto(6);
  let fornecedores, avaliacoes, certificacoes;
  try {
    [fornecedores, avaliacoes, certificacoes, municipios] = await Promise.all([
      api('/fornecedores'), api('/avaliacoes'), api('/certificacoes'), api('/municipios'),
    ]);
  } catch (erro) {
    lista.innerHTML = vazio('Não foi possível carregar os fornecedores', esc(erro.message));
    return;
  }

  const resumos = resumoAvaliacoes(avaliacoes);
  const certs = new Map();
  certificacoes.forEach(c => certs.set(c.idFornecedor, [...(certs.get(c.idFornecedor) || []), c]));
  itens = fornecedores.map(x => ({ fornecedor: x, resumo: resumos.get(x.idFornecedor), situacao: situacaoSelo(certs.get(x.idFornecedor) || []) }));

  const cidades = [...new Map(fornecedores.map(x => [x.idMunicipio, `${x.nomeMunicipio}/${x.uf}`])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  f.municipio.innerHTML = '<option value="">Todas as cidades</option>' + cidades.map(([id, nome]) => `<option value="${id}">${esc(nome)}</option>`).join('');
  const tipos = [...new Set(fornecedores.map(x => x.tipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  f.tipo.innerHTML = '<option value="">Todos os tipos</option>' + tipos.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  if (parametro('selo')) f.selo.checked = true;
  mostrar();
}

// Ordem do ranking: Selo EcoRota válido > perfil reivindicado > nota média > número de avaliações
function pontosRanking({ fornecedor, resumo, situacao }) {
  return (situacao.tipo === 'valido' ? 1000 : 0) + (fornecedor.perfilReivindicado ? 100 : 0) + (resumo ? resumo.media * 10 + Math.min(resumo.total, 9) : 0);
}

function mostrar() {
  const termo = semAcento(f.busca.value.trim());
  const visiveis = itens
    .filter(({ fornecedor: x }) => !f.municipio.value || String(x.idMunicipio) === f.municipio.value)
    .filter(({ fornecedor: x }) => !f.tipo.value || x.tipo === f.tipo.value)
    .filter(({ situacao }) => !f.selo.checked || situacao.tipo === 'valido')
    .filter(({ fornecedor: x }) => !termo || semAcento(`${x.nomeFantasia} ${x.nomeMunicipio}`).includes(termo))
    .sort((a, b) => pontosRanking(b) - pontosRanking(a) || a.fornecedor.nomeFantasia.localeCompare(b.fornecedor.nomeFantasia, 'pt-BR'));

  document.getElementById('resumo').textContent = plural(visiveis.length, 'fornecedor', 'fornecedores');
  if (!itens.length) {
    lista.innerHTML = vazio('Nenhum fornecedor cadastrado ainda', 'Carregue os dados de demonstração ou cadastre o primeiro negócio.',
      '<button class="btn" id="demo">Carregar dados de demonstração</button>');
    document.getElementById('demo').addEventListener('click', abrirDemonstracao);
    return;
  }
  lista.innerHTML = visiveis.length
    ? visiveis.map(({ fornecedor, resumo, situacao }) => cartaoFornecedor(fornecedor, resumo, situacao)).join('')
    : vazio('Nenhum fornecedor com esses filtros', 'Tente outra cidade ou desligue o filtro do selo.');
  revelar(lista);
}

// ---------------------------------------------------------------- cadastro de perfil
const TIPOS = ['hospedagem', 'agência', 'guiamento', 'transporte', 'mergulho', 'camping', 'gastronomia'];

function abrirCadastro(proprio) {
  if (!municipios.length) { toast('Nenhuma cidade cadastrada ainda.', 'erro'); return; }
  const d = abrirModal({
    titulo: proprio ? 'Cadastrar meu negócio' : 'Indicar um fornecedor',
    html: `
      <p class="modal-motivo">${icone('info')}${proprio
        ? 'O perfil já nasce reivindicado: você poderá responder às avaliações e pedir o Selo EcoRota.'
        : 'Conhece um negócio que ainda não está aqui? Crie o perfil para que outros viajantes possam avaliá-lo.'}</p>
      <form class="form-2" id="f-fornecedor" style="margin-top:16px">
        <label class="campo inteiro">Nome do negócio<input name="nomeFantasia" required maxlength="150" placeholder="Ex.: Pousada Recanto Verde"></label>
        <label class="campo">Tipo
          <select name="tipo">${TIPOS.map(t => `<option>${t}</option>`).join('')}</select></label>
        <label class="campo">Cidade
          <select name="idMunicipio" required>${[...municipios].sort(porNome('nome')).map(m => `<option value="${m.idMunicipio}">${esc(m.nome)}/${esc(m.uf)}</option>`).join('')}</select></label>
        ${proprio ? `
          <label class="campo">CNPJ<input name="cnpj" required inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00"></label>
          <label class="campo">Razão social<input name="razaoSocial" required maxlength="150"></label>` : ''}
        <button class="btn btn-bloco inteiro" type="submit">${proprio ? 'Cadastrar negócio' : 'Criar perfil'}</button>
      </form>`,
  });
  const form = d.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(form);
    const corpo = {
      idMunicipio: Number(form.idMunicipio.value),
      nomeFantasia: form.nomeFantasia.value.trim(),
      tipo: form.tipo.value,
      origemCadastro: proprio ? 'proprio' : 'viajante',
      cnpj: proprio ? form.cnpj.value.replace(/\D/g, '') : null,
      razaoSocial: proprio ? form.razaoSocial.value.trim() : null,
    };
    try {
      const novo = await comBotao(form.querySelector('button'), () => api('/fornecedores', { corpo }));
      toast(`${novo.nomeFantasia} agora tem um perfil no EcoRota.`);
      location.href = `fornecedor.html?id=${novo.idFornecedor}`;
    } catch (erro) {
      const campo = /cnpj/i.test(erro.message) ? { cnpj: erro.message } : null;
      mostrarErros(form, erro.campos || campo, erro.campos || campo ? '' : erro.message);
    }
  });
}

f.busca.addEventListener('input', mostrar);
f.municipio.addEventListener('change', mostrar);
f.tipo.addEventListener('change', mostrar);
f.selo.addEventListener('change', mostrar);
document.getElementById('filtros').addEventListener('submit', e => e.preventDefault());
document.getElementById('indicar').addEventListener('click', () => abrirCadastro(false));
document.getElementById('cadastrar').addEventListener('click', () => abrirCadastro(true));

carregar();
