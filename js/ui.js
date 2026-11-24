// =====================================================================
// EcoRota · peças usadas por todas as telas
// cabeçalho e rodapé, ícones, sessão do viajante, janelas (modal), avisos (toast),
// animações de entrada, formatação de datas e valores
// =====================================================================

// ---------------------------------------------------------------- ícones (SVG desenhado aqui)
const ICONES = {
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4.2-6.1"/>',
  folha: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15-.4 0-.7 0-1-.1M5 19l7.5-7.5"/>',
  selo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  estrela: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
  rota: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/>',
  aviao: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
  onibus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v2.5M16 18v2.5"/><circle cx="8" cy="14.5" r=".6"/><circle cx="16" cy="14.5" r=".6"/>',
  carro: '<path d="M5 15l1.6-4.6A2 2 0 0 1 8.5 9h7a2 2 0 0 1 1.9 1.4L19 15"/><rect x="3" y="15" width="18" height="4" rx="1.5"/><path d="M6.5 19v1.5M17.5 19v1.5"/>',
  barco: '<path d="M3 16.5l2 3.5h14l2-3.5zM12 3v13M12 4.5l6 9h-6"/>',
  pegada: '<path d="M8.5 3C10.5 3 11.5 5 11.5 8S10.5 14 8.5 14 5.5 11 5.5 8s1-5 3-5zM15.5 10c2 0 3 2 3 4.5s-1 4.5-3 4.5-3-2-3-4.5 1-4.5 3-4.5z"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cama: '<path d="M3 18V6M3 13h18v5M21 18v-4.5a2.5 2.5 0 0 0-2.5-2.5H11v2"/><circle cx="7" cy="10.5" r="1.8"/>',
  barraca: '<path d="M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6"/>',
  bussola: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  peixe: '<path d="M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2z"/><circle cx="8" cy="11.2" r=".7"/>',
  van: '<rect x="2" y="7" width="14" height="9" rx="2"/><path d="M16 10h3l3 3v3h-6"/><circle cx="6" cy="17" r="1.8"/><circle cx="18" cy="17" r="1.8"/>',
  loja: '<path d="M4 10v10h16V10M3 10l2-6h14l2 6M9 20v-6h6v6"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  voltar: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sair: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alerta: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
  ingresso: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  mapa: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  coracao: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  brilho: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
  agua: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  montanha: '<path d="M3 20l6.5-11 4 6.5 2.5-4 5 8.5z"/>',
  predio: '<path d="M4 21V5l8-2v18M12 21V9l8 2v10M2 21h20M7 8h2M7 12h2M7 16h2M15 14h2M15 17h2"/>',
  raio: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  documento: '<path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h6"/>',
  cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  conversa: '<path d="M4 5h16v11H9l-5 4z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  balanca: '<path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
  painel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
};

function icone(nome, classe = '') {
  return `<svg class="ic ${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
}

// ---------------------------------------------------------------- textos e formatos
function esc(texto) {
  const trocas = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, c => trocas[c]);
}
const semAcento = t => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const porNome = campo => (a, b) => String(a[campo]).localeCompare(String(b[campo]), 'pt-BR');
const parametro = nome => new URLSearchParams(location.search).get(nome);
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

const _moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtMoeda = v => _moeda.format(Number(v ?? 0));
const fmtNumero = (v, casas = 0) => Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const fmtKg = v => `${fmtNumero(v, Number(v) >= 100 ? 0 : 1)} kg`;
const ingressoTexto = v => (Number(v ?? 0) === 0 ? 'Gratuito' : fmtMoeda(v));

// Datas da API: LocalDate "2026-11-25" e LocalDateTime "2026-11-25T14:30:00".
// São montadas no fuso do computador (new Date("2026-11-25") cairia no dia anterior no Brasil).
function dataLocal(iso) {
  if (!iso) return null;
  const [d, h = '00:00:00'] = String(iso).split('T');
  const [a, m, dia] = d.split('-').map(Number);
  const [hh, mm, ss] = h.split(':').map(x => parseInt(x, 10) || 0);
  return new Date(a, m - 1, dia, hh, mm, ss);
}
const isoDe = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hojeISO = () => isoDe(new Date());
const somarDias = (iso, n) => { const d = dataLocal(iso); d.setDate(d.getDate() + n); return isoDe(d); };
const fmtData = iso => (iso ? dataLocal(iso).toLocaleDateString('pt-BR') : '—');
const fmtDataLonga = iso => dataLocal(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDiaSemana = iso => dataLocal(iso).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
const fmtDiaMes = iso => dataLocal(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').replace(' de ', ' ');
const fmtHora = h => String(h ?? '').slice(0, 5);

// ---------------------------------------------------------------- Selo EcoRota e avaliações
// Situação do selo de um fornecedor a partir das certificações dele (GET /api/certificacoes)
function situacaoSelo(certificacoes) {
  const hoje = hojeISO();
  const ordem = [...certificacoes].sort((a, b) => (a.dataEmissao < b.dataEmissao ? 1 : -1));
  const valida = ordem.find(c => c.status === 'verificada' && c.dataValidade >= hoje);
  if (valida) return { tipo: 'valido', cert: valida };
  const analise = ordem.find(c => c.status === 'em_analise');
  if (analise) return { tipo: 'em_analise', cert: analise };
  const vencida = ordem.find(c => c.status === 'verificada');
  if (vencida) return { tipo: 'vencido', cert: vencida };
  const recusada = ordem.find(c => c.status === 'recusada');
  if (recusada) return { tipo: 'recusado', cert: recusada };
  return { tipo: 'sem', cert: null };
}

function seloBadge(situacao, compacto = false) {
  const t = situacao.tipo;
  if (t === 'valido') return `<span class="selo-badge valido">${icone('selo')}Selo EcoRota</span>`;
  if (t === 'em_analise') return `<span class="selo-badge analise">${icone('relogio')}${compacto ? 'Selo em análise' : 'Selo EcoRota em análise'}</span>`;
  if (t === 'vencido') return `<span class="selo-badge vencido">${icone('alerta')}Selo vencido</span>`;
  return '';
}

function estrelas(nota, classe = '') {
  const cheias = Math.round(Number(nota) || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) html += `<span class="${i <= cheias ? 'on' : ''}">${icone('estrela')}</span>`;
  return `<span class="estrelas ${classe}" aria-label="${fmtNumero(nota, 1)} de 5">${html}</span>`;
}

// Resumo das avaliações por fornecedor (média e total), a partir de GET /api/avaliacoes
function resumoAvaliacoes(avaliacoes) {
  const mapa = new Map();
  for (const a of avaliacoes) {
    const r = mapa.get(a.idFornecedor) || { soma: 0, total: 0, respondidas: 0 };
    r.soma += a.nota; r.total += 1; if (a.resposta) r.respondidas += 1;
    mapa.set(a.idFornecedor, r);
  }
  for (const r of mapa.values()) r.media = r.soma / r.total;
  return mapa;
}

const TIPOS_FORNECEDOR = [
  [/hosped|pousada|hotel/, 'cama', 'hospedagem'], [/camping|acamp/, 'barraca', 'camping'],
  [/mergulh/, 'peixe', 'mergulho'], [/transp|transfer|van/, 'van', 'transporte'],
  [/ag[eê]ncia|guia|passeio|trilha/, 'bussola', 'passeios'], [/restaur|bar|cafe/, 'loja', 'gastronomia'],
];
function iconeFornecedor(tipo) {
  const t = semAcento(tipo);
  const achado = TIPOS_FORNECEDOR.find(([re]) => re.test(t));
  return achado ? achado[1] : 'loja';
}

// ---------------------------------------------------------------- sessão do viajante (sem senha: demonstração)
const sessao = {
  chave: 'ecorota.viajante',
  atual() {
    try { return JSON.parse(localStorage.getItem(this.chave)); } catch { return null; }
  },
  entrar(v) {
    try { localStorage.setItem(this.chave, JSON.stringify({ idViajante: v.idViajante, nome: v.nome, email: v.email })); } catch { /* sem armazenamento */ }
    montarUsuario();
    document.dispatchEvent(new CustomEvent('sessao', { detail: v }));
  },
  sair() {
    try { localStorage.removeItem(this.chave); } catch { /* sem armazenamento */ }
    montarUsuario();
    document.dispatchEvent(new CustomEvent('sessao', { detail: null }));
  },
  // confere se o viajante ainda existe no banco (o banco pode ter sido recriado)
  async validar() {
    const v = this.atual();
    if (!v) return null;
    try {
      return await api(`/viajantes/${v.idViajante}`);
    } catch (erro) {
      if (erro.status === 404) this.sair();
      return erro.status === 404 ? null : v;
    }
  },
};

const iniciais = nome => String(nome || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');

// ---------------------------------------------------------------- cabeçalho e rodapé
const PAGINAS = [
  ['inicio', 'index.html', 'Início'],
  ['destinos', 'destinos.html', 'Destinos'],
  ['atrativos', 'atrativos.html', 'Atrativos'],
  ['fornecedores', 'fornecedores.html', 'Fornecedores'],
  ['pegada', 'pegada.html', 'Pegada de carbono'],
  ['sobre', 'sobre.html', 'Sobre'],
];

function montarLayout(paginaAtual, { transparente = false } = {}) {
  const topo = document.getElementById('topo');
  topo.className = 'topo' + (transparente ? ' transparente' : '');
  topo.innerHTML = `
    <div class="topo-conteudo">
      <a class="marca" href="index.html" aria-label="EcoRota, página inicial">
        <img src="img/logo.png" alt=""><span>Eco<b>Rota</b></span>
      </a>
      <nav id="menu" class="menu" aria-label="Menu principal">
        ${PAGINAS.map(([id, href, nome]) => `<a href="${href}" ${id === paginaAtual ? 'aria-current="page"' : ''}>${nome}</a>`).join('')}
      </nav>
      <div id="usuario" class="usuario"></div>
      <button id="abrir-menu" class="abrir-menu" aria-label="Abrir menu" aria-expanded="false">${icone('menu')}</button>
    </div>
    <div id="faixa-api" class="faixa-api" hidden>
      ${icone('alerta')}<span>Sem conexão com a API do EcoRota. Ligue o back-end e recarregue a página.</span>
      <button class="btn btn-mini btn-claro" onclick="location.reload()">Tentar de novo</button>
    </div>`;

  document.getElementById('rodape').innerHTML = `
    <div class="rodape-conteudo">
      <div class="rodape-marca">
        <a class="marca marca-clara" href="index.html"><img src="img/logo.png" alt=""><span>Eco<b>Rota</b></span></a>
        <p>Turismo que respeita os limites da natureza e valoriza quem cuida dela.</p>
      </div>
      <div><h4>Explorar</h4>
        <a href="destinos.html">Destinos</a><a href="atrativos.html">Atrativos</a><a href="fornecedores.html">Fornecedores</a><a href="pegada.html">Pegada de carbono</a></div>
      <div><h4>Para você</h4>
        <a href="conta.html">Minha conta</a><a href="conta.html#reservas">Minhas reservas</a><a href="pegada.html#viagens">Minhas viagens</a></div>
      <div><h4>EcoRota</h4>
        <a href="sobre.html">Sobre nós</a><a href="sobre.html#selo">Selo EcoRota</a><a href="sobre.html#perguntas">Perguntas frequentes</a><a href="gestor.html">Área do gestor</a></div>
    </div>
    <div class="rodape-base">
      <span>© ${new Date().getFullYear()} EcoRota · Projeto acadêmico de Banco de Dados · Universidade Anhembi Morumbi</span>
      <span id="status-api" class="status-api">API</span>
    </div>`;

  // menu do celular
  const botao = document.getElementById('abrir-menu');
  botao.addEventListener('click', () => {
    const aberto = topo.classList.toggle('menu-aberto');
    botao.setAttribute('aria-expanded', aberto);
    botao.innerHTML = icone(aberto ? 'x' : 'menu');
  });

  // cabeçalho transparente sobre a capa, sólido depois de rolar
  const aoRolar = () => topo.classList.toggle('rolado', window.scrollY > 24);
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  // indicador da API no rodapé e faixa de aviso
  document.addEventListener('api-status', e => {
    const el = document.getElementById('status-api');
    el.textContent = e.detail ? 'API conectada' : 'API desligada';
    el.className = 'status-api ' + (e.detail ? 'on' : 'off');
    document.getElementById('faixa-api').hidden = e.detail;
  });

  // ilustração de fundo dos cabeçalhos: <section data-arte="praia" data-semente="3">
  document.querySelectorAll('[data-arte]').forEach(el => {
    el.insertAdjacentHTML('afterbegin', Arte.cena(el.dataset.arte, Number(el.dataset.semente || 1)));
  });

  montarUsuario();
  preencherIcones();
  revelar();
}

// <span data-icone="folha"></span> no HTML vira o ícone desenhado
function preencherIcones(raiz = document) {
  raiz.querySelectorAll('[data-icone]').forEach(el => { el.outerHTML = icone(el.dataset.icone, el.className); });
}

function montarUsuario() {
  const area = document.getElementById('usuario');
  if (!area) return;
  const v = sessao.atual();
  if (!v) {
    area.innerHTML = `<button class="btn btn-pequeno btn-contorno" id="entrar">${icone('usuario')}Entrar</button>`;
    document.getElementById('entrar').addEventListener('click', () => exigirLogin());
    return;
  }
  area.innerHTML = `
    <details class="conta-menu">
      <summary><span class="avatar">${esc(iniciais(v.nome))}</span><span class="nome-curto">${esc(v.nome.split(' ')[0])}</span></summary>
      <div class="conta-lista">
        <a href="conta.html">${icone('usuario')}Minha conta</a>
        <a href="conta.html#reservas">${icone('ingresso')}Minhas reservas</a>
        <a href="pegada.html#viagens">${icone('pegada')}Minhas viagens</a>
        <button id="sair">${icone('sair')}Sair</button>
      </div>
    </details>`;
  document.getElementById('sair').addEventListener('click', () => { sessao.sair(); toast('Você saiu da sua conta.', 'info'); });
}

// ---------------------------------------------------------------- avisos rápidos (toast)
function toast(texto, tipo = 'ok') {
  let caixa = document.getElementById('toasts');
  if (!caixa) {
    caixa = document.createElement('div');
    caixa.id = 'toasts';
    caixa.className = 'toasts';
    caixa.setAttribute('role', 'status');
    document.body.append(caixa);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.innerHTML = `${icone(tipo === 'erro' ? 'alerta' : tipo === 'info' ? 'info' : 'check')}<span>${esc(texto)}</span>`;
  caixa.append(el);
  setTimeout(() => el.classList.add('saindo'), 4200);
  setTimeout(() => el.remove(), 4700);
}

// ---------------------------------------------------------------- janelas sobre a página (modal)
function abrirModal({ titulo, html, largura = 'media', aoFechar }) {
  const d = document.createElement('dialog');
  d.className = `modal modal-${largura}`;
  d.innerHTML = `
    <div class="modal-caixa">
      <header class="modal-topo"><h2>${esc(titulo)}</h2>
        <button class="modal-fechar" aria-label="Fechar">${icone('x')}</button></header>
      <div class="modal-corpo">${html}</div>
    </div>`;
  document.body.append(d);
  const fechar = () => { d.classList.add('fechando'); setTimeout(() => { d.close(); d.remove(); aoFechar?.(); }, 180); };
  d.querySelector('.modal-fechar').addEventListener('click', fechar);
  d.addEventListener('click', e => { if (e.target === d) fechar(); });
  d.addEventListener('cancel', e => { e.preventDefault(); fechar(); });
  d.fechar = fechar;
  d.showModal();
  return d;
}

// Pede para o viajante entrar (ou criar conta). Devolve o viajante ou null.
function exigirLogin(motivo = '') {
  const atual = sessao.atual();
  if (atual) return Promise.resolve(atual);
  return new Promise(resolver => {
    let resolvido = false;
    const fim = v => { if (!resolvido) { resolvido = true; resolver(v); } };
    const d = abrirModal({
      titulo: 'Entrar no EcoRota',
      largura: 'pequena',
      aoFechar: () => fim(null),
      html: `
        ${motivo ? `<p class="modal-motivo">${icone('info')}${esc(motivo)}</p>` : ''}
        <div class="abas abas-compactas" role="tablist">
          <button role="tab" class="ativa" data-aba="entrar">Já tenho conta</button>
          <button role="tab" data-aba="criar">Criar conta</button>
        </div>
        <form id="f-entrar" class="form">
          <label class="campo">E-mail<input name="email" type="email" required autocomplete="email" placeholder="voce@exemplo.com"></label>
          <button class="btn btn-bloco" type="submit">Entrar</button>
          <div id="rapido" class="acesso-rapido"></div>
        </form>
        <form id="f-criar" class="form" hidden>
          <label class="campo">Nome completo<input name="nome" required maxlength="120" autocomplete="name"></label>
          <label class="campo">E-mail<input name="email" type="email" required maxlength="150" autocomplete="email"></label>
          <label class="campo">CPF <span class="opcional">opcional</span>
            <input name="cpf" inputmode="numeric" maxlength="14" placeholder="Somente números"></label>
          <button class="btn btn-bloco" type="submit">Criar conta</button>
        </form>
        <p class="nota-demo">${icone('cadeado')}Acesso de demonstração: o EcoRota ainda não usa senha.</p>`,
    });

    const fEntrar = d.querySelector('#f-entrar');
    const fCriar = d.querySelector('#f-criar');
    d.querySelectorAll('[data-aba]').forEach(b => b.addEventListener('click', () => {
      d.querySelectorAll('[data-aba]').forEach(x => x.classList.toggle('ativa', x === b));
      fEntrar.hidden = b.dataset.aba !== 'entrar';
      fCriar.hidden = b.dataset.aba !== 'criar';
    }));

    const concluir = v => { sessao.entrar(v); toast(`Olá, ${v.nome.split(' ')[0]}!`); fim(v); d.fechar(); };

    // acesso rápido com os viajantes de demonstração
    api('/viajantes').then(lista => {
      if (!lista.length) return;
      d.querySelector('#rapido').innerHTML = `<span>Acesso rápido</span>` + lista.slice(0, 4).map(v =>
        `<button type="button" class="chip" data-id="${v.idViajante}"><span class="avatar avatar-mini">${esc(iniciais(v.nome))}</span>${esc(v.nome.split(' ')[0])}</button>`).join('');
      d.querySelectorAll('#rapido [data-id]').forEach(b => b.addEventListener('click', () => concluir(lista.find(v => String(v.idViajante) === b.dataset.id))));
    }).catch(() => {});

    fEntrar.addEventListener('submit', async e => {
      e.preventDefault();
      limparErros(fEntrar);
      const email = fEntrar.email.value.trim().toLowerCase();
      try {
        const v = (await api('/viajantes')).find(x => x.email.toLowerCase() === email);
        if (!v) return mostrarErros(fEntrar, { email: 'Não achamos esse e-mail. Que tal criar uma conta?' });
        concluir(v);
      } catch (erro) { mostrarErros(fEntrar, erro.campos, erro.message); }
    });

    fCriar.addEventListener('submit', async e => {
      e.preventDefault();
      limparErros(fCriar);
      const cpf = fCriar.cpf.value.replace(/\D/g, '');
      try {
        const v = await api('/viajantes', { corpo: { nome: fCriar.nome.value.trim(), email: fCriar.email.value.trim(), cpf: cpf || null } });
        concluir(v);
      } catch (erro) {
        const campo = /e-mail/i.test(erro.message) ? 'email' : /cpf/i.test(erro.message) ? 'cpf' : null;
        mostrarErros(fCriar, erro.campos || (campo ? { [campo]: erro.message } : null), erro.campos || campo ? '' : erro.message);
      }
    });
  });
}

// ---------------------------------------------------------------- formulários
function limparErros(form) {
  form.querySelectorAll('.erro-campo, .erro-form').forEach(e => e.remove());
  form.querySelectorAll('.invalido').forEach(c => c.classList.remove('invalido'));
}

// Mostra o erro de cada campo (vindo da API) embaixo do campo certo e, se sobrar, uma mensagem geral
function mostrarErros(form, campos, geral = '') {
  let sobrou = geral;
  for (const [nome, msg] of Object.entries(campos || {})) {
    const campo = form.querySelector(`[name="${nome}"]`);
    if (!campo) { sobrou = sobrou || msg; continue; }
    campo.classList.add('invalido');
    const span = document.createElement('span');
    span.className = 'erro-campo';
    span.textContent = msg;
    (campo.closest('.campo') || campo.parentElement).append(span);
  }
  if (sobrou) {
    const p = document.createElement('p');
    p.className = 'erro-form';
    p.innerHTML = `${icone('alerta')}<span>${esc(sobrou)}</span>`;
    form.append(p);
  }
}

// Botão "ocupado" enquanto a API responde
async function comBotao(botao, tarefa) {
  const original = botao.innerHTML;
  botao.disabled = true;
  botao.classList.add('carregando');
  try { return await tarefa(); } finally { botao.disabled = false; botao.classList.remove('carregando'); botao.innerHTML = original; }
}

// ---------------------------------------------------------------- animações
// elementos com data-revelar aparecem suavemente quando entram na tela
// (também revela o que ficou acima da tela, para um salto direto a #perguntas não deixar buracos)
function revelar(raiz = document) {
  raiz.querySelectorAll('[data-revelar]:not(.visivel)').forEach((el, k) => el.style.setProperty('--atraso', `${(k % 6) * 70}ms`));
  requestAnimationFrame(revelarVisiveis);
}
let _revelando = false;
function revelarVisiveis() {
  _revelando = false;
  const limite = window.innerHeight * 0.92;
  document.querySelectorAll('[data-revelar]:not(.visivel)').forEach(el => {
    if (el.getBoundingClientRect().top < limite) el.classList.add('visivel');
  });
}
const _agendarRevelar = () => { if (!_revelando) { _revelando = true; requestAnimationFrame(revelarVisiveis); } };
window.addEventListener('scroll', _agendarRevelar, { passive: true });
window.addEventListener('resize', _agendarRevelar);

// números que contam de 0 até o valor quando aparecem
function animarNumeros(raiz = document) {
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  raiz.querySelectorAll('[data-contar]').forEach(el => {
    const alvo = Number(el.dataset.contar);
    const casas = Number(el.dataset.casas || 0);
    if (reduzir || !alvo) { el.textContent = fmtNumero(alvo, casas); return; }
    const inicio = performance.now();
    const passo = agora => {
      const t = Math.min(1, (agora - inicio) / 1200);
      el.textContent = fmtNumero(alvo * (1 - Math.pow(1 - t, 3)), casas);
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

// cartões "fantasma" enquanto os dados chegam
const esqueleto = (n, classe = 'cartao-esqueleto') => Array.from({ length: n }, () => `<div class="${classe}"><div></div><p></p><p></p></div>`).join('');

// estado vazio com ilustração
const vazio = (titulo, texto, acao = '') => `
  <div class="vazio">${icone('folha', 'vazio-icone')}<h3>${esc(titulo)}</h3><p>${texto}</p>${acao}</div>`;
