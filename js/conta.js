// =====================================================================
// Minha conta: dados do viajante, reservas (com cancelamento), avaliações e resumo das viagens
// Rotas: GET /api/viajantes/{id} · GET /api/reservas?idViajante= · PATCH /api/reservas/{id}/cancelar
//        GET /api/avaliacoes?idViajante= · GET /api/viagens?idViajante=
// =====================================================================
montarLayout('conta');

const conteudo = document.getElementById('conteudo');
const mascaraCpf = c => (c ? `***.${c.slice(3, 6)}.***-${c.slice(9)}` : 'não informado');

async function carregar() {
  const viajante = await sessao.validar();
  if (!viajante) {
    document.getElementById('perfil').innerHTML = `<span class="avatar avatar-grande">${icone('usuario')}</span>
      <div><span class="sobretitulo">Minha conta</span><h1>Entre para continuar</h1></div>`;
    conteudo.innerHTML = `<div class="espaco-vazio">${vazio('Você ainda não entrou',
      'Entre ou crie uma conta para ver suas reservas, avaliações e viagens.',
      `<button class="btn" id="entrar-agora">${icone('usuario')}Entrar ou criar conta</button>`)}</div>`;
    document.getElementById('entrar-agora').addEventListener('click', async () => { if (await exigirLogin()) carregar(); });
    return;
  }

  document.getElementById('perfil').innerHTML = `
    <span class="avatar avatar-grande">${esc(iniciais(viajante.nome))}</span>
    <div><span class="sobretitulo">Minha conta</span><h1>Olá, ${esc(viajante.nome.split(' ')[0])}!</h1>
      <p class="perfil-dados">${icone('conversa', 'ic-inline')} ${esc(viajante.email)} · CPF ${esc(mascaraCpf(viajante.cpf))}</p></div>`;

  let reservas, avaliacoes, viagens;
  try {
    [reservas, avaliacoes, viagens] = await Promise.all([
      api(`/reservas?idViajante=${viajante.idViajante}`), api(`/avaliacoes?idViajante=${viajante.idViajante}`), api(`/viagens?idViajante=${viajante.idViajante}`),
    ]);
  } catch (erro) {
    conteudo.innerHTML = `<div class="espaco-vazio">${vazio('Não foi possível carregar sua conta', esc(erro.message))}</div>`;
    return;
  }

  const hoje = hojeISO();
  const dataDe = r => r.itens.map(i => i.dataVisita + 'T' + i.horaInicio).sort()[0] || r.datahora;
  const proximas = reservas.filter(r => r.status === 'confirmada' && dataDe(r).slice(0, 10) >= hoje).sort((a, b) => dataDe(a).localeCompare(dataDe(b)));
  const outras = reservas.filter(r => !proximas.includes(r)).sort((a, b) => dataDe(b).localeCompare(dataDe(a)));
  const kgTotal = viagens.reduce((s, v) => s + Number(v.pegadaCarbono?.totalKgco2e || 0), 0);

  conteudo.innerHTML = `
    <div class="kpis kpis-conta" data-revelar>
      <div class="kpi"><strong>${proximas.length}</strong><span>${proximas.length === 1 ? 'reserva marcada' : 'reservas marcadas'}</span></div>
      <div class="kpi"><strong>${proximas.reduce((s, r) => s + r.itens.reduce((t, i) => t + i.qtdPessoas, 0), 0)}</strong><span>vagas garantidas</span></div>
      <div class="kpi"><strong>${avaliacoes.length}</strong><span>${avaliacoes.length === 1 ? 'avaliação feita' : 'avaliações feitas'}</span></div>
      <div class="kpi"><strong>${fmtNumero(kgTotal, kgTotal >= 100 ? 0 : 1)}</strong><span>kg de CO₂e nas viagens</span></div>
    </div>

    <section class="bloco-conta" id="reservas">
      <div class="linha-titulo"><div><span class="sobretitulo">Reservas</span><h2>Minhas reservas</h2></div>
        <a class="link-seta" href="atrativos.html">Reservar outro atrativo ${icone('seta')}</a></div>
      ${proximas.length ? proximas.map(itemReserva).join('') : vazio('Nenhuma reserva marcada', 'Escolha um atrativo e garanta a sua vaga.', '<a class="btn" href="atrativos.html">Ver atrativos</a>')}
      ${outras.length ? `<details class="anteriores"><summary>Reservas anteriores e canceladas (${outras.length})</summary>${outras.map(itemReserva).join('')}</details>` : ''}
    </section>

    <section class="bloco-conta" id="avaliacoes">
      <div class="linha-titulo"><div><span class="sobretitulo">Avaliações</span><h2>O que eu avaliei</h2></div>
        <a class="link-seta" href="fornecedores.html">Avaliar um fornecedor ${icone('seta')}</a></div>
      ${avaliacoes.length ? `<div class="grade-2">${avaliacoes.map(a => `
        <article class="cartao avaliacao-cartao" data-revelar>
          <div class="quem"><a href="fornecedor.html?id=${a.idFornecedor}"><strong>${esc(a.nomeFornecedor)}</strong></a>${estrelas(a.nota)}</div>
          <p>${esc(a.comentario)}</p>
          <small class="suave">${fmtDataLonga(a.dataAvaliacao)}</small>
          ${a.resposta ? `<div class="resposta"><strong>${icone('conversa')}Resposta do fornecedor</strong>${esc(a.resposta)}</div>` : ''}
        </article>`).join('')}</div>`
        : vazio('Você ainda não avaliou ninguém', 'Conte como foi a sua experiência com hospedagens, guias e agências.')}
    </section>

    <section class="bloco-conta" id="viagens">
      <div class="total-pegada" data-revelar>
        <span class="icone-redondo">${icone('pegada')}</span>
        <div><strong>${fmtNumero(kgTotal, kgTotal >= 100 ? 0 : 1)} kg</strong><br>
          <span>de CO₂e em ${plural(viagens.length, 'viagem registrada', 'viagens registradas')}</span></div>
        <a class="btn btn-lima" href="pegada.html#viagens" style="margin-left:auto">Ver minhas viagens ${icone('seta')}</a>
      </div>
    </section>`;

  conteudo.querySelectorAll('[data-cancelar]').forEach(b => b.addEventListener('click', () => cancelar(reservas.find(r => String(r.idReserva) === b.dataset.cancelar))));
  revelar(conteudo);
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
}

function itemReserva(r) {
  const primeiro = r.itens[0];
  const data = primeiro ? dataLocal(primeiro.dataVisita) : dataLocal(r.datahora);
  const futura = primeiro && primeiro.dataVisita >= hojeISO();
  const pessoas = r.itens.reduce((s, i) => s + i.qtdPessoas, 0);
  return `
    <article class="reserva-item ${r.status === 'cancelada' ? 'cancelada' : ''}" data-revelar>
      <div class="data-bloco"><strong>${data.getDate()}</strong><small>${data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></div>
      <div>
        <strong>${r.itens.map(i => esc(i.nomeAtrativo)).join(' + ')}</strong>
        <div class="suave pequeno">${r.itens.map(i => `${fmtDiaSemana(i.dataVisita)}, ${fmtData(i.dataVisita)} às ${fmtHora(i.horaInicio)}`).join(' · ')}</div>
        <div class="suave pequeno">${plural(pessoas, 'pessoa', 'pessoas')} · reserva #${String(r.idReserva).padStart(5, '0')}</div>
      </div>
      <div class="reserva-acoes">
        <strong>${Number(r.valorTotal) === 0 ? 'Gratuito' : fmtMoeda(r.valorTotal)}</strong>
        ${r.status === 'cancelada'
          ? '<span class="etiqueta vermelha">Cancelada</span>'
          : futura
            ? `<button class="btn btn-mini btn-contorno" data-cancelar="${r.idReserva}">Cancelar</button>`
            : '<span class="etiqueta">Realizada</span>'}
      </div>
    </article>`;
}

function cancelar(r) {
  const d = abrirModal({
    titulo: 'Cancelar reserva',
    largura: 'pequena',
    html: `<p>Cancelar a reserva <b>#${String(r.idReserva).padStart(5, '0')}</b> de ${r.itens.map(i => esc(i.nomeAtrativo)).join(' + ')}?
      As vagas voltam para o horário e outra pessoa poderá reservar.</p>
      <div class="botoes-linha"><button class="btn btn-perigo" id="confirmar">Cancelar reserva</button>
      <button class="btn btn-contorno" id="manter">Manter</button></div>`,
  });
  d.querySelector('#manter').addEventListener('click', () => d.fechar());
  d.querySelector('#confirmar').addEventListener('click', async e => {
    try {
      await comBotao(e.currentTarget, () => api(`/reservas/${r.idReserva}/cancelar`, { metodo: 'PATCH' }));
      d.fechar();
      toast('Reserva cancelada. As vagas foram liberadas.', 'info');
      carregar();
    } catch (erro) { toast(erro.message, 'erro'); }
  });
}

document.addEventListener('sessao', carregar);
carregar();
