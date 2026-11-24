// =====================================================================
// Perfil do fornecedor: Selo EcoRota, avaliações, resposta do dono, reivindicação e pedido do selo
// Rotas: GET /api/fornecedores/{id} · GET /api/avaliacoes?idFornecedor= · GET /api/avaliacoes/fornecedor/{id}/resumo
//        GET /api/certificacoes?idFornecedor= · POST /api/avaliacoes · PATCH /api/avaliacoes/{id}/responder
//        PATCH /api/fornecedores/{id}/reivindicar · POST /api/certificacoes
// =====================================================================
montarLayout('fornecedores');

const idFornecedor = parametro('id');
let fornecedor = null;
let avaliacoes = [];
let situacao = { tipo: 'sem', cert: null };

// a ilustração do cabeçalho combina com a região do fornecedor
function arteDaCidade(nome) {
  const t = semAcento(nome);
  if (/noronha|ilha|praia|porto/.test(t)) return 'praia';
  if (/bonito|bodoquena/.test(t)) return 'rio';
  if (/paraiso|cavalcante|chapada|goias/.test(t)) return 'chapada';
  return 'floresta';
}

const fmtCnpj = c => String(c || '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

async function carregar() {
  if (!idFornecedor) return erroPagina('Nenhum fornecedor escolhido', 'Volte para a lista e escolha um fornecedor.');
  let resumo, certificacoes;
  try {
    [fornecedor, avaliacoes, resumo, certificacoes] = await Promise.all([
      api(`/fornecedores/${encodeURIComponent(idFornecedor)}`),
      api(`/avaliacoes?idFornecedor=${encodeURIComponent(idFornecedor)}`),
      api(`/avaliacoes/fornecedor/${encodeURIComponent(idFornecedor)}/resumo`),
      api(`/certificacoes?idFornecedor=${encodeURIComponent(idFornecedor)}`),
    ]);
  } catch (erro) {
    return erroPagina(erro.status === 404 ? 'Fornecedor não encontrado' : 'Não foi possível carregar o perfil', esc(erro.message));
  }
  situacao = situacaoSelo(certificacoes);
  document.title = `${fornecedor.nomeFantasia} · EcoRota`;

  const cab = document.getElementById('cabecalho');
  if (!cab.querySelector('.arte')) cab.insertAdjacentHTML('afterbegin', Arte.cena(arteDaCidade(fornecedor.nomeMunicipio), fornecedor.idFornecedor));
  document.getElementById('trilha-nome').textContent = fornecedor.nomeFantasia;
  document.getElementById('icone').innerHTML = icone(iconeFornecedor(fornecedor.tipo));
  document.getElementById('tipo-local').textContent = `${fornecedor.tipo || 'fornecedor'} · ${fornecedor.nomeMunicipio}/${fornecedor.uf}`;
  document.getElementById('nome').textContent = fornecedor.nomeFantasia;

  const respondidas = avaliacoes.filter(a => a.resposta).length;
  document.getElementById('marcas').innerHTML = `
    ${seloBadge(situacao)}
    ${resumo.totalAvaliacoes ? `<span class="etiqueta branca">${icone('estrela')}${fmtNumero(resumo.notaMedia, 1)} · ${plural(resumo.totalAvaliacoes, 'avaliação', 'avaliações')}</span>` : ''}
    ${fornecedor.perfilReivindicado
      ? `<span class="etiqueta branca">${icone('conversa')}Responde ${avaliacoes.length ? Math.round((respondidas / avaliacoes.length) * 100) : 0}% das avaliações</span>`
      : `<span class="etiqueta branca">${icone('info')}Perfil não reivindicado</span>`}
    ${fornecedor.origemCadastro === 'cadastur' ? `<span class="etiqueta branca">${icone('documento')}Cadastro no Cadastur</span>` : ''}`;

  // o "empurrão" do marketing reverso: todo visitante vê que o negócio ainda não responde
  document.getElementById('aviso-perfil').innerHTML = fornecedor.perfilReivindicado ? '' : `
    <div class="aviso-perfil" data-revelar>${icone('info')}
      <div><strong>Este fornecedor ainda não reivindicou o perfil e não responde às avaliações.</strong>
        É o dono? Reivindique o perfil sem custo, ao lado.</div></div>`;

  desenharResumo(resumo);
  desenharAvaliacoes();
  desenharSelo();
  desenharAreaDoDono();
  document.getElementById('layout').hidden = false;
  revelar();
}

function erroPagina(titulo, texto) {
  document.getElementById('nome').textContent = titulo;
  document.getElementById('cabecalho').insertAdjacentHTML('afterbegin', Arte.cena('floresta', 2));
  document.getElementById('erro-pagina').innerHTML = `<div class="espaco-vazio">${vazio(titulo, texto, '<a class="btn" href="fornecedores.html">Ver fornecedores</a>')}</div>`;
}

// ---------------------------------------------------------------- avaliações
function desenharResumo(resumo) {
  const caixa = document.getElementById('resumo');
  if (!resumo.totalAvaliacoes) { caixa.innerHTML = ''; return; }
  const contagem = [5, 4, 3, 2, 1].map(n => [n, avaliacoes.filter(a => a.nota === n).length]);
  caixa.innerHTML = `
    <div class="media-grande"><strong>${fmtNumero(resumo.notaMedia, 1)}</strong>${estrelas(resumo.notaMedia)}
      <span class="suave pequeno">${plural(resumo.totalAvaliacoes, 'avaliação', 'avaliações')}</span></div>
    <div class="distribuicao">
      ${contagem.map(([n, q]) => `<div><span>${n}★</span><span class="ocupacao"><span style="width:${(q / resumo.totalAvaliacoes) * 100}%"></span></span><span>${q}</span></div>`).join('')}
    </div>`;
}

function desenharAvaliacoes() {
  const caixa = document.getElementById('avaliacoes');
  if (!avaliacoes.length) {
    caixa.innerHTML = vazio('Ninguém avaliou ainda', 'Esteve aqui? Seja o primeiro a contar como foi.');
    return;
  }
  const ordem = [...avaliacoes].sort((a, b) => (a.dataAvaliacao < b.dataAvaliacao ? 1 : -1));
  caixa.innerHTML = ordem.map(a => `
    <article class="avaliacao">
      <div class="quem"><span class="avatar">${esc(iniciais(a.nomeViajante))}</span>
        <div><strong>${esc(a.nomeViajante)}</strong><small>${fmtDataLonga(a.dataAvaliacao)}</small></div>
        <span class="nota-direita">${estrelas(a.nota)}</span></div>
      <p>${esc(a.comentario)}</p>
      ${a.resposta
        ? `<div class="resposta"><strong>${icone('conversa')}Resposta de ${esc(fornecedor.nomeFantasia)} · ${fmtData(a.dataResposta)}</strong>${esc(a.resposta)}</div>`
        : fornecedor.perfilReivindicado
          ? `<button class="btn btn-mini btn-contorno responder" data-id="${a.idAvaliacao}">${icone('conversa')}Responder como dono</button>`
          : ''}
    </article>`).join('');
  caixa.querySelectorAll('.responder').forEach(b => b.addEventListener('click', () => responder(Number(b.dataset.id))));
}

function responder(idAvaliacao) {
  const a = avaliacoes.find(x => x.idAvaliacao === idAvaliacao);
  const d = abrirModal({
    titulo: 'Responder avaliação',
    html: `
      <p class="modal-motivo">${icone('info')}Área do dono (demonstração): no sistema final, só o dono do perfil entra aqui.</p>
      <blockquote class="citacao">${estrelas(a.nota)}<p>${esc(a.comentario)}</p><small>${esc(a.nomeViajante)}</small></blockquote>
      <form class="form" id="f-resposta">
        <label class="campo">Sua resposta<textarea name="resposta" required maxlength="1000" placeholder="Agradeça e conte o que vocês fazem ou vão fazer"></textarea></label>
        <button class="btn btn-bloco" type="submit">Publicar resposta</button>
      </form>`,
  });
  const form = d.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(form);
    try {
      await comBotao(form.querySelector('button'), () => api(`/avaliacoes/${idAvaliacao}/responder`, { metodo: 'PATCH', corpo: { resposta: form.resposta.value.trim() } }));
      d.fechar();
      toast('Resposta publicada no perfil.');
      carregar();
    } catch (erro) { mostrarErros(form, erro.campos, erro.campos ? '' : erro.message); }
  });
}

document.getElementById('f-avaliar').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  limparErros(form);
  const nota = form.querySelector('input[name="nota"]:checked');
  if (!nota) return mostrarErros(form, null, 'Escolha uma nota de 1 a 5 estrelas.');
  const viajante = await exigirLogin('Entre na sua conta para publicar a avaliação.');
  if (!viajante) return;
  try {
    await comBotao(form.querySelector('button'), () => api('/avaliacoes', {
      corpo: { idFornecedor: fornecedor.idFornecedor, idViajante: viajante.idViajante, nota: Number(nota.value), comentario: form.comentario.value.trim() },
    }));
    form.reset();
    toast('Avaliação publicada. Obrigado!');
    carregar();
  } catch (erro) {
    // o banco tem UNIQUE (id_fornecedor, id_viajante): uma avaliação por viajante
    const mensagem = erro.status === 409 ? 'Você já avaliou este fornecedor. Cada viajante avalia uma vez.' : erro.message;
    mostrarErros(form, erro.campos, erro.campos ? '' : mensagem);
  }
});

// ---------------------------------------------------------------- Selo EcoRota
function desenharSelo() {
  const caixa = document.getElementById('bloco-selo');
  const { tipo, cert } = situacao;
  if (tipo === 'sem' || tipo === 'recusado') {
    caixa.innerHTML = `
      <h3>Selo EcoRota</h3>
      <div class="selo-vazio">${icone('selo')}</div>
      <p class="suave">Este fornecedor ainda não tem o Selo EcoRota. O selo é concedido depois de uma auditoria das práticas
        sustentáveis, com a prova de cada critério.</p>
      <a class="link-seta" href="sobre.html#selo">Como funciona o selo ${icone('seta')}</a>`;
    return;
  }
  if (tipo === 'em_analise') {
    caixa.innerHTML = `
      <h3>Selo EcoRota</h3>
      <span class="selo-badge analise">${icone('relogio')}Pedido em análise</span>
      <p class="suave">O pedido <b>${esc(cert.numero)}</b> foi enviado em ${fmtData(cert.dataEmissao)}. A equipe do EcoRota está
        conferindo a prova de cada critério.</p>`;
    return;
  }
  const pct = cert.pontuacaoMaxima ? Math.round((cert.pontuacaoObtida / cert.pontuacaoMaxima) * 100) : 0;
  const C = 364.4;
  caixa.innerHTML = `
    <h3>Selo EcoRota</h3>
    <div class="anel">
      <svg viewBox="0 0 136 136" aria-hidden="true">
        <circle cx="68" cy="68" r="58" fill="none" stroke="var(--verde-100)" stroke-width="12"/>
        <circle class="arco-selo" cx="68" cy="68" r="58" fill="none" stroke="${tipo === 'valido' ? 'var(--verde)' : '#c3ccc6'}" stroke-width="12"
          stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/>
      </svg>
      <div class="centro"><strong>${pct}</strong><span>de 100 pontos</span></div>
    </div>
    <p class="centro-texto">${tipo === 'valido'
      ? `${seloBadge(situacao)}<br><span class="suave pequeno">Nº ${esc(cert.numero)} · válido até ${fmtData(cert.dataValidade)}</span>`
      : `<span class="selo-badge vencido">${icone('alerta')}Venceu em ${fmtData(cert.dataValidade)}</span>`}</p>
    <ul class="criterios">
      ${cert.itensAuditoria.map(i => `<li class="${i.atendido ? '' : 'nao'}">${icone(i.atendido ? 'check' : 'x')}<span>${esc(i.descricaoCriterio)}${i.obrigatorio ? ' <small class="obrigatorio">obrigatório</small>' : ''}</span></li>`).join('')}
    </ul>`;
  requestAnimationFrame(() => setTimeout(() => {
    const arco = caixa.querySelector('.arco-selo');
    arco.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.2,.8,.3,1)';
    arco.style.strokeDashoffset = C * (1 - pct / 100);
  }, 150));
}

// ---------------------------------------------------------------- área do dono (reivindicar e pedir o selo)
function desenharAreaDoDono() {
  const caixa = document.getElementById('bloco-dono');
  if (!fornecedor.perfilReivindicado) {
    caixa.innerHTML = `
      <h3>É o dono deste negócio?</h3>
      <p class="suave pequeno">Reivindique o perfil para responder às avaliações e pedir o Selo EcoRota. Não tem custo.</p>
      <form class="form" id="f-reivindicar">
        <label class="campo">CNPJ<input name="cnpj" required inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00"
          value="${fornecedor.cnpj ? fmtCnpj(fornecedor.cnpj) : ''}"></label>
        <label class="campo">Razão social<input name="razaoSocial" required maxlength="150"></label>
        <button class="btn btn-bloco" type="submit">${icone('documento')}Reivindicar perfil</button>
      </form>`;
    const form = caixa.querySelector('form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      limparErros(form);
      try {
        await comBotao(form.querySelector('button'), () => api(`/fornecedores/${fornecedor.idFornecedor}/reivindicar`, {
          metodo: 'PATCH', corpo: { cnpj: form.cnpj.value.replace(/\D/g, ''), razaoSocial: form.razaoSocial.value.trim() },
        }));
        toast('Perfil reivindicado! Agora você pode responder às avaliações.');
        carregar();
      } catch (erro) {
        const campo = /cnpj/i.test(erro.message) ? { cnpj: erro.message } : null;
        mostrarErros(form, erro.campos || campo, erro.campos || campo ? '' : erro.message);
      }
    });
    return;
  }

  const base = `
    <h3>Área do dono</h3>
    <p class="suave pequeno">${icone('check', 'ic-inline')} Perfil reivindicado em ${fmtData(fornecedor.dataReivindicacao)}
      · CNPJ ${esc(fmtCnpj(fornecedor.cnpj))}</p>`;
  const { tipo, cert } = situacao;
  if (tipo === 'em_analise') {
    caixa.innerHTML = base + `<p class="ok-form">${icone('relogio')}<span>Seu pedido ${esc(cert.numero)} está em análise.</span></p>`;
    return;
  }
  if (tipo === 'valido') {
    caixa.innerHTML = base + `<p class="ok-form">${icone('selo')}<span>Seu Selo EcoRota vale até ${fmtData(cert.dataValidade)}.</span></p>`;
    return;
  }
  caixa.innerHTML = base + `
    <h4 class="titulo-mini">Pedir o Selo EcoRota</h4>
    <p class="suave pequeno">Mande o link de uma pasta com as provas de cada prática (fotos, contas de água e luz, contratos).
      A equipe confere critério por critério.</p>
    <form class="form" id="f-selo">
      <label class="campo">Link das provas<input name="urlComprovante" type="url" required maxlength="255" placeholder="https://..."></label>
      <button class="btn btn-bloco" type="submit">${icone('selo')}Enviar pedido</button>
    </form>`;
  const form = caixa.querySelector('form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    limparErros(form);
    try {
      await comBotao(form.querySelector('button'), async () => {
        // número do pedido: ECO-ano-sequência (o banco não deixa repetir: UNIQUE em numero)
        const ano = new Date().getFullYear();
        const usados = (await api('/certificacoes')).map(c => c.numero.match(new RegExp(`^ECO-${ano}-(\\d+)$`))).filter(Boolean).map(m => Number(m[1]));
        const numero = `ECO-${ano}-${String(Math.max(0, ...usados) + 1).padStart(4, '0')}`;
        const hoje = hojeISO();
        return api('/certificacoes', {
          corpo: { idFornecedor: fornecedor.idFornecedor, numero, dataEmissao: hoje, dataValidade: somarDias(hoje, 365), urlComprovante: form.urlComprovante.value.trim() },
        });
      });
      toast('Pedido enviado! Agora é com a auditoria.');
      carregar();
    } catch (erro) { mostrarErros(form, erro.campos, erro.campos ? '' : erro.message); }
  });
}

carregar();
