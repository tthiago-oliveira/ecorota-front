// =====================================================================
// EcoRota · dados de demonstração
// Tudo é cadastrado pelas rotas POST e PATCH da própria API, na ordem das chaves estrangeiras.
// Municípios, destinos e atrativos são reais (código IBGE oficial); coordenadas aproximadas,
// preços e fatores de emissão ilustrativos. Pessoas, fornecedores, CNPJs e avaliações são fictícios
// (os CNPJs têm dígito verificador inválido de propósito).
// =====================================================================

const DEMO = {
  lugares: [
    { municipio: { nome: 'Bonito', uf: 'MS', codigoIbge: '5002209' },
      destino: { nome: 'Bonito e Serra da Bodoquena', tipo: 'ecoturismo' },
      atrativos: [
        { nome: 'Gruta do Lago Azul', tipo: 'gruta', latitude: -21.14, longitude: -56.59, exigeGuia: true, valorIngresso: 80, cota: [160, 20] },
        { nome: 'Flutuação no Rio Sucuri', tipo: 'flutuação', latitude: -21.27, longitude: -56.56, exigeGuia: true, valorIngresso: 250, cota: [72, 12] },
        { nome: 'Balneário Municipal', tipo: 'balneário', latitude: -21.16, longitude: -56.45, exigeGuia: false, valorIngresso: 40, cota: [400, 40] },
      ] },
    { municipio: { nome: 'Fernando de Noronha', uf: 'PE', codigoIbge: '2605459' },
      destino: { nome: 'Arquipélago de Fernando de Noronha', tipo: 'parque marinho' },
      atrativos: [
        { nome: 'Baía do Sancho', tipo: 'praia', latitude: -3.85, longitude: -32.44, exigeGuia: false, valorIngresso: 0, cota: [300, 30] },
        { nome: 'Piscina natural do Atalaia', tipo: 'piscina natural', latitude: -3.87, longitude: -32.41, exigeGuia: true, valorIngresso: 0, cota: [60, 10] },
      ] },
    { municipio: { nome: 'Alto Paraíso de Goiás', uf: 'GO', codigoIbge: '5200605' },
      destino: { nome: 'Chapada dos Veadeiros', tipo: 'parque nacional' },
      atrativos: [
        { nome: 'Trilha dos Saltos do Rio Preto', tipo: 'trilha', latitude: -14.17, longitude: -47.79, exigeGuia: false, valorIngresso: 40, cota: [250, 25] },
        { nome: 'Vale da Lua', tipo: 'formação rochosa', latitude: -14.22, longitude: -47.79, exigeGuia: false, valorIngresso: 40, cota: [120, 15] },
      ] },
  ],
  horarios: ['08:00', '10:30', '14:00'],
  dias: 6,
  viajantes: [
    ['Ana Souza', 'ana.souza@example.com'], ['Bruno Lima', 'bruno.lima@example.com'], ['Carla Mendes', 'carla.mendes@example.com'],
    ['Diego Rocha', 'diego.rocha@example.com'], ['Elisa Prado', 'elisa.prado@example.com'], ['Fábio Nunes', 'fabio.nunes@example.com'],
  ],
  // [município, nome, tipo, origem, CNPJ, razão social, reivindicar?]
  fornecedores: [
    [0, 'Pousada Canto das Águas', 'hospedagem', 'cadastur', '11111111000100', 'Canto das Águas Hospedagem Ltda', true],
    [0, 'Bodoquena Trilhas Ecoturismo', 'agência', 'proprio', '22222222000100', 'Bodoquena Trilhas Turismo Ltda', false],
    [0, 'Hotel Mirante da Serra', 'hospedagem', 'viajante', null, null, false],
    [1, 'Pousada Maré Serena', 'hospedagem', 'cadastur', '33333333000100', 'Maré Serena Pousada Ltda', true],
    [1, 'Noronha Azul Mergulho', 'mergulho', 'cadastur', '44444444000100', null, false],
    [2, 'Camping Estrela do Cerrado', 'camping', 'proprio', '55555555000100', 'Estrela do Cerrado Camping Ltda', false],
    [2, 'Veadeiros Guias Associados', 'guiamento', 'cadastur', '66666666000100', null, false],
    [2, 'Transfer Cerrado Elétrico', 'transporte', 'viajante', null, null, false],
  ],
  // [fornecedor, viajante, nota, comentário, resposta]
  avaliacoes: [
    [0, 0, 5, 'Energia solar, coleta seletiva de verdade e café da manhã com produtor local. A certificação fica exposta na recepção.', 'Obrigado, Ana! O relatório de consumo de energia fica disponível para qualquer hóspede.'],
    [0, 1, 4, 'Ótima pousada. Só faltou trocar a garrafinha de água do quarto por um filtro.', 'Bruno, desde setembro todos os quartos têm filtro. Obrigado pela dica!'],
    [0, 4, 5, 'A equipe mostrou o tratamento de esgoto por zona de raízes. Muito transparente.', 'Que bom que você gostou da visita técnica, Elisa!'],
    [0, 5, 4, 'Bom custo-benefício. O transfer compartilhado para os passeios evita um carro por família na estrada.', null],
    [1, 2, 4, 'Guias bem preparados e grupos pequenos na trilha.', 'Valeu, Carla! Grupo pequeno é regra da casa.'],
    [1, 3, 3, 'Passeio bom, mas a van ficou ligada parada no estacionamento por quase uma hora.', 'Diego, você tem razão. Orientamos os motoristas a desligar o motor nas paradas.'],
    [1, 0, 4, 'Explicaram as regras da flutuação antes de entrar no rio. Gostei.', null],
    [2, 1, 2, 'Se apresenta como hotel ecológico, mas não tem coleta seletiva e as toalhas são trocadas todo dia, mesmo pedindo para não trocar.', null],
    [2, 4, 2, 'Não encontrei nenhuma certificação. Perguntei na recepção e ninguém soube explicar o "selo verde" do site.', null],
    [2, 2, 3, 'Quarto confortável, mas nada de sustentável além do nome.', null],
    [3, 3, 4, 'Pousada com captação de água da chuva, o que faz diferença na ilha.', 'Obrigado, Diego! Já pedimos a renovação do Selo EcoRota.'],
    [3, 5, 3, 'Boa localização, mas o ar-condicionado ficava ligado nos quartos vazios.', null],
    [5, 5, 5, 'Camping com banheiro seco, energia solar e trilha interpretativa. Experiência incrível.', 'Obrigado, Fábio! Volte sempre.'],
    [5, 2, 4, 'Lugar lindo e bem cuidado. A coleta de lixo é separada em quatro tipos.', 'Valeu, Carla!'],
    [4, 0, 4, 'Mergulho com briefing sobre os corais antes de entrar no mar.', null],
    [7, 5, 5, 'Van elétrica silenciosa e motorista que conhece a região.', null],
  ],
  criterios: [
    ['gestao', 'Cadastro regular no Cadastur', 3, true],
    ['ambiental', 'Respeita a capacidade de carga: só vende passeio com reserva dentro da cota', 3, true],
    ['ambiental', 'Separa o lixo e manda os recicláveis para a coleta', 3, true],
    ['ambiental', 'Mede o consumo de água e tem meta de redução', 2, false],
    ['ambiental', 'Usa energia renovável ou tem plano de economia de energia', 2, false],
    ['social', 'Emprega moradores ou guias da região', 2, false],
    ['social', 'Divulga o território corretamente (município e comunidade)', 1, false],
    ['economico', 'Compra de produtores e fornecedores locais', 2, false],
    ['gestao', 'Tem certificação de sustentabilidade de outra entidade (ex.: NBR 15401, Green Key, Biosphere)', 2, false],
  ],
  // [fornecedor, número, dias da emissão (a partir de hoje), dias da validade, critérios atendidos (1 a 9), status]
  certificacoes: [
    [0, 'ECO-{ano}-0001', -60, 305, [1, 2, 3, 4, 5, 6, 8, 9], 'verificada'],
    [5, 'ECO-{ano}-0002', -120, 245, [1, 2, 3, 4, 6, 8], 'verificada'],
    [3, 'ECO-{anoAnterior}-0001', -400, -35, [1, 2, 3, 4, 5, 6], 'verificada'],
    [3, 'ECO-{ano}-0003', -5, 360, null, 'em_analise'],
    [1, 'ECO-{ano}-0004', -3, 362, null, 'em_analise'],
  ],
  modais: [['Avião', 'aéreo'], ['Ônibus rodoviário', 'rodoviário coletivo'], ['Carro a gasolina', 'rodoviário individual'], ['Van elétrica', 'rodoviário coletivo']],
  // [modal, ano (0 = atual, -1 = anterior), kg CO2e por km]
  fatores: [[0, 0, 0.15], [1, 0, 0.03], [2, 0, 0.12], [3, 0, 0.01], [0, -1, 0.16]],
  // [viajante, início e fim (dias a partir de hoje), trechos [modal, origem, destino, km], serviços [fornecedor, tipo, valor], status]
  viagens: [
    [0, 2, 6, [[0, 'São Paulo', 'Campo Grande', 890], [1, 'Campo Grande', 'Bonito', 300], [1, 'Bonito', 'Campo Grande', 300], [0, 'Campo Grande', 'São Paulo', 890]],
      [[0, 'hospedagem', 1600], [1, 'passeios', 900]], null],
    [5, -80, -76, [[3, 'Brasília', 'Alto Paraíso de Goiás', 230], [3, 'Alto Paraíso de Goiás', 'Brasília', 230]],
      [[5, 'hospedagem', 360], [7, 'transfer', 280]], 'concluida'],
    [2, 8, 14, [[0, 'Recife', 'Fernando de Noronha', 545], [0, 'Fernando de Noronha', 'Recife', 545]],
      [[3, 'hospedagem', 3000], [4, 'mergulho', 1200]], null],
  ],
  reservas: [
    [1, [['Piscina natural do Atalaia|1|08:00', 5]]],
    [2, [['Piscina natural do Atalaia|1|08:00', 3]]],
    [0, [['Gruta do Lago Azul|2|10:30', 2], ['Flutuação no Rio Sucuri|2|14:00', 2]]],
    [3, [['Vale da Lua|3|08:00', 4]]],
  ],
};

// quantos passos (chamadas à API) a carga faz, para a barra de progresso
function passosDemonstracao() {
  const nAtrativos = DEMO.lugares.reduce((s, l) => s + l.atrativos.length, 0);
  const auditadas = DEMO.certificacoes.filter(c => c[4]).length;
  return DEMO.lugares.length * 2 + nAtrativos * 2 + nAtrativos * DEMO.dias * DEMO.horarios.length
    + DEMO.viajantes.length + DEMO.reservas.length
    + DEMO.fornecedores.length + DEMO.fornecedores.filter(f => f[6]).length
    + DEMO.avaliacoes.length + DEMO.avaliacoes.filter(a => a[4]).length
    + DEMO.criterios.length + DEMO.certificacoes.length + auditadas * DEMO.criterios.length + auditadas
    + DEMO.modais.length + DEMO.fatores.length
    + DEMO.viagens.reduce((s, v) => s + 1 + v[3].length + v[4].length + (v[5] ? 1 : 0), 0);
}

// Pode ser rodada de novo sem duplicar nada: primeiro lê o que o banco já tem e
// só cadastra o que estiver faltando (útil se a carga parar no meio).
async function carregarDemonstracao(aoProgredir = () => {}) {
  const hoje = hojeISO();
  const ano = new Date().getFullYear();
  const total = passosDemonstracao();
  let feito = 0;
  const passo = texto => aoProgredir(texto, ++feito, total);
  const post = (rota, corpo) => api(rota, { corpo });
  const patch = (rota, corpo) => api(rota, { metodo: 'PATCH', corpo });
  const garantir = async (achado, rota, corpo, rotulo) => {
    if (achado) { passo(`${rota} → ${rotulo} (já existia)`); return achado; }
    const novo = await post(rota, corpo);
    passo(`POST ${rota} → ${rotulo}`);
    return novo;
  };

  aoProgredir('Lendo o que o banco já tem…', 0, total);
  const rotas = ['/municipios', '/destinos', '/atrativos', '/capacidades-carga', '/janelas-visitacao', '/viajantes', '/reservas', '/fornecedores',
    '/avaliacoes', '/criterios-sustentabilidade', '/certificacoes', '/modais-transporte', '/fatores-emissao', '/viagens'];
  const [tMunicipios, tDestinos, tAtrativos, tCapacidades, tJanelas, tViajantes, tReservas, tFornecedores,
    tAvaliacoes, tCriterios, tCertificacoes, tModais, tFatores, tViagens] = await Promise.all(rotas.map(r => api(r)));
  const mesmaHora = (a, b) => String(a || '').slice(0, 5) === b;

  // território, atrativos, capacidade de carga e horários
  const municipios = [], atrativos = [];
  for (const lugar of DEMO.lugares) {
    const m = await garantir(tMunicipios.find(x => x.codigoIbge === lugar.municipio.codigoIbge), '/municipios', lugar.municipio, lugar.municipio.nome);
    municipios.push(m);
    const d = await garantir(tDestinos.find(x => x.idMunicipio === m.idMunicipio && x.nome === lugar.destino.nome),
      '/destinos', { ...lugar.destino, idMunicipio: m.idMunicipio }, lugar.destino.nome);
    for (const { cota, ...dados } of lugar.atrativos) {
      const a = await garantir(tAtrativos.find(x => x.idDestino === d.idDestino && x.nome === dados.nome), '/atrativos', { ...dados, idDestino: d.idDestino }, dados.nome);
      await garantir(tCapacidades.find(x => x.idAtrativo === a.idAtrativo), '/capacidades-carga',
        { idAtrativo: a.idAtrativo, vigenciaInicio: somarDias(hoje, -30), vigenciaFim: somarDias(hoje, 365), cotaDiaria: cota[0], cotaPorJanela: cota[1] },
        `${a.nome}: ${cota[0]} por dia, ${cota[1]} por horário`);
      atrativos.push({ ...a, cota });
    }
  }
  const janelas = {};
  for (const a of atrativos) {
    for (let dia = 1; dia <= DEMO.dias; dia++) {
      const data = somarDias(hoje, dia);
      for (const hora of DEMO.horarios) {
        janelas[`${a.nome}|${dia}|${hora}`] = await garantir(
          tJanelas.find(j => j.idAtrativo === a.idAtrativo && j.dataVisita === data && mesmaHora(j.horaInicio, hora)),
          '/janelas-visitacao', { idAtrativo: a.idAtrativo, dataVisita: data, horaInicio: hora, vagasTotal: a.cota[1] }, `${a.nome}, ${fmtData(data)} ${hora}`);
      }
    }
  }

  // viajantes e reservas
  const viajantes = [];
  for (const [nome, email] of DEMO.viajantes) {
    viajantes.push(await garantir(tViajantes.find(v => String(v.email).toLowerCase() === email), '/viajantes', { nome, email }, nome));
  }
  for (const [v, itens] of DEMO.reservas) {
    const viajante = viajantes[v];
    const atrativo = itens[0][0].split('|')[0];
    const achada = tReservas.find(r => r.idViajante === viajante.idViajante && (r.itens || []).some(i => i.nomeAtrativo === atrativo));
    if (achada) { passo(`/reservas → ${viajante.nome}, ${atrativo} (já existia)`); continue; }
    const r = await post('/reservas', { idViajante: viajante.idViajante, itens: itens.map(([chave, qtd]) => ({ idJanela: janelas[chave].idJanela, qtdPessoas: qtd })) });
    passo(`POST /reservas → ${r.nomeViajante}, ${fmtMoeda(r.valorTotal)}`);
  }

  // fornecedores, reivindicação e avaliações
  const fornecedores = [];
  for (const [m, nomeFantasia, tipo, origemCadastro, cnpj, razaoSocial, reivindicar] of DEMO.fornecedores) {
    const idMunicipio = municipios[m].idMunicipio;
    const f = await garantir(tFornecedores.find(x => x.idMunicipio === idMunicipio && x.nomeFantasia === nomeFantasia),
      '/fornecedores', { idMunicipio, nomeFantasia, tipo, origemCadastro, cnpj, razaoSocial: reivindicar ? null : razaoSocial }, nomeFantasia);
    fornecedores.push(f);
    if (!reivindicar) continue;
    if (f.perfilReivindicado) { passo(`/fornecedores/${f.idFornecedor}/reivindicar (já reivindicado)`); continue; }
    await patch(`/fornecedores/${f.idFornecedor}/reivindicar`, { cnpj, razaoSocial }); passo(`PATCH /fornecedores/${f.idFornecedor}/reivindicar`);
  }
  for (const [f, v, nota, comentario, resposta] of DEMO.avaliacoes) {
    const idFornecedor = fornecedores[f].idFornecedor, idViajante = viajantes[v].idViajante;
    const a = await garantir(tAvaliacoes.find(x => x.idFornecedor === idFornecedor && x.idViajante === idViajante),
      '/avaliacoes', { idFornecedor, idViajante, nota, comentario }, `${DEMO.fornecedores[f][1]}, nota ${nota}`);
    if (!resposta) continue;
    if (a.resposta) { passo(`/avaliacoes/${a.idAvaliacao}/responder (já respondida)`); continue; }
    await patch(`/avaliacoes/${a.idAvaliacao}/responder`, { resposta }); passo(`PATCH /avaliacoes/${a.idAvaliacao}/responder`);
  }

  // Selo EcoRota: critérios, pedidos, auditoria e decisão
  const criterios = [];
  for (const [eixo, descricao, peso, obrigatorio] of DEMO.criterios) {
    criterios.push(await garantir(tCriterios.find(c => c.descricao === descricao), '/criterios-sustentabilidade', { eixo, descricao, peso, obrigatorio }, `${descricao.slice(0, 40)}…`));
  }
  for (const [f, numero, emissao, validade, atendidos, status] of DEMO.certificacoes) {
    const num = numero.replace('{ano}', ano).replace('{anoAnterior}', ano - 1);
    const c = await garantir(tCertificacoes.find(x => x.numero === num), '/certificacoes', { idFornecedor: fornecedores[f].idFornecedor, numero: num,
      dataEmissao: somarDias(hoje, emissao), dataValidade: somarDias(hoje, validade), urlComprovante: `https://example.com/selo/${num.toLowerCase()}.pdf` },
      `${num} (${DEMO.fornecedores[f][1]})`);
    if (!atendidos) continue;
    const auditados = new Set((c.itensAuditoria || []).map(i => i.idCriterio));
    for (const [k, crit] of criterios.entries()) {
      const rota = `/certificacoes/${c.idFornCert}/itens-auditoria`;
      if (auditados.has(crit.idCriterio)) { passo(`${rota} → critério ${crit.idCriterio} (já auditado)`); continue; }
      const ok = atendidos.includes(k + 1);
      await post(rota, { idCriterio: crit.idCriterio, atendido: ok,
        evidenciaUrl: ok ? `https://example.com/provas/${num.toLowerCase()}/criterio-${crit.idCriterio}.pdf` : null, observacao: ok ? null : 'Sem prova apresentada' });
      passo(`POST ${rota} → critério ${crit.idCriterio}: ${ok ? 'atendido' : 'não atendido'}`);
    }
    if (c.status === status) { passo(`/certificacoes/${c.idFornCert}/status → ${status} (já estava)`); continue; }
    await patch(`/certificacoes/${c.idFornCert}/status`, { status }); passo(`PATCH /certificacoes/${c.idFornCert}/status → ${status}`);
  }

  // transporte, fatores de emissão e viagens
  const modais = [];
  for (const [nome, categoria] of DEMO.modais) modais.push(await garantir(tModais.find(m => m.nome === nome), '/modais-transporte', { nome, categoria }, nome));
  const fatores = {};
  for (const [m, deltaAno, kg] of DEMO.fatores) {
    const idModal = modais[m].idModal, anoVigencia = ano + deltaAno;
    const f = await garantir(tFatores.find(x => x.idModal === idModal && x.anoVigencia === anoVigencia), '/fatores-emissao',
      { idModal, anoVigencia, kgco2ePorKm: kg, fonte: 'Valor ilustrativo para demonstração' }, `${modais[m].nome} ${anoVigencia}`);
    if (!deltaAno) fatores[m] = f;
  }
  for (const [v, inicio, fim, trechos, servicos, status] of DEMO.viagens) {
    const idViajante = viajantes[v].idViajante, dataInicio = somarDias(hoje, inicio), dataFim = somarDias(hoje, fim);
    const [, origem1, destino1] = trechos[0];
    const viagem = await garantir(tViagens.find(x => x.idViajante === idViajante && ((x.dataInicio === dataInicio && x.dataFim === dataFim)
      || (x.trechos || []).some(t => t.origem === origem1 && t.destino === destino1))), '/viagens', { idViajante, dataInicio, dataFim }, viajantes[v].nome);
    for (const [m, origem, destino, km] of trechos) {
      const rota = `/viagens/${viagem.idViagem}/trechos`;
      if ((viagem.trechos || []).some(t => t.origem === origem && t.destino === destino)) { passo(`${rota} → ${origem} → ${destino} (já existia)`); continue; }
      await post(rota, { idFator: fatores[m].idFator, origem, destino, distanciaKm: km }); passo(`POST ${rota} → ${origem} → ${destino}`);
    }
    for (const [f, tipoServico, valor] of servicos) {
      const rota = `/viagens/${viagem.idViagem}/servicos`, idFornecedor = fornecedores[f].idFornecedor;
      if ((viagem.servicos || []).some(s => s.idFornecedor === idFornecedor && s.tipoServico === tipoServico)) { passo(`${rota} → ${tipoServico} (já existia)`); continue; }
      await post(rota, { idFornecedor, tipoServico, valor }); passo(`POST ${rota} → ${tipoServico}`);
    }
    if (!status) continue;
    if (viagem.status === status) { passo(`/viagens/${viagem.idViagem}/status → ${status} (já estava)`); continue; }
    await patch(`/viagens/${viagem.idViagem}/status`, { status }); passo(`PATCH /viagens/${viagem.idViagem}/status → ${status}`);
  }
  aoProgredir('Concluído', total, total);
}
