// =====================================================================
// Página inicial
// Rotas: GET /api/destinos, /api/atrativos, /api/fornecedores, /api/avaliacoes, /api/certificacoes,
//        /api/janelas-visitacao, /api/criterios-sustentabilidade, /api/modais-transporte, /api/fatores-emissao
// =====================================================================
montarLayout('inicio', { transparente: true });

const capa = document.getElementById('capa');
capa.insertAdjacentHTML('afterbegin', Arte.capa());
animarCapa(capa);
document.getElementById('chamada').insertAdjacentHTML('afterbegin', Arte.cena('chapada', 7));
document.getElementById('destinos').innerHTML = esqueleto(3);
document.getElementById('atrativos').innerHTML = esqueleto(3);

async function carregar() {
  let dados;
  try {
    const [destinos, atrativos, fornecedores, avaliacoes, certificacoes, janelas, criterios, modais, fatores] = await Promise.all([
      api('/destinos'), api('/atrativos'), api('/fornecedores'), api('/avaliacoes'), api('/certificacoes'),
      api('/janelas-visitacao'), api('/criterios-sustentabilidade'), api('/modais-transporte'), api('/fatores-emissao'),
    ]);
    dados = { destinos, atrativos, fornecedores, avaliacoes, certificacoes, janelas, criterios, modais, fatores };
  } catch (erro) {
    document.getElementById('destinos').innerHTML = vazio('Não foi possível carregar', esc(erro.message));
    document.getElementById('atrativos').innerHTML = '';
    document.getElementById('calculadora').innerHTML = vazio('Calculadora indisponível', 'Ligue a API para usar a calculadora.');
    return;
  }
  const { destinos, atrativos, fornecedores, avaliacoes, certificacoes, janelas, criterios, modais, fatores } = dados;

  if (!destinos.length && !atrativos.length) avisoBancoVazio(document.getElementById('aviso-banco'));
  else if (!janelas.length && !fornecedores.length) avisoBancoVazio(document.getElementById('aviso-banco'), true);

  // números (contam até o valor quando aparecem)
  const hoje = hojeISO(), fimSemana = somarDias(hoje, 6);
  const vagas = janelas.filter(j => j.dataVisita >= hoje && j.dataVisita <= fimSemana).reduce((s, j) => s + j.vagasDisponiveis, 0);
  const avaliados = new Set(avaliacoes.map(a => a.idFornecedor)).size;
  for (const [id, valor] of [['n-destinos', destinos.length], ['n-atrativos', atrativos.length], ['n-fornecedores', avaliados], ['n-vagas', vagas]]) {
    document.getElementById(id).dataset.contar = valor;
  }
  animarNumeros(document.getElementById('numeros'));

  // sugestões de busca na capa
  document.getElementById('sugestoes').innerHTML = destinos.length
    ? '<span>Populares:</span>' + destinos.slice(0, 3).map(d => `<a class="chip" href="atrativos.html?destino=${d.idDestino}">${esc(d.nomeMunicipio)}</a>`).join('')
    : '';

  // destinos com mais atrativos
  const porDestino = new Map();
  atrativos.forEach(a => porDestino.set(a.idDestino, (porDestino.get(a.idDestino) || 0) + 1));
  const destaques = [...destinos].sort((a, b) => (porDestino.get(b.idDestino) || 0) - (porDestino.get(a.idDestino) || 0)).slice(0, 3);
  document.getElementById('destinos').innerHTML = destaques.length
    ? destaques.map(d => cartaoDestino(d, porDestino.get(d.idDestino) || 0)).join('')
    : vazio('Nenhum destino ainda', 'Os destinos aparecem aqui assim que forem cadastrados.');

  // atrativos com vaga mais próxima
  const proximas = proximasJanelas(janelas);
  const destinoPorId = new Map(destinos.map(d => [d.idDestino, d]));
  const lista = [...atrativos].sort((a, b) => {
    const pa = proximas.get(a.idAtrativo), pb = proximas.get(b.idAtrativo);
    if (!!pa !== !!pb) return pa ? -1 : 1;
    return pa && pb ? (pa.dataVisita + pa.horaInicio).localeCompare(pb.dataVisita + pb.horaInicio) : a.nome.localeCompare(b.nome, 'pt-BR');
  }).slice(0, 6);
  document.getElementById('atrativos').innerHTML = lista.length
    ? lista.map(a => cartaoAtrativo(a, destinoPorId.get(a.idDestino), proximas.get(a.idAtrativo))).join('')
    : vazio('Nenhum atrativo ainda', 'Os atrativos aparecem aqui assim que forem cadastrados.');

  // Selo EcoRota: critérios e fornecedores com selo
  const eixos = new Set(criterios.map(c => c.eixo));
  const obrigatorios = criterios.filter(c => c.obrigatorio).length;
  document.getElementById('selo-pontos').innerHTML = [
    criterios.length ? `${criterios.length} critérios em ${plural(eixos.size, 'eixo', 'eixos')}: ambiental, social, econômico e gestão` : 'Critérios em quatro eixos: ambiental, social, econômico e gestão',
    obrigatorios ? `${plural(obrigatorios, 'critério obrigatório', 'critérios obrigatórios')}: sem ${obrigatorios === 1 ? 'ele' : 'eles'}, não há selo` : 'Critérios obrigatórios: sem eles, não há selo',
    'Selo com validade: depois do vencimento, ele deixa de aparecer no perfil',
  ].map(t => `<li>${icone('check')}<span>${esc(t)}</span></li>`).join('');

  const certPorFornecedor = new Map();
  certificacoes.forEach(c => certPorFornecedor.set(c.idFornecedor, [...(certPorFornecedor.get(c.idFornecedor) || []), c]));
  const resumos = resumoAvaliacoes(avaliacoes);
  const comSelo = fornecedores
    .map(f => ({ f, s: situacaoSelo(certPorFornecedor.get(f.idFornecedor) || []), r: resumos.get(f.idFornecedor) }))
    .filter(x => x.s.tipo === 'valido')
    .sort((a, b) => (b.r?.media || 0) - (a.r?.media || 0))
    .slice(0, 3);
  document.getElementById('mini-fornecedores').innerHTML = comSelo.length
    ? comSelo.map(({ f, s, r }) => `
        <a class="mini-fornecedor" href="fornecedor.html?id=${f.idFornecedor}">
          <span class="icone-tipo">${icone(iconeFornecedor(f.tipo))}</span>
          <div><strong>${esc(f.nomeFantasia)}</strong><span>${esc(f.nomeMunicipio)}/${esc(f.uf)}${r ? ` · ★ ${fmtNumero(r.media, 1)}` : ''}</span></div>
          <span class="pontos">${s.cert.pontuacaoMaxima ? Math.round((s.cert.pontuacaoObtida / s.cert.pontuacaoMaxima) * 100) : 0}<small> pts</small></span>
        </a>`).join('')
    : `<div class="mini-fornecedor"><span class="icone-tipo">${icone('selo')}</span><div><strong>Nenhum selo concedido ainda</strong><span>Os primeiros aparecem aqui depois da auditoria.</span></div></div>`;

  montarCalculadora(document.getElementById('calculadora'), modais, fatores);
  revelar();
}

carregar();
