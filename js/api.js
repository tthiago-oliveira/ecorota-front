// =====================================================================
// EcoRota · comunicação com a API do back-end (Java + Spring Boot)
// Todas as telas buscam e enviam dados por aqui.
// =====================================================================

// Endereço da API. Se ela rodar em outra porta ou outro computador, troque só esta linha.
const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
     ? "http://localhost:8080/api"
     : "https://ecorota-api.onrender.com";

// Erro devolvido pela API: guarda o status HTTP e, quando houver, o erro de cada campo
class ErroApi extends Error {
  constructor(mensagem, status = 0, campos = null) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

// Chama a API e devolve o JSON da resposta.
//   api('/atrativos')                                   GET
//   api('/reservas', { corpo: {...} })                  POST
//   api('/reservas/3/cancelar', { metodo: 'PATCH' })    PATCH
async function api(caminho, { metodo, corpo } = {}) {
  const opcoes = { method: metodo || (corpo === undefined ? 'GET' : 'POST') };
  if (corpo !== undefined) {
    opcoes.headers = { 'Content-Type': 'application/json' };
    opcoes.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, opcoes);
  } catch {
    document.dispatchEvent(new CustomEvent('api-status', { detail: false }));
    throw new ErroApi('Não foi possível falar com a API. Confira se o back-end está rodando em ' + API_URL + '.');
  }
  document.dispatchEvent(new CustomEvent('api-status', { detail: true }));

  const texto = await resposta.text();
  let dados = null;
  try { dados = texto ? JSON.parse(texto) : null; } catch { /* resposta sem JSON */ }

  if (!resposta.ok) {
    // GlobalExceptionHandler da API: { status, erro, mensagem, campos }
    // erros padrão do Spring:        { status, error, message, path }
    const mensagem = dados?.mensagem || dados?.message || dados?.erro || dados?.error || `Erro ${resposta.status}`;
    let campos = null;
    if (dados?.campos) {
      campos = {};
      for (const [campo, erro] of Object.entries(dados.campos)) campos[campo] = consertarAcentos(erro);
    }
    throw new ErroApi(consertarAcentos(mensagem), resposta.status, campos);
  }
  return dados;
}

// Algumas mensagens da API podem chegar com o acento trocado ("MunicÃ­pio"): é texto em UTF-8
// lido como Latin-1 na compilação do Java. Aqui ele volta ao normal; texto certo não muda.
function consertarAcentos(texto) {
  if (typeof texto !== 'string' || !/[ÃÂ][\u0080-¿]/.test(texto)) return texto;
  if ([...texto].some(c => c.charCodeAt(0) > 255)) return texto;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(texto, c => c.charCodeAt(0)));
  } catch {
    return texto;
  }
}
