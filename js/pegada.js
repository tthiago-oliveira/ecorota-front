// =====================================================================
// Pegada de carbono: simulador e "minhas viagens" (trechos, serviços contratados e status)
// Rotas: GET /api/modais-transporte · GET /api/fatores-emissao · GET /api/viagens?idViajante=
//        POST /api/viagens · PATCH /api/viagens/{id}/status · POST /api/viagens/{id}/trechos
//        POST /api/viagens/{id}/servicos · GET /api/fornecedores
// =====================================================================
montarLayout('pegada');

const area = document.getElementById('area-viagens');
const STATUS = { planejada: 'Planejada', em_andamento: 'Em andamento', concluida: 'Concluída', cancelada: 'Cancelada' };
let modais = [];
let fatores = [];
let fornecedores = [];
let viagens = [];
let idAtual = null;

async function iniciar() {
  try {
    [modais, fatores] = await Promise.all([api('/modais-transporte'), api('/fatores-emissao')]);
    montarCalculadora(document.getElementById('calculadora'), modais, fatores);
  } catch (erro) {
    document.getElementById('calculadora').innerHTML = vazio('Simulador indisponível', esc(erro.message));
  }
  await carregarViagens();
  revelar();
  if (location.hash === '#viagens') document.getElementById('viagens').scrollIntoView({ behavior: 'smooth' });
}

// fatores vigentes, um por meio de transporte, para o formulário de trecho
const opcoesTransporte = () => modais.map(m => ({ m, f: fatorVigente(fatores, m.idModal) })).filter(x => x.f);

// o destino "principal" de uma viagem: a cidade dos fornecedores contratados ou, sem eles, o trecho do meio (ida e volta)
function tituloViagem(v) {
  const cidades = v.servicos.map(s => fornecedores.find(f => f.idFornecedor === s.idFornecedor)?.nomeMunicipio).filter(Boolean);
  if (cidades.length) {
    const vezes = new Map();
    cidades.forEach(c => vezes.set(c, (vezes.get(c) || 0) + 1));
    return `Viagem a ${[...vezes.entries()].sort((a, b) => b[1] - a[1])[0][0]}`;
  }
  if (!v.trechos.length) return 'Viagem sem trechos';
  return `Viagem a ${v.trechos[Math.floor((v.trechos.length - 1) / 2)].destino}`;
}

async function carregarViagens(selecionar) {
  const viajante = await sessao.validar();
  if (!viajante) {
    area.innerHTML = vazio('Entre para registrar suas viagens', 'Com uma conta, você guarda os trechos de cada viagem e acompanha a pegada de carbono.',
      `<button class="btn" id="entrar-viagens">${icone('usuario')}Entrar ou criar conta</button>`);
    document.getElementById('entrar-viagens').addEventListener('click', async () => { if (await exigirLogin()) carregarViagens(); });
    return;
  }
  try {
    [viagens, fornecedores] = await Promise.all([api(`/viagens?idViajante=${viajante.idViajante}`), fornecedores.length ? fornecedores : api('/fornecedores')]);
  } catch (erro) {
    area.innerHTML = vazio('Não foi possível carregar suas viagens', esc(erro.message));
    return;
  }
  viagens.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
  if (!viagens.length) {
    area.innerHTML = vazio('Nenhuma viagem registrada', 'Crie uma viagem e adicione os trechos: a pegada é calculada na hora.',
      `<button class="btn" id="primeira-viagem">${icone('mais')}Criar minha primeira viagem</button>`);
    document.getElementById('primeira-viagem').addEventListener('click', novaViagem);
    return;
  }
  idAtual = selecionar ?? (viagens.some(v => v.idViagem === idAtual) ? idAtual : viagens[0].idViagem);
  area.innerHTML = `
    <div class="layout-viagens">
      <div class="viagens-lista" id="lista-viagens"></div>
      <div id="detalhe-viagem"></div>
    </div>`;
  desenharLista();
  desenharDetalhe();
}

function desenharLista() {
  const lista = document.getElementById('lista-viagens');
  lista.innerHTML = viagens.map(v => `
    <button class="viagem-item ${v.idViagem === idAtual ? 'ativa' : ''}" data-id="${v.idViagem}" type="button">
      <span class="icone-redondo ${v.status === 'concluida' ? 'azul' : v.status === 'cancelada' ? 'ambar' : ''}">${icone(v.trechos.some(t => /avi/i.test(semAcento(t.nomeModal))) ? 'aviao' : 'rota')}</span>
      <span><strong>${esc(tituloViagem(v))}</strong>
        <small>${fmtData(v.dataInicio)}${v.dataFim ? ` a ${fmtData(v.dataFim)}` : ''} · ${STATUS[v.status] || v.status}</small></span>
      <span class="kg">${fmtKg(v.pegadaCarbono?.totalKgco2e || 0)}<small>CO₂e</small></span>
    </button>`).join('');
  lista.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => {
    idAtual = Number(b.dataset.id);
    desenharLista();
    desenharDetalhe();
  }));
}

function desenharDetalhe() {
  const v = viagens.find(x => x.idViagem === idAtual);
  const caixa = document.getElementById('detalhe-viagem');
  const total = Number(v.pegadaCarbono?.totalKgco2e || 0);
  const km = v.trechos.reduce((s, t) => s + Number(t.distanciaKm), 0);
  const transportes = opcoesTransporte();
  const maxTrecho = Math.max(1, ...v.trechos.map(t => Number(t.emissaoTrechoKgco2e)));

  caixa.innerHTML = `
    <div class="total-pegada">
      <span class="icone-redondo">${icone('pegada')}</span>
      <div><strong>${fmtNumero(total, total >= 100 ? 0 : 1)} kg</strong><br>
        <span>de CO₂e em ${fmtNumero(km)} km${v.pegadaCarbono ? ` · ${esc(v.pegadaCarbono.versaoMetodologia)} · calculado em ${fmtData(v.pegadaCarbono.calculadoEm)}` : ''}</span></div>
      <label class="status-viagem">Situação
        <select id="status">${Object.entries(STATUS).map(([k, n]) => `<option value="${k}" ${k === v.status ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </label>
    </div>

    <div class="cartao">
      <h3>Trechos</h3>
      ${v.trechos.length ? `
        <div class="trechos">${v.trechos.map(t => `
          <div class="barra-linha trecho">
            <span><strong>${esc(t.origem)} → ${esc(t.destino)}</strong><small>${icone(iconeModal(t.nomeModal), 'ic-inline')} ${esc(t.nomeModal)} · ${fmtNumero(t.distanciaKm)} km · ${fmtNumero(t.kgco2ePorKm, 3)} kg/km</small></span>
            <span class="trilho"><span class="preenchido" data-largura="${(Number(t.emissaoTrechoKgco2e) / maxTrecho) * 100}"></span></span>
            <span class="valor">${fmtKg(t.emissaoTrechoKgco2e)}</span>
          </div>`).join('')}</div>
        ${km ? `<p class="dica-pegada">${icone('info', 'ic-inline')} Os ${fmtNumero(km)} km desta viagem emitiriam:
          ${transportes.map(({ m, f }) => `<b>${esc(m.nome)}</b> ${fmtKg(km * f.kgco2ePorKm)}`).join(' · ')}.</p>` : ''}`
        : '<p class="suave">Nenhum trecho ainda. Adicione o primeiro abaixo.</p>'}
      <form class="form-trecho" id="f-trecho">
        <label class="campo">Transporte
          <select name="idFator" required>${transportes.map(({ m, f }) => `<option value="${f.idFator}">${esc(m.nome)} · ${fmtNumero(f.kgco2ePorKm, 3)} kg/km (${f.anoVigencia})</option>`).join('')}</select></label>
        <label class="campo">Saindo de<input name="origem" required maxlength="120" placeholder="Ex.: São Paulo"></label>
        <label class="campo">Chegando em<input name="destino" required maxlength="120" placeholder="Ex.: Bonito"></label>
        <label class="campo">Km<input name="distanciaKm" type="number" min="1" step="any" required placeholder="Ex.: 300" aria-label="Distância em km"></label>
        <button class="btn" type="submit">${icone('mais')}Adicionar trecho</button>
      </form>
    </div>

    <div class="cartao">
      <h3>Serviços contratados</h3>
      ${v.servicos.length ? `
        <div class="tabela-rolagem"><table class="tabela">
          <thead><tr><th>Fornecedor</th><th>Serviço</th><th class="num">Valor</th></tr></thead>
          <tbody>${v.servicos.map(s => `<tr><td><a href="fornecedor.html?id=${s.idFornecedor}">${esc(s.nomeFornecedor)}</a></td>
            <td>${esc(s.tipoServico)}</td><td class="num">${fmtMoeda(s.valor)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td colspan="2">Total gasto com fornecedores</td><td class="num">${fmtMoeda(v.gastoTotalServicos)}</td></tr></tfoot>
        </table></div>`
        : '<p class="suave">Registre aqui a hospedagem, os passeios e o transporte que você contratou.</p>'}
      <form class="form-trecho" id="f-servico">
        <label class="campo">Fornecedor
          <select name="idFornecedor" required>${[...fornecedores].sort(porNome('nomeFantasia')).map(f => `<option value="${f.idFornecedor}">${esc(f.nomeFantasia)} · ${esc(f.nomeMunicipio)}</option>`).join('')}</select></label>
        <label class="campo">Serviço<input name="tipoServico" required maxlength="40" list="tipos-servico" placeholder="Ex.: hospedagem"></label>
        <label class="campo">Valor (R$)<input name="valor" type="number" min="0" step="0.01" required placeholder="0,00"></label>
        <button class="btn btn-contorno" type="submit">${icone('mais')}Adicionar serviço</button>
      </form>
      <datalist id="tipos-servico"><option value="hospedagem"><option value="passeios"><option value="transfer"><option value="alimentação"><option value="mergulho"></datalist>
    </div>`;

  requestAnimationFrame(() => caixa.querySelectorAll('[data-largura]').forEach(b => { b.style.width = b.dataset.largura + '%'; }));

  caixa.querySelector('#status').addEventListener('change', async e => {
    try {
      await api(`/viagens/${v.idViagem}/status`, { metodo: 'PATCH', corpo: { status: e.target.value } });
      toast(`Viagem marcada como ${STATUS[e.target.value].toLowerCase()}.`);
      carregarViagens(v.idViagem);
    } catch (erro) { toast(erro.message, 'erro'); }
  });

  const fTrecho = caixa.querySelector('#f-trecho');
  fTrecho.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(fTrecho);
    try {
      const nova = await comBotao(fTrecho.querySelector('button'), () => api(`/viagens/${v.idViagem}/trechos`, {
        corpo: { idFator: Number(fTrecho.idFator.value), origem: fTrecho.origem.value.trim(), destino: fTrecho.destino.value.trim(), distanciaKm: Number(fTrecho.distanciaKm.value) },
      }));
      const novoTotal = Number(nova.pegadaCarbono?.totalKgco2e || 0);
      toast(`Trecho adicionado. A pegada passou para ${fmtKg(novoTotal)} de CO₂e.`);
      carregarViagens(v.idViagem);
    } catch (erro) { mostrarErros(fTrecho, erro.campos, erro.campos ? '' : erro.message); }
  });

  const fServico = caixa.querySelector('#f-servico');
  fServico.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(fServico);
    try {
      await comBotao(fServico.querySelector('button'), () => api(`/viagens/${v.idViagem}/servicos`, {
        corpo: { idFornecedor: Number(fServico.idFornecedor.value), tipoServico: fServico.tipoServico.value.trim(), valor: Number(fServico.valor.value) },
      }));
      toast('Serviço registrado na viagem.');
      carregarViagens(v.idViagem);
    } catch (erro) { mostrarErros(fServico, erro.campos, erro.campos ? '' : erro.message); }
  });
}

async function novaViagem() {
  const viajante = await exigirLogin('Entre na sua conta para registrar a viagem.');
  if (!viajante) return;
  const hoje = hojeISO();
  const d = abrirModal({
    titulo: 'Nova viagem',
    largura: 'pequena',
    html: `
      <form class="form-2" id="f-viagem">
        <label class="campo">Ida<input name="dataInicio" type="date" required value="${somarDias(hoje, 7)}"></label>
        <label class="campo">Volta <span class="opcional">opcional</span><input name="dataFim" type="date" value="${somarDias(hoje, 11)}"></label>
        <button class="btn btn-bloco inteiro" type="submit">Criar viagem</button>
      </form>`,
  });
  const form = d.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(form);
    try {
      const v = await comBotao(form.querySelector('button'), () => api('/viagens', {
        corpo: { idViajante: viajante.idViajante, dataInicio: form.dataInicio.value, dataFim: form.dataFim.value || null },
      }));
      d.fechar();
      toast('Viagem criada. Agora adicione os trechos.');
      carregarViagens(v.idViagem);
    } catch (erro) { mostrarErros(form, erro.campos, erro.campos ? '' : erro.message); }
  });
}

document.getElementById('nova-viagem').addEventListener('click', novaViagem);
document.addEventListener('sessao', () => carregarViagens());
iniciar();
