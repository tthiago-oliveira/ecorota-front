// =====================================================================
// Área do gestor: visão geral, auditoria do Selo EcoRota, capacidade de carga e horários,
// cadastros (municípios, destinos, atrativos), transporte e emissões, critérios do selo
// Rotas: os GET de todas as tabelas e os POST/PATCH de cada formulário (estão citados em cada parte)
// =====================================================================
montarLayout('gestor');

const conteudo = document.getElementById('painel-conteudo');
const EIXOS = { ambiental: 'Ambiental', social: 'Social', economico: 'Econômico', gestao: 'Gestão' };
const STATUS_SELO = { em_analise: ['Em análise', 'ambar'], verificada: ['Verificada', 'verde'], recusada: ['Recusada', 'vermelha'] };
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
let dados = {};
let aba = (location.hash || '#visao').slice(1);
let certAberta = null;      // pedido do selo em auditoria
let atrativoHorarios = null;

async function recarregar() {
  const nomes = ['municipios', 'destinos', 'atrativos', 'capacidades-carga', 'janelas-visitacao', 'reservas', 'fornecedores',
    'certificacoes', 'criterios-sustentabilidade', 'avaliacoes', 'modais-transporte', 'fatores-emissao'];
  try {
    const r = await Promise.all(nomes.map(n => api('/' + n)));
    dados = Object.fromEntries(nomes.map((n, i) => [n.replace(/-/g, '_'), r[i]]));
  } catch (erro) {
    conteudo.innerHTML = vazio('Não foi possível carregar o painel', esc(erro.message));
    return false;
  }
  const pendentes = dados.certificacoes.filter(c => c.status === 'em_analise').length;
  const c = document.getElementById('c-selos');
  c.hidden = !pendentes;
  c.textContent = pendentes;
  return true;
}

function abrirAba(nome) {
  aba = PARTES[nome] ? nome : 'visao';
  history.replaceState(null, '', '#' + aba);
  document.querySelectorAll('#menu-painel [data-aba]').forEach(b => b.classList.toggle('ativa', b.dataset.aba === aba));
  PARTES[aba]();
  revelar(conteudo);
}

// envia um formulário, mostra o erro no campo certo e redesenha a parte atual
async function enviar(form, rota, corpo, sucesso, metodo) {
  limparErros(form);
  try {
    const r = await comBotao(form.querySelector('button[type="submit"]'), () => api(rota, { corpo, metodo }));
    toast(sucesso);
    await recarregar();
    abrirAba(aba);
    return r;
  } catch (erro) {
    mostrarErros(form, erro.campos, erro.campos ? '' : erro.message);
    return null;
  }
}

const opcoes = (lista, valor, texto, sel) => lista.map(x => `<option value="${x[valor]}" ${String(x[valor]) === String(sel) ? 'selected' : ''}>${esc(texto(x))}</option>`).join('');
const etiquetaStatus = s => `<span class="etiqueta ${STATUS_SELO[s]?.[1] || ''}">${STATUS_SELO[s]?.[0] || s}</span>`;

// ---------------------------------------------------------------- visão geral
function visao() {
  const d = dados;
  if (!d.municipios.length) {
    conteudo.innerHTML = vazio('O banco está vazio', 'Carregue os dados de demonstração para ver o painel funcionando.',
      `<button class="btn" id="demo">${icone('brilho')}Carregar dados de demonstração</button>`);
    document.getElementById('demo').addEventListener('click', abrirDemonstracao);
    return;
  }
  const hoje = hojeISO(), fim = somarDias(hoje, 6);
  const semana = d.janelas_visitacao.filter(j => j.dataVisita >= hoje && j.dataVisita <= fim);
  const abertas = semana.reduce((s, j) => s + j.vagasTotal, 0);
  const ocupadas = semana.reduce((s, j) => s + j.vagasOcupadas, 0);
  const confirmadas = d.reservas.filter(r => r.status === 'confirmada');
  const reivindicados = new Set(d.fornecedores.filter(f => f.perfilReivindicado).map(f => f.idFornecedor));
  const semResposta = d.avaliacoes.filter(a => !a.resposta && reivindicados.has(a.idFornecedor)).length;

  const porAtrativo = d.atrativos.map(a => {
    const js = semana.filter(j => j.idAtrativo === a.idAtrativo);
    const t = js.reduce((s, j) => s + j.vagasTotal, 0), o = js.reduce((s, j) => s + j.vagasOcupadas, 0);
    return { a, t, o, pct: t ? Math.round((o / t) * 100) : 0 };
  }).sort((x, y) => y.pct - x.pct);

  conteudo.innerHTML = `
    <div class="kpis" data-revelar>
      <div class="kpi"><strong>${confirmadas.length}</strong><span>reservas confirmadas</span></div>
      <div class="kpi"><strong>${abertas ? Math.round((ocupadas / abertas) * 100) : 0}%</strong><span>de ocupação nos próximos 7 dias</span></div>
      <div class="kpi"><strong>${d.certificacoes.filter(c => c.status === 'em_analise').length}</strong><span>pedidos do selo para auditar</span></div>
      <div class="kpi"><strong>${semResposta}</strong><span>avaliações esperando resposta</span></div>
    </div>
    <section class="cartao" data-revelar>
      <h3>Ocupação dos próximos 7 dias</h3>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Atrativo</th><th>Destino</th><th class="num">Vagas abertas</th><th class="num">Reservadas</th><th style="width:28%">Ocupação</th></tr></thead>
        <tbody>${porAtrativo.map(({ a, t, o, pct }) => `<tr>
          <td><a href="atrativo.html?id=${a.idAtrativo}">${esc(a.nome)}</a></td><td>${esc(a.nomeDestino)}</td>
          <td class="num">${t}</td><td class="num">${o}</td>
          <td><div class="ocupacao-linha"><span class="ocupacao ${pct >= 90 ? 'cheia' : pct >= 70 ? 'alta' : ''}"><span style="width:${pct}%"></span></span><b>${pct}%</b></div></td></tr>`).join('')}</tbody>
      </table></div>
    </section>
    <section class="cartao" data-revelar>
      <h3>Últimas reservas</h3>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Reserva</th><th>Viajante</th><th>Atrativo</th><th>Visita</th><th class="num">Pessoas</th><th>Situação</th></tr></thead>
        <tbody>${[...d.reservas].sort((a, b) => b.idReserva - a.idReserva).slice(0, 8).map(r => `<tr>
          <td>#${String(r.idReserva).padStart(5, '0')}</td><td>${esc(r.nomeViajante)}</td>
          <td>${r.itens.map(i => esc(i.nomeAtrativo)).join(', ')}</td>
          <td>${r.itens.map(i => `${fmtData(i.dataVisita)} ${fmtHora(i.horaInicio)}`).join(', ')}</td>
          <td class="num">${r.itens.reduce((s, i) => s + i.qtdPessoas, 0)}</td>
          <td><span class="etiqueta ${r.status === 'confirmada' ? 'verde' : 'vermelha'}">${r.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}</span></td></tr>`).join('')
          || '<tr><td colspan="6" class="suave">Nenhuma reserva ainda.</td></tr>'}</tbody>
      </table></div>
    </section>
    <div class="aviso-banco discreto" data-revelar>
      <div><strong>Dados de demonstração</strong> Se a carga parou no meio, rode de novo: o site confere o que o banco já tem e só cadastra o que falta.</div>
      <button class="btn btn-contorno" id="demo">${icone('brilho')}Completar demonstração</button>
    </div>`;
  document.getElementById('demo').addEventListener('click', abrirDemonstracao);
}

// ---------------------------------------------------------------- Selo EcoRota: pedidos e auditoria
function selos() {
  if (certAberta) return auditoria(certAberta);
  const lista = [...dados.certificacoes].sort((a, b) => (a.status === 'em_analise' ? -1 : 0) - (b.status === 'em_analise' ? -1 : 0) || b.idFornCert - a.idFornCert);
  conteudo.innerHTML = `
    <section class="cartao" data-revelar>
      <h3>Pedidos do Selo EcoRota</h3>
      <p class="suave pequeno">Abra um pedido para conferir a prova de cada critério. O selo só pode ser aprovado com todos os critérios obrigatórios atendidos.</p>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Pedido</th><th>Fornecedor</th><th>Enviado em</th><th>Validade</th><th class="num">Pontos</th><th>Situação</th><th></th></tr></thead>
        <tbody>${lista.map(c => `<tr>
          <td><strong>${esc(c.numero)}</strong></td>
          <td><a href="fornecedor.html?id=${c.idFornecedor}">${esc(c.nomeFornecedor)}</a></td>
          <td>${fmtData(c.dataEmissao)}</td><td>${fmtData(c.dataValidade)}</td>
          <td class="num">${c.pontuacaoMaxima ? `${c.pontuacaoObtida}/${c.pontuacaoMaxima}` : '—'}</td>
          <td>${etiquetaStatus(c.status)}</td>
          <td class="num"><button class="btn btn-mini ${c.status === 'em_analise' ? '' : 'btn-contorno'}" data-auditar="${c.idFornCert}">${c.status === 'em_analise' ? 'Auditar' : 'Ver'}</button></td></tr>`).join('')
          || '<tr><td colspan="7" class="suave">Nenhum pedido ainda. Os fornecedores pedem o selo pelo próprio perfil.</td></tr>'}</tbody>
      </table></div>
    </section>`;
  conteudo.querySelectorAll('[data-auditar]').forEach(b => b.addEventListener('click', () => { certAberta = Number(b.dataset.auditar); selos(); revelar(conteudo); }));
}

function auditoria(idCert) {
  const c = dados.certificacoes.find(x => x.idFornCert === idCert);
  if (!c) { certAberta = null; return selos(); }
  const feitos = new Map(c.itensAuditoria.map(i => [i.idCriterio, i]));
  const criterios = [...dados.criterios_sustentabilidade].sort((a, b) => (b.obrigatorio - a.obrigatorio) || (b.peso - a.peso));
  const editavel = c.status === 'em_analise';
  const obrig = criterios.filter(x => x.obrigatorio);
  const obrigOk = obrig.filter(x => feitos.get(x.idCriterio)?.atendido).length;

  conteudo.innerHTML = `
    <button class="btn btn-mini btn-contorno" id="voltar" type="button">${icone('voltar')}Todos os pedidos</button>
    <section class="cartao auditoria" data-revelar>
      <div class="linha-titulo"><div>
        <span class="sobretitulo">Pedido ${esc(c.numero)}</span>
        <h2>${esc(c.nomeFornecedor)}</h2>
        <p class="suave pequeno">Enviado em ${fmtData(c.dataEmissao)} · validade até ${fmtData(c.dataValidade)}
          ${c.urlComprovante ? ` · <a href="${esc(c.urlComprovante)}" target="_blank" rel="noopener">abrir as provas enviadas</a>` : ''}</p></div>
        ${etiquetaStatus(c.status)}</div>
      ${criterios.map(cr => {
        const item = feitos.get(cr.idCriterio);
        return `<div class="criterio-linha ${item ? 'feito' : ''}">
          <div><strong>${esc(cr.descricao)}</strong>
            <div class="suave pequeno">${EIXOS[cr.eixo] || cr.eixo} <small class="peso">peso ${cr.peso}</small>${cr.obrigatorio ? '<small class="obrigatorio">obrigatório</small>' : ''}</div>
            ${item
              ? `<p class="resultado-item ${item.atendido ? 'ok' : 'nao'}">${icone(item.atendido ? 'check' : 'x')}${item.atendido ? 'Atendido' : 'Não atendido'}
                  ${item.evidenciaUrl ? ` · <a href="${esc(item.evidenciaUrl)}" target="_blank" rel="noopener">prova</a>` : ''}${item.observacao ? ` · ${esc(item.observacao)}` : ''}</p>`
              : editavel ? `<form class="campos" data-criterio="${cr.idCriterio}">
                  <input name="evidenciaUrl" type="url" maxlength="255" placeholder="Link da prova (obrigatório se atendido)">
                  <input name="observacao" maxlength="500" placeholder="Observação (opcional)">
                </form>` : '<p class="suave pequeno">Não auditado.</p>'}
          </div>
          <div class="acoes-criterio">${!item && editavel ? `
            <label class="interruptor"><input type="checkbox" data-atendido="${cr.idCriterio}"> Atendido</label>
            <button class="btn btn-mini" data-registrar="${cr.idCriterio}" type="button">Registrar</button>` : ''}</div>
        </div>`;
      }).join('')}
      <div class="placar">
        <div><strong>${c.pontuacaoObtida}</strong> de ${c.pontuacaoMaxima} pontos nos critérios auditados ·
          obrigatórios atendidos: <strong>${obrigOk}/${obrig.length}</strong> · ${c.itensAuditoria.length} de ${criterios.length} critérios auditados</div>
        ${editavel ? `<div class="botoes-linha">
          <button class="btn btn-lima" id="aprovar" type="button">${icone('selo')}Aprovar selo</button>
          <button class="btn btn-claro" id="recusar" type="button">Recusar pedido</button></div>` : ''}
      </div>
      <div id="erro-auditoria"></div>
    </section>`;

  document.getElementById('voltar').addEventListener('click', () => { certAberta = null; selos(); revelar(conteudo); });
  conteudo.querySelectorAll('[data-registrar]').forEach(b => b.addEventListener('click', async () => {
    const id = Number(b.dataset.registrar);
    const form = conteudo.querySelector(`form[data-criterio="${id}"]`);
    const atendido = conteudo.querySelector(`[data-atendido="${id}"]`).checked;
    const evidenciaUrl = form.evidenciaUrl.value.trim();
    limparErros(form);
    // o banco recusa critério atendido sem prova (CHECK ck_ia_evidencia); aqui o aviso vem antes
    if (atendido && !evidenciaUrl) return mostrarErros(form, { evidenciaUrl: 'Critério atendido precisa do link da prova.' });
    try {
      await comBotao(b, () => api(`/certificacoes/${c.idFornCert}/itens-auditoria`, {
        corpo: { idCriterio: id, atendido, evidenciaUrl: evidenciaUrl || null, observacao: form.observacao.value.trim() || null },
      }));
      toast(atendido ? 'Critério registrado como atendido.' : 'Critério registrado como não atendido.');
      await recarregar();
      auditoria(c.idFornCert);
    } catch (erro) { mostrarErros(form, erro.campos, erro.campos ? '' : erro.message); }
  }));
  const decidir = status => async e => {
    document.getElementById('erro-auditoria').innerHTML = '';
    try {
      await comBotao(e.currentTarget, () => api(`/certificacoes/${c.idFornCert}/status`, { metodo: 'PATCH', corpo: { status } }));
      toast(status === 'verificada' ? 'Selo aprovado! Ele já aparece no perfil do fornecedor.' : 'Pedido recusado.', status === 'verificada' ? 'ok' : 'info');
      await recarregar();
      auditoria(c.idFornCert);
    } catch (erro) {
      document.getElementById('erro-auditoria').innerHTML = `<p class="erro-form">${icone('alerta')}<span>${esc(erro.message)}</span></p>`;
    }
  };
  document.getElementById('aprovar')?.addEventListener('click', decidir('verificada'));
  document.getElementById('recusar')?.addEventListener('click', decidir('recusada'));
}

// ---------------------------------------------------------------- capacidade de carga e horários
function horarios() {
  const atrativos = [...dados.atrativos].sort(porNome('nome'));
  if (!atrativos.length) { conteudo.innerHTML = vazio('Nenhum atrativo ainda', 'Cadastre um atrativo em "Destinos e atrativos".'); return; }
  if (!atrativos.some(a => a.idAtrativo === atrativoHorarios)) atrativoHorarios = atrativos[0].idAtrativo;
  const id = atrativoHorarios;
  const caps = dados.capacidades_carga.filter(c => c.idAtrativo === id).sort((a, b) => b.vigenciaInicio.localeCompare(a.vigenciaInicio));
  const hoje = hojeISO();
  const js = dados.janelas_visitacao.filter(j => j.idAtrativo === id && j.dataVisita >= hoje)
    .sort((a, b) => (a.dataVisita + a.horaInicio).localeCompare(b.dataVisita + b.horaInicio));
  const amanha = somarDias(hoje, 1);

  conteudo.innerHTML = `
    <div class="cartao" data-revelar>
      <label class="campo">Atrativo<select id="sel-atrativo">${opcoes(atrativos, 'idAtrativo', a => `${a.nome} · ${a.nomeDestino}`, id)}</select></label>
    </div>
    <section class="cartao" data-revelar>
      <h3>Capacidade de carga</h3>
      <p class="suave pequeno">A cota diária e a cota por horário valem entre as datas de início e fim. Um horário novo não pode passar dessas cotas.</p>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Vigência</th><th class="num">Cota por dia</th><th class="num">Cota por horário</th></tr></thead>
        <tbody>${caps.map(c => `<tr><td>${fmtData(c.vigenciaInicio)} a ${fmtData(c.vigenciaFim)}</td><td class="num">${c.cotaDiaria}</td><td class="num">${c.cotaPorJanela}</td></tr>`).join('')
          || '<tr><td colspan="3" class="suave">Sem regra de capacidade cadastrada.</td></tr>'}</tbody>
      </table></div>
      <form class="form-trecho form-capacidade" id="f-capacidade">
        <label class="campo">Início<input name="vigenciaInicio" type="date" required value="${hoje}"></label>
        <label class="campo">Fim<input name="vigenciaFim" type="date" required value="${somarDias(hoje, 365)}"></label>
        <label class="campo">Cota por dia<input name="cotaDiaria" type="number" min="1" required placeholder="Ex.: 120"></label>
        <label class="campo">Cota por horário<input name="cotaPorJanela" type="number" min="1" required placeholder="Ex.: 15"></label>
        <button class="btn" type="submit">Salvar regra</button>
      </form>
    </section>
    <section class="cartao" data-revelar>
      <h3>Horários de visita</h3>
      <form class="form-trecho form-horario" id="f-janela">
        <label class="campo">Data<input name="dataVisita" type="date" required min="${hoje}" value="${amanha}"></label>
        <label class="campo">Horário<input name="horaInicio" type="time" required value="09:00"></label>
        <label class="campo">Vagas<input name="vagasTotal" type="number" min="1" required placeholder="Ex.: 15"></label>
        <button class="btn" type="submit">${icone('mais')}Abrir horário</button>
      </form>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Data</th><th>Horário</th><th class="num">Vagas</th><th class="num">Reservadas</th><th class="num">Livres</th></tr></thead>
        <tbody>${js.slice(0, 40).map(j => `<tr><td>${fmtDiaSemana(j.dataVisita)}, ${fmtData(j.dataVisita)}</td><td>${fmtHora(j.horaInicio)}</td>
          <td class="num">${j.vagasTotal}</td><td class="num">${j.vagasOcupadas}</td><td class="num"><b>${j.vagasDisponiveis}</b></td></tr>`).join('')
          || '<tr><td colspan="5" class="suave">Nenhum horário aberto a partir de hoje.</td></tr>'}</tbody>
      </table></div>
    </section>`;

  document.getElementById('sel-atrativo').addEventListener('change', e => { atrativoHorarios = Number(e.target.value); horarios(); revelar(conteudo); });
  const fc = document.getElementById('f-capacidade');
  fc.addEventListener('submit', e => {
    e.preventDefault();
    enviar(fc, '/capacidades-carga', { idAtrativo: id, vigenciaInicio: fc.vigenciaInicio.value, vigenciaFim: fc.vigenciaFim.value,
      cotaDiaria: Number(fc.cotaDiaria.value), cotaPorJanela: Number(fc.cotaPorJanela.value) }, 'Regra de capacidade salva.');
  });
  const fj = document.getElementById('f-janela');
  fj.addEventListener('submit', e => {
    e.preventDefault();
    enviar(fj, '/janelas-visitacao', { idAtrativo: id, dataVisita: fj.dataVisita.value, horaInicio: fj.horaInicio.value + ':00',
      vagasTotal: Number(fj.vagasTotal.value) }, 'Horário aberto para reserva.');
  });
}

// ---------------------------------------------------------------- cadastros
function cadastros() {
  const d = dados;
  conteudo.innerHTML = `
    <div class="grade-3 cadastros">
      <section class="cartao" data-revelar>
        <h3>${icone('pin', 'ic-inline')} Município</h3>
        <form class="form" id="f-municipio">
          <label class="campo">Nome<input name="nome" required maxlength="120"></label>
          <label class="campo">UF<select name="uf" required>${UFS.map(u => `<option>${u}</option>`).join('')}</select></label>
          <label class="campo">Código IBGE <span class="opcional">7 números</span><input name="codigoIbge" inputmode="numeric" pattern="[0-9]{7}" maxlength="7"></label>
          <button class="btn btn-bloco" type="submit">Cadastrar município</button>
        </form>
      </section>
      <section class="cartao" data-revelar>
        <h3>${icone('mapa', 'ic-inline')} Destino</h3>
        <form class="form" id="f-destino">
          <label class="campo">Município<select name="idMunicipio" required>${opcoes([...d.municipios].sort(porNome('nome')), 'idMunicipio', m => `${m.nome}/${m.uf}`)}</select></label>
          <label class="campo">Nome<input name="nome" required maxlength="120"></label>
          <label class="campo">Tipo <span class="opcional">opcional</span><input name="tipo" maxlength="40" placeholder="Ex.: parque nacional"></label>
          <button class="btn btn-bloco" type="submit">Cadastrar destino</button>
        </form>
      </section>
      <section class="cartao" data-revelar>
        <h3>${icone('montanha', 'ic-inline')} Atrativo</h3>
        <form class="form" id="f-atrativo">
          <label class="campo">Destino<select name="idDestino" required>${opcoes([...d.destinos].sort(porNome('nome')), 'idDestino', x => `${x.nome} · ${x.nomeMunicipio}`)}</select></label>
          <label class="campo">Nome<input name="nome" required maxlength="150"></label>
          <div class="form-2">
            <label class="campo">Tipo<input name="tipo" maxlength="40" placeholder="Ex.: trilha"></label>
            <label class="campo">Ingresso (R$)<input name="valorIngresso" type="number" min="0" step="0.01" placeholder="0,00"></label>
            <label class="campo">Latitude<input name="latitude" type="number" min="-90" max="90" step="any"></label>
            <label class="campo">Longitude<input name="longitude" type="number" min="-180" max="180" step="any"></label>
          </div>
          <label class="interruptor"><input type="checkbox" name="exigeGuia"> Exige guia</label>
          <button class="btn btn-bloco" type="submit">Cadastrar atrativo</button>
        </form>
      </section>
    </div>
    <section class="cartao" data-revelar>
      <h3>Atrativos cadastrados</h3>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Atrativo</th><th>Destino</th><th>Tipo</th><th class="num">Ingresso</th><th>Guia</th></tr></thead>
        <tbody>${[...d.atrativos].sort(porNome('nome')).map(a => `<tr><td><a href="atrativo.html?id=${a.idAtrativo}">${esc(a.nome)}</a></td>
          <td>${esc(a.nomeDestino)}</td><td>${esc(a.tipo || '—')}</td><td class="num">${ingressoTexto(a.valorIngresso)}</td><td>${a.exigeGuia ? 'Sim' : 'Não'}</td></tr>`).join('')
          || '<tr><td colspan="5" class="suave">Nenhum atrativo ainda.</td></tr>'}</tbody>
      </table></div>
    </section>`;

  const fm = document.getElementById('f-municipio');
  fm.addEventListener('submit', e => {
    e.preventDefault();
    enviar(fm, '/municipios', { nome: fm.nome.value.trim(), uf: fm.uf.value, codigoIbge: fm.codigoIbge.value.trim() || null }, 'Município cadastrado.');
  });
  const fd = document.getElementById('f-destino');
  fd.addEventListener('submit', e => {
    e.preventDefault();
    enviar(fd, '/destinos', { idMunicipio: Number(fd.idMunicipio.value), nome: fd.nome.value.trim(), tipo: fd.tipo.value.trim() || null }, 'Destino cadastrado.');
  });
  const fa = document.getElementById('f-atrativo');
  fa.addEventListener('submit', e => {
    e.preventDefault();
    const num = c => (c.value === '' ? null : Number(c.value));
    enviar(fa, '/atrativos', { idDestino: Number(fa.idDestino.value), nome: fa.nome.value.trim(), tipo: fa.tipo.value.trim() || null,
      latitude: num(fa.latitude), longitude: num(fa.longitude), exigeGuia: fa.exigeGuia.checked, valorIngresso: num(fa.valorIngresso) ?? 0 }, 'Atrativo cadastrado.');
  });
}

// ---------------------------------------------------------------- transporte e emissões
function emissoes() {
  const d = dados;
  conteudo.innerHTML = `
    <div class="grade-2">
      <section class="cartao" data-revelar>
        <h3>Meios de transporte</h3>
        <div class="tabela-rolagem"><table class="tabela">
          <thead><tr><th>Transporte</th><th>Categoria</th></tr></thead>
          <tbody>${d.modais_transporte.map(m => `<tr><td>${icone(iconeModal(m.nome), 'ic-inline')} ${esc(m.nome)}</td><td>${esc(m.categoria || '—')}</td></tr>`).join('')
            || '<tr><td colspan="2" class="suave">Nenhum transporte ainda.</td></tr>'}</tbody>
        </table></div>
        <form class="form-trecho form-dupla" id="f-modal">
          <label class="campo">Nome<input name="nome" required maxlength="60" placeholder="Ex.: Trem"></label>
          <label class="campo">Categoria<input name="categoria" maxlength="40" placeholder="Ex.: ferroviário"></label>
          <button class="btn" type="submit">Adicionar</button>
        </form>
      </section>
      <section class="cartao" data-revelar>
        <h3>Fatores de emissão</h3>
        <div class="tabela-rolagem"><table class="tabela">
          <thead><tr><th>Transporte</th><th class="num">Ano</th><th class="num">kg CO₂e/km</th><th>Fonte</th></tr></thead>
          <tbody>${[...d.fatores_emissao].sort((a, b) => a.nomeModal.localeCompare(b.nomeModal, 'pt-BR') || b.anoVigencia - a.anoVigencia).map(f => `<tr>
            <td>${esc(f.nomeModal)}</td><td class="num">${f.anoVigencia}</td><td class="num">${fmtNumero(f.kgco2ePorKm, 4)}</td><td>${esc(f.fonte)}</td></tr>`).join('')
            || '<tr><td colspan="4" class="suave">Nenhum fator ainda.</td></tr>'}</tbody>
        </table></div>
        <form class="form-trecho" id="f-fator">
          <label class="campo">Transporte<select name="idModal" required>${opcoes(d.modais_transporte, 'idModal', m => m.nome)}</select></label>
          <label class="campo">Ano<input name="anoVigencia" type="number" min="2000" max="2100" required value="${new Date().getFullYear()}"></label>
          <label class="campo">kg/km<input name="kgco2ePorKm" type="number" min="0" step="0.0001" required placeholder="0,0300"></label>
          <label class="campo">Fonte<input name="fonte" required maxlength="150" placeholder="Ex.: GHG Protocol"></label>
          <button class="btn" type="submit">Adicionar</button>
        </form>
      </section>
    </div>`;
  const fm = document.getElementById('f-modal');
  fm.addEventListener('submit', e => { e.preventDefault(); enviar(fm, '/modais-transporte', { nome: fm.nome.value.trim(), categoria: fm.categoria.value.trim() || null }, 'Transporte cadastrado.'); });
  const ff = document.getElementById('f-fator');
  ff.addEventListener('submit', e => {
    e.preventDefault();
    enviar(ff, '/fatores-emissao', { idModal: Number(ff.idModal.value), anoVigencia: Number(ff.anoVigencia.value),
      kgco2ePorKm: Number(ff.kgco2ePorKm.value), fonte: ff.fonte.value.trim() }, 'Fator de emissão cadastrado.');
  });
}

// ---------------------------------------------------------------- critérios do selo
function criterios() {
  const lista = [...dados.criterios_sustentabilidade].sort((a, b) => a.eixo.localeCompare(b.eixo) || b.peso - a.peso);
  conteudo.innerHTML = `
    <section class="cartao" data-revelar>
      <h3>Critérios da auditoria</h3>
      <p class="suave pequeno">Cada critério tem um peso de 1 a 3. Os obrigatórios precisam ser atendidos para o selo ser aprovado.</p>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Eixo</th><th>Critério</th><th class="num">Peso</th><th>Obrigatório</th></tr></thead>
        <tbody>${lista.map(c => `<tr><td>${EIXOS[c.eixo] || c.eixo}</td><td>${esc(c.descricao)}</td><td class="num">${c.peso}</td>
          <td>${c.obrigatorio ? '<span class="etiqueta ambar">Sim</span>' : 'Não'}</td></tr>`).join('')
          || '<tr><td colspan="4" class="suave">Nenhum critério ainda.</td></tr>'}</tbody>
      </table></div>
      <form class="form-trecho form-criterio" id="f-criterio">
        <label class="campo">Eixo<select name="eixo">${Object.entries(EIXOS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
        <label class="campo">Descrição<input name="descricao" required maxlength="255" placeholder="Ex.: Usa produtos de limpeza biodegradáveis"></label>
        <label class="campo">Peso<select name="peso"><option>1</option><option selected>2</option><option>3</option></select></label>
        <label class="interruptor"><input type="checkbox" name="obrigatorio"> Obrigatório</label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
    </section>`;
  const fc = document.getElementById('f-criterio');
  fc.addEventListener('submit', e => {
    e.preventDefault();
    enviar(fc, '/criterios-sustentabilidade', { eixo: fc.eixo.value, descricao: fc.descricao.value.trim(), peso: Number(fc.peso.value), obrigatorio: fc.obrigatorio.checked }, 'Critério cadastrado.');
  });
}

const PARTES = { visao, selos, horarios, cadastros, emissoes, criterios };

document.querySelectorAll('#menu-painel [data-aba]').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.aba === 'selos') certAberta = null;
  abrirAba(b.dataset.aba);
}));

recarregar().then(ok => { if (ok) abrirAba(aba); });
