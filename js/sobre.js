// =====================================================================
// Sobre nós: texto fixo; os critérios do selo e os números vêm da API
// Rotas: GET /api/criterios-sustentabilidade · GET /api/destinos · GET /api/atrativos
//        GET /api/fornecedores · GET /api/certificacoes
// =====================================================================
montarLayout('sobre');

document.getElementById('moldura').insertAdjacentHTML('afterbegin', Arte.cena('rio', 9));
document.getElementById('chamada').insertAdjacentHTML('afterbegin', Arte.cena('praia', 8));

const EIXOS = {
  ambiental: ['Ambiental', 'folha', ''],
  social: ['Social', 'pessoas', 'azul'],
  economico: ['Econômico', 'grafico', 'ambar'],
  gestao: ['Gestão', 'documento', ''],
};

async function carregar() {
  const caixa = document.getElementById('lista-criterios');
  try {
    const [criterios, destinos, atrativos, fornecedores, certificacoes] = await Promise.all([
      api('/criterios-sustentabilidade'), api('/destinos'), api('/atrativos'), api('/fornecedores'), api('/certificacoes'),
    ]);

    // critérios agrupados por eixo
    caixa.innerHTML = criterios.length
      ? Object.entries(EIXOS).map(([eixo, [nome, ic, cor]]) => {
        const doEixo = criterios.filter(c => c.eixo === eixo).sort((a, b) => b.peso - a.peso);
        if (!doEixo.length) return '';
        return `<div class="eixo">
          <div class="eixo-titulo"><span class="icone-redondo ${cor}">${icone(ic)}</span><strong>${nome}</strong></div>
          <ul class="criterios">${doEixo.map(c => `<li>${icone('check')}<span>${esc(c.descricao)}
            <small class="peso">peso ${c.peso}</small>${c.obrigatorio ? '<small class="obrigatorio">obrigatório</small>' : ''}</span></li>`).join('')}</ul>
        </div>`;
      }).join('')
      : '<p class="suave">Os critérios aparecem aqui assim que forem cadastrados no painel do gestor.</p>';

    // números ao vivo
    const hoje = hojeISO();
    const selos = new Set(certificacoes.filter(c => c.status === 'verificada' && c.dataValidade >= hoje).map(c => c.idFornecedor)).size;
    for (const [id, n] of [['n-destinos', destinos.length], ['n-atrativos', atrativos.length], ['n-fornecedores', fornecedores.length], ['n-selos', selos]]) {
      document.getElementById(id).dataset.contar = n;
    }
    animarNumeros(document.getElementById('numeros'));
  } catch {
    caixa.innerHTML = '<p class="suave">Ligue a API para ver os critérios da auditoria.</p>';
  }
  revelar();
}

carregar();
