// =====================================================================
// EcoRota · cartões e blocos usados em mais de uma tela
// =====================================================================

// Cartão de atrativo (lista e página inicial). "proxima" = próxima janela com vaga.
function cartaoAtrativo(a, destino, proxima) {
  const lugar = destino ? `${destino.nome} · ${destino.nomeMunicipio}/${destino.uf}` : a.nomeDestino;
  return `
    <a class="card-lugar" href="atrativo.html?id=${a.idAtrativo}" data-revelar>
      <div class="imagem">${Arte.cena(a.tipo || a.nome, a.idAtrativo)}
        <div class="etiquetas">
          ${a.tipo ? `<span class="etiqueta branca">${esc(a.tipo)}</span>` : ''}
          ${a.exigeGuia ? `<span class="etiqueta branca">${icone('bussola')}Com guia</span>` : ''}
        </div>
        <span class="preco-flutuante">${ingressoTexto(a.valorIngresso)}</span>
      </div>
      <div class="corpo">
        <h3>${esc(a.nome)}</h3>
        <span class="local">${icone('pin')}${esc(lugar)}</span>
        <div class="rodape-card">
          ${proxima
            ? `<span>${icone('calendario', 'ic-inline')} ${fmtDiaSemana(proxima.dataVisita)}, ${fmtDiaMes(proxima.dataVisita)} · ${fmtHora(proxima.horaInicio)}</span>
               <strong>${plural(proxima.vagasDisponiveis, 'vaga', 'vagas')}</strong>`
            : '<span>Sem horários abertos</span><strong>Ver detalhes</strong>'}
        </div>
      </div>
    </a>`;
}

// Cartão grande de destino
function cartaoDestino(d, qtdAtrativos) {
  return `
    <a class="card-lugar card-destino" href="atrativos.html?destino=${d.idDestino}" data-revelar>
      <div class="imagem">${Arte.cena(d.tipo || d.nome, d.idDestino + 40)}
        <span class="etiqueta branca contagem">${plural(qtdAtrativos, 'atrativo', 'atrativos')}</span>
        <div class="sobreposto">
          <h3>${esc(d.nome)}</h3>
          <p>${icone('pin')}${esc(d.nomeMunicipio)}/${esc(d.uf)}${d.tipo ? ` · ${esc(d.tipo)}` : ''}</p>
        </div>
      </div>
    </a>`;
}

// Cartão de fornecedor (lista)
function cartaoFornecedor(f, resumo, situacao) {
  return `
    <a class="card-fornecedor" href="fornecedor.html?id=${f.idFornecedor}" data-revelar>
      <div class="topo-card">
        <span class="icone-tipo">${icone(iconeFornecedor(f.tipo))}</span>
        <div><h3>${esc(f.nomeFantasia)}</h3>
          <span class="suave pequeno">${esc(f.tipo || 'fornecedor')} · ${esc(f.nomeMunicipio)}/${esc(f.uf)}</span></div>
      </div>
      <div class="nota">${resumo
        ? `${estrelas(resumo.media)}<strong>${fmtNumero(resumo.media, 1)}</strong>(${plural(resumo.total, 'avaliação', 'avaliações')})`
        : '<span>Ainda sem avaliações</span>'}</div>
      <div class="marcas">
        ${seloBadge(situacao, true)}
        ${f.perfilReivindicado
          ? `<span class="etiqueta verde">${icone('check')}Responde avaliações</span>`
          : `<span class="etiqueta">${icone('info')}Perfil não reivindicado</span>`}
      </div>
    </a>`;
}

// Fator de emissão vigente de um modal: o do ano atual ou, se não houver, o mais recente
function fatorVigente(fatores, idModal) {
  const ano = new Date().getFullYear();
  const doModal = fatores.filter(f => f.idModal === idModal).sort((a, b) => b.anoVigencia - a.anoVigencia);
  return doModal.find(f => f.anoVigencia <= ano) || doModal[0] || null;
}

// Ícone do meio de transporte pelo nome
function iconeModal(nome) {
  const t = semAcento(nome);
  if (/aviao|aereo|voo/.test(t)) return 'aviao';
  if (/onibus|van/.test(t)) return 'onibus';
  if (/barco|lancha|balsa|navio/.test(t)) return 'barco';
  return 'carro';
}

// Calculadora de pegada: escolhe o transporte, digita a distância e vê o CO₂ e a comparação
function montarCalculadora(elemento, modais, fatores) {
  const opcoes = modais.map(m => ({ ...m, fator: fatorVigente(fatores, m.idModal) })).filter(m => m.fator);
  if (!opcoes.length) {
    elemento.innerHTML = vazio('Sem fatores de emissão', 'Cadastre os meios de transporte e os fatores de emissão no painel do gestor.',
      '<a class="btn btn-pequeno" href="gestor.html#emissoes">Abrir o painel</a>');
    return;
  }
  let escolhido = opcoes[0];
  let km = 900;
  elemento.innerHTML = `
    <span class="rotulo" style="margin-top:0">Meio de transporte</span>
    <div class="modais">${opcoes.map((m, i) => `<button type="button" class="chip ${i ? '' : 'ativo'}" data-modal="${m.idModal}">${icone(iconeModal(m.nome))}${esc(m.nome)}</button>`).join('')}</div>
    <label class="campo">Distância (km)
      <input type="range" min="10" max="3000" step="10" value="${km}" aria-label="Distância em km">
    </label>
    <div class="resultado-pegada"><strong data-kg>0</strong><span class="suave">kg de CO₂e · <span data-km></span> km</span></div>
    <p class="suave pequeno" data-fonte></p>
    <div class="barras" data-barras></div>`;

  const desenhar = () => {
    const kg = km * escolhido.fator.kgco2ePorKm;
    elemento.querySelector('[data-kg]').textContent = fmtNumero(kg, kg >= 100 ? 0 : 1);
    elemento.querySelector('[data-km]').textContent = fmtNumero(km);
    elemento.querySelector('[data-fonte]').textContent = `Fator: ${fmtNumero(escolhido.fator.kgco2ePorKm, 4)} kg/km (${escolhido.fator.anoVigencia}) · Fonte: ${escolhido.fator.fonte}`;
    const max = Math.max(...opcoes.map(m => km * m.fator.kgco2ePorKm)) || 1;
    const barras = elemento.querySelector('[data-barras]');
    barras.innerHTML = opcoes.map(m => {
      const v = km * m.fator.kgco2ePorKm;
      return `<div class="barra-linha ${m === escolhido ? 'destaque' : ''}"><span>${esc(m.nome)}</span>
        <span class="trilho"><span class="preenchido" data-largura="${(v / max) * 100}"></span></span><span class="valor">${fmtKg(v)}</span></div>`;
    }).join('');
    requestAnimationFrame(() => barras.querySelectorAll('[data-largura]').forEach(b => { b.style.width = b.dataset.largura + '%'; }));
  };
  elemento.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => {
    escolhido = opcoes.find(m => String(m.idModal) === b.dataset.modal);
    elemento.querySelectorAll('[data-modal]').forEach(x => x.classList.toggle('ativo', x === b));
    desenhar();
  }));
  elemento.querySelector('input[type="range"]').addEventListener('input', e => { km = Number(e.target.value); desenhar(); });
  desenhar();
}

// Próxima janela com vaga de cada atrativo (a partir de hoje)
function proximasJanelas(janelas) {
  const hoje = hojeISO();
  const mapa = new Map();
  for (const j of [...janelas].sort((a, b) => (a.dataVisita + a.horaInicio).localeCompare(b.dataVisita + b.horaInicio))) {
    if (j.dataVisita < hoje || j.vagasDisponiveis <= 0 || mapa.has(j.idAtrativo)) continue;
    mapa.set(j.idAtrativo, j);
  }
  return mapa;
}

// Aviso de banco vazio (ou só com destinos e atrativos), com o botão que carrega a demonstração pela própria API
function avisoBancoVazio(elemento, incompleto = false) {
  elemento.innerHTML = incompleto ? `
    <div class="aviso-banco" data-revelar>
      <div><strong>Faltam dados para a demonstração.</strong>
        O banco já tem destinos e atrativos, mas ainda não tem horários de visita, fornecedores nem viagens. Complete com os dados de demonstração: o que já existe é aproveitado.</div>
      <button class="btn" id="carregar-demo">${icone('brilho')}Completar dados de demonstração</button>
    </div>` : `
    <div class="aviso-banco" data-revelar>
      <div><strong>O banco ainda está vazio.</strong>
        Carregue os dados de demonstração para ver o EcoRota funcionando: destinos, atrativos, horários, fornecedores e viagens.</div>
      <button class="btn" id="carregar-demo">${icone('brilho')}Carregar dados de demonstração</button>
    </div>`;
  revelar(elemento);
  document.getElementById('carregar-demo').addEventListener('click', () => abrirDemonstracao());
}

// Janela que mostra o andamento da carga de demonstração
function abrirDemonstracao() {
  const d = abrirModal({
    titulo: 'Dados de demonstração',
    html: `<p class="suave">O site está cadastrando os dados pela própria API, rota por rota. Leva poucos segundos.</p>
      <div class="barra-linha" style="grid-template-columns:1fr 60px"><span class="trilho"><span class="preenchido" id="demo-barra"></span></span><span class="valor" id="demo-pct">0%</span></div>
      <div class="registro" id="demo-registro" style="margin-top:14px"></div>
      <div class="botoes-linha" id="demo-acoes" style="margin-top:14px" hidden><button class="btn" id="demo-de-novo">${icone('brilho')}Tentar de novo</button></div>`,
  });
  const registro = d.querySelector('#demo-registro');
  const acoes = d.querySelector('#demo-acoes');
  const rodar = () => {
    acoes.hidden = true;
    carregarDemonstracao((texto, feito, total) => {
      registro.insertAdjacentHTML('beforeend', `<div>${esc(texto)}</div>`);
      registro.scrollTop = registro.scrollHeight;
      const pct = Math.round((feito / total) * 100);
      d.querySelector('#demo-barra').style.width = pct + '%';
      d.querySelector('#demo-pct').textContent = pct + '%';
    }).then(() => {
      registro.insertAdjacentHTML('beforeend', '<div>Pronto! Recarregando…</div>');
      registro.scrollTop = registro.scrollHeight;
      setTimeout(() => location.reload(), 900);
    }).catch(erro => {
      registro.insertAdjacentHTML('beforeend', `<div style="color:#ffb4ab">Parou: ${esc(erro.message)}</div>
        <div>O que já foi cadastrado continua salvo. Ao tentar de novo, o site só cadastra o que falta.</div>`);
      registro.scrollTop = registro.scrollHeight;
      acoes.hidden = false;
    });
  };
  d.querySelector('#demo-de-novo').addEventListener('click', rodar);
  rodar();
}
