// =====================================================================
// Atrativo: informações, capacidade de carga, horários com vagas e reserva
// Rotas: GET /api/atrativos/{id} · GET /api/destinos · GET /api/janelas-visitacao?idAtrativo=
//        GET /api/capacidades-carga?idAtrativo= · GET /api/atrativos?idDestino= · POST /api/reservas
// =====================================================================
montarLayout('atrativos');

const idAtrativo = parametro('id');
const reserva = document.getElementById('reserva');
let atrativo = null;
let janelas = [];          // horários de hoje em diante
let capacidades = [];
const escolha = { dia: null, janela: null, pessoas: 1 };

async function carregar() {
  if (!idAtrativo) return erroPagina('Nenhum atrativo foi escolhido.', 'Volte para a lista e escolha um atrativo.');
  let destinos;
  try {
    [atrativo, destinos, capacidades] = await Promise.all([
      api(`/atrativos/${encodeURIComponent(idAtrativo)}`), api('/destinos'), api(`/capacidades-carga?idAtrativo=${encodeURIComponent(idAtrativo)}`),
    ]);
  } catch (erro) {
    return erroPagina(erro.status === 404 ? 'Atrativo não encontrado' : 'Não foi possível carregar o atrativo', esc(erro.message));
  }
  const destino = destinos.find(d => d.idDestino === atrativo.idDestino);
  document.title = `${atrativo.nome} · EcoRota`;

  // banner com a ilustração do tipo de lugar
  document.getElementById('banner').insertAdjacentHTML('afterbegin', Arte.cena(atrativo.tipo || atrativo.nome, atrativo.idAtrativo));
  document.getElementById('trilha-nome').textContent = atrativo.nome;
  document.getElementById('nome').textContent = atrativo.nome;
  document.getElementById('local').innerHTML = `${icone('pin')}${esc(atrativo.nomeDestino)}${destino ? ` · ${esc(destino.nomeMunicipio)}/${esc(destino.uf)}` : ''}`;
  document.getElementById('etiquetas').innerHTML = `
    ${atrativo.tipo ? `<span class="etiqueta branca">${esc(atrativo.tipo)}</span>` : ''}
    <span class="etiqueta branca">${icone(atrativo.exigeGuia ? 'bussola' : 'pessoas')}${atrativo.exigeGuia ? 'Visita com guia' : 'Visita livre'}</span>
    <span class="etiqueta branca">${icone('ingresso')}${ingressoTexto(atrativo.valorIngresso)}</span>`;

  // texto da visita, montado com os dados do banco
  const gratis = Number(atrativo.valorIngresso) === 0;
  document.getElementById('descricao').textContent =
    `${atrativo.nome} fica em ${atrativo.nomeDestino}${destino ? `, ${destino.nomeMunicipio} (${destino.uf})` : ''}. ` +
    (atrativo.exigeGuia ? 'A visita é feita com guia credenciado, que acompanha o grupo do começo ao fim. ' : 'A visita pode ser feita sem guia, seguindo as regras do local. ') +
    (gratis ? 'A entrada é gratuita, mas é preciso reservar o horário. ' : `O ingresso custa ${fmtMoeda(atrativo.valorIngresso)} por pessoa. `) +
    'Cada horário recebe um grupo com tamanho limitado, para proteger o lugar e garantir uma visita tranquila.';

  const temCoord = atrativo.latitude != null && atrativo.longitude != null;
  const mapa = temCoord ? `https://www.openstreetmap.org/?mlat=${atrativo.latitude}&mlon=${atrativo.longitude}#map=13/${atrativo.latitude}/${atrativo.longitude}` : null;
  const info = (ic, cor, rotulo, valor) => `
    <div class="info-item"><span class="icone-redondo ${cor}">${icone(ic)}</span><div><small>${rotulo}</small><strong>${valor}</strong></div></div>`;
  document.getElementById('infos').innerHTML =
    info('mapa', '', 'Destino', `<a href="atrativos.html?destino=${atrativo.idDestino}">${esc(atrativo.nomeDestino)}</a>`) +
    info('pin', 'azul', 'Município', destino ? `${esc(destino.nomeMunicipio)}/${esc(destino.uf)}` : '—') +
    info('ingresso', 'ambar', 'Ingresso por pessoa', ingressoTexto(atrativo.valorIngresso)) +
    info(atrativo.exigeGuia ? 'bussola' : 'pessoas', '', 'Guia', atrativo.exigeGuia ? 'Obrigatório' : 'Não precisa') +
    info('folha', 'azul', 'Tipo de atrativo', esc(atrativo.tipo || '—')) +
    info('globo', 'ambar', 'Localização', temCoord
      ? `<a href="${mapa}" target="_blank" rel="noopener">Ver no mapa</a>`
      : 'Não informada');

  document.getElementById('layout').hidden = false;
  await carregarJanelas();
  mostrarMesmoDestino(destino);
  revelar();
}

function erroPagina(titulo, texto) {
  document.getElementById('nome').textContent = titulo;
  document.getElementById('banner').insertAdjacentHTML('afterbegin', Arte.cena('montanhas', 2));
  document.getElementById('erro-pagina').innerHTML = `<div style="padding:48px 0">${vazio(titulo, texto, '<a class="btn" href="atrativos.html">Ver atrativos</a>')}</div>`;
}

// ---------------------------------------------------------------- horários e reserva
async function carregarJanelas() {
  try {
    const todas = await api(`/janelas-visitacao?idAtrativo=${atrativo.idAtrativo}`);
    const hoje = hojeISO();
    janelas = todas.filter(j => j.dataVisita >= hoje)
      .sort((a, b) => (a.dataVisita + a.horaInicio).localeCompare(b.dataVisita + b.horaInicio));
  } catch (erro) {
    reserva.innerHTML = `<p class="erro-form">${icone('alerta')}<span>${esc(erro.message)}</span></p>`;
    return;
  }
  const dias = [...new Set(janelas.map(j => j.dataVisita))].slice(0, 14);
  // mantém o dia escolhido; se ele não existe mais, vai para o primeiro dia com vaga
  if (!dias.includes(escolha.dia)) {
    escolha.dia = dias.find(d => janelas.some(j => j.dataVisita === d && j.vagasDisponiveis > 0)) || dias[0] || null;
  }
  if (escolha.janela) escolha.janela = janelas.find(j => j.idJanela === escolha.janela.idJanela) || null;
  if (escolha.janela && escolha.janela.vagasDisponiveis <= 0) escolha.janela = null;
  desenharReserva(dias);
  desenharCapacidade();
}

function desenharReserva(dias) {
  const preco = Number(atrativo.valorIngresso) === 0
    ? '<strong>Gratuito</strong><span class="suave">reserva obrigatória</span>'
    : `<strong>${fmtMoeda(atrativo.valorIngresso)}</strong><span class="suave">por pessoa</span>`;

  if (!dias.length) {
    reserva.innerHTML = `<div class="preco">${preco}</div>
      ${vazio('Sem horários abertos', 'Este atrativo ainda não tem horários de visita a partir de hoje. Volte em breve.')}`;
    return;
  }

  const doDia = janelas.filter(j => j.dataVisita === escolha.dia);
  reserva.innerHTML = `
    <div class="preco">${preco}</div>
    <span class="rotulo">Escolha o dia</span>
    <div class="dias" role="listbox" aria-label="Dias com horários">
      ${dias.map(d => {
        const livres = janelas.filter(j => j.dataVisita === d).reduce((s, j) => s + j.vagasDisponiveis, 0);
        return `<button type="button" class="dia ${d === escolha.dia ? 'ativo' : ''}" data-dia="${d}" title="${fmtDataLonga(d)} · ${plural(livres, 'vaga', 'vagas')}">
          <small>${fmtDiaSemana(d)}</small><strong>${dataLocal(d).getDate()}</strong><small>${dataLocal(d).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></button>`;
      }).join('')}
    </div>
    <span class="rotulo">Horário</span>
    <div class="horarios">
      ${doDia.map(j => {
        const pct = j.vagasTotal ? (j.vagasOcupadas / j.vagasTotal) * 100 : 100;
        const esgotado = j.vagasDisponiveis <= 0;
        return `<label class="horario ${esgotado ? 'esgotado' : ''} ${escolha.janela?.idJanela === j.idJanela ? 'ativo' : ''}">
          <input type="radio" name="janela" value="${j.idJanela}" ${esgotado ? 'disabled' : ''} ${escolha.janela?.idJanela === j.idJanela ? 'checked' : ''}>
          <strong>${fmtHora(j.horaInicio)}</strong>
          <span class="ocupacao ${pct >= 100 ? 'cheia' : pct >= 75 ? 'alta' : ''}"><span style="width:${Math.min(100, pct)}%"></span></span>
          <span class="vagas ${!esgotado && j.vagasDisponiveis <= 5 ? 'poucas' : ''}">${esgotado ? 'Esgotado' : plural(j.vagasDisponiveis, 'vaga', 'vagas')}</span>
        </label>`;
      }).join('')}
    </div>
    <span class="rotulo">Pessoas</span>
    <div class="linha-pessoas">
      <div class="contador">
        <button type="button" data-pessoas="-1" aria-label="Menos uma pessoa">${icone('menos')}</button>
        <output id="pessoas">${escolha.pessoas}</output>
        <button type="button" data-pessoas="1" aria-label="Mais uma pessoa">${icone('mais')}</button>
      </div>
      <span class="suave pequeno" id="limite"></span>
    </div>
    <div class="linha-total"><span>Total</span><strong id="total"></strong></div>
    <button class="btn btn-bloco" id="reservar" type="button">${icone('ingresso')}Reservar</button>
    <p class="nota-demo">${icone('cadeado')}A vaga fica garantida na hora. Dá para cancelar em Minha conta.</p>
    <div id="erro-reserva"></div>`;

  reserva.querySelectorAll('[data-dia]').forEach(b => b.addEventListener('click', () => {
    escolha.dia = b.dataset.dia;
    escolha.janela = null;
    desenharReserva(dias);
    desenharCapacidade();
  }));
  reserva.querySelectorAll('input[name="janela"]').forEach(r => r.addEventListener('change', () => {
    escolha.janela = janelas.find(j => String(j.idJanela) === r.value);
    reserva.querySelectorAll('.horario').forEach(h => h.classList.toggle('ativo', h.contains(r)));
    atualizarTotal();
  }));
  reserva.querySelectorAll('[data-pessoas]').forEach(b => b.addEventListener('click', () => {
    escolha.pessoas += Number(b.dataset.pessoas);
    atualizarTotal();
  }));
  document.getElementById('reservar').addEventListener('click', reservar);
  atualizarTotal();
}

function atualizarTotal() {
  const max = escolha.janela ? escolha.janela.vagasDisponiveis : 10;
  escolha.pessoas = Math.max(1, Math.min(escolha.pessoas, max, 20));
  document.getElementById('pessoas').textContent = escolha.pessoas;
  const [menos, mais] = reserva.querySelectorAll('[data-pessoas]');
  menos.disabled = escolha.pessoas <= 1;
  mais.disabled = escolha.pessoas >= Math.min(max, 20);
  document.getElementById('limite').textContent = escolha.janela
    ? `até ${plural(Math.min(max, 20), 'pessoa', 'pessoas')} neste horário`
    : 'escolha um horário';
  const total = Number(atrativo.valorIngresso) * escolha.pessoas;
  document.getElementById('total').textContent = total === 0 ? 'Gratuito' : fmtMoeda(total);
  document.getElementById('reservar').disabled = !escolha.janela;
}

async function reservar(evento) {
  const botao = evento.currentTarget;
  const caixaErro = document.getElementById('erro-reserva');
  caixaErro.innerHTML = '';
  if (!escolha.janela) return;
  const viajante = await exigirLogin('Entre na sua conta para garantir a vaga. É rápido.');
  if (!viajante) return;

  const janela = escolha.janela;
  const pessoas = escolha.pessoas;
  try {
    // o back-end trava o horário, confere as vagas e grava tudo numa transação
    const r = await comBotao(botao, () => api('/reservas', {
      corpo: { idViajante: viajante.idViajante, itens: [{ idJanela: janela.idJanela, qtdPessoas: pessoas }] },
    }));
    mostrarRecibo(r);
    escolha.janela = null;
    escolha.pessoas = 1;
  } catch (erro) {
    caixaErro.innerHTML = `<p class="erro-form">${icone('alerta')}<span>${esc(erro.message)}</span></p>`;
    if (erro.status === 404 && /viajante/i.test(erro.message)) sessao.sair();
  }
  await carregarJanelas();
}

function mostrarRecibo(r) {
  const item = r.itens[0];
  abrirModal({
    titulo: 'Reserva confirmada',
    largura: 'pequena',
    html: `
      <div class="sucesso-icone">${icone('check')}</div>
      <div class="recibo">
        <div class="codigo"><span class="suave pequeno">Código da reserva</span><strong>#${String(r.idReserva).padStart(5, '0')}</strong></div>
        <div class="recibo-linha"><span class="suave">Atrativo</span><strong>${esc(item.nomeAtrativo)}</strong></div>
        <div class="recibo-linha"><span class="suave">Data</span><strong>${fmtDataLonga(item.dataVisita)}</strong></div>
        <div class="recibo-linha"><span class="suave">Horário</span><strong>${fmtHora(item.horaInicio)}</strong></div>
        <div class="recibo-linha"><span class="suave">Pessoas</span><strong>${item.qtdPessoas}</strong></div>
        <div class="recibo-linha"><span class="suave">Total</span><strong>${Number(r.valorTotal) === 0 ? 'Gratuito' : fmtMoeda(r.valorTotal)}</strong></div>
        <a class="btn btn-bloco" href="conta.html#reservas">${icone('ingresso')}Ver minhas reservas</a>
      </div>`,
  });
  toast('Reserva confirmada! Boa viagem.');
}

// ---------------------------------------------------------------- capacidade de carga do dia escolhido
function desenharCapacidade() {
  const texto = document.getElementById('texto-capacidade');
  const dia = escolha.dia || hojeISO();
  const regra = capacidades.find(c => c.vigenciaInicio <= dia && c.vigenciaFim >= dia);
  const doDia = janelas.filter(j => j.dataVisita === dia);
  const total = doDia.reduce((s, j) => s + j.vagasTotal, 0);
  const ocupadas = doDia.reduce((s, j) => s + j.vagasOcupadas, 0);
  const base = regra ? regra.cotaDiaria : total;
  const pct = base ? Math.round((ocupadas / base) * 100) : 0;

  document.getElementById('pct').textContent = `${pct}%`;
  const arco = document.querySelector('#medidor .valor-arco');
  requestAnimationFrame(() => { arco.style.strokeDashoffset = 326.7 * (1 - Math.min(pct, 100) / 100); });

  texto.innerHTML = `
    <strong>${escolha.dia ? fmtDataLonga(dia) : 'Hoje'}</strong>
    <p class="suave pequeno" style="margin:6px 0 0">
      ${plural(ocupadas, 'pessoa reservada', 'pessoas reservadas')}${regra ? ` de uma cota de <b>${regra.cotaDiaria}</b> por dia` : total ? ` de ${total} vagas abertas` : ''}.
      ${regra ? `Cada horário recebe no máximo <b>${regra.cotaPorJanela}</b> pessoas. Regra válida de ${fmtData(regra.vigenciaInicio)} a ${fmtData(regra.vigenciaFim)}.` : 'Este atrativo ainda não tem cota diária cadastrada.'}
    </p>`;
}

async function mostrarMesmoDestino(destino) {
  try {
    const outros = (await api(`/atrativos?idDestino=${atrativo.idDestino}`)).filter(a => a.idAtrativo !== atrativo.idAtrativo);
    if (!outros.length) return;
    const proximas = proximasJanelas(await api('/janelas-visitacao'));
    document.getElementById('titulo-destino').textContent = `Mais em ${atrativo.nomeDestino}`;
    document.getElementById('link-destino').href = `atrativos.html?destino=${atrativo.idDestino}`;
    document.getElementById('mesmo-destino').innerHTML = outros.slice(0, 4).map(a => cartaoAtrativo(a, destino, proximas.get(a.idAtrativo))).join('');
    document.getElementById('bloco-destino').hidden = false;
    revelar(document.getElementById('bloco-destino'));
  } catch { /* sem a lista, a página continua */ }
}

carregar();
