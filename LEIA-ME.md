# EcoRota · site (front-end)

Site do EcoRota em HTML, CSS e JavaScript puro. Não precisa instalar nada: ele abre direto no navegador
e conversa com a API do back-end (`ecorota-api`, Java com Spring Boot) em `http://localhost:8080/api`.
O site não acessa o banco: tudo passa pela API.

## Do que o site precisa

- **A versão completa da API**, com os 14 controllers: municípios, destinos, atrativos, capacidade de carga,
  janelas de visitação, viajantes, reservas, fornecedores, avaliações, critérios de sustentabilidade,
  certificações (Selo EcoRota), modais de transporte, fatores de emissão e viagens.
  A versão antiga da API, que só tinha municípios, destinos e atrativos, faz funcionar só essas três partes.
- MySQL 8 ligado e Java 21.

## Como rodar

1. Ligue o MySQL 8.
2. Rode a API, na pasta do projeto. No terminal do VS Code (PowerShell), use `.\mvnw.cmd spring-boot:run`, com o `.\` na frente.
   No Prompt de Comando (cmd), use `mvnw.cmd spring-boot:run`.
   Quando aparecer `Started EcorotaApiApplication`, a API está no ar. Deixe o terminal aberto.
3. Abra `frontend/index.html` no navegador com dois cliques.
   No VS Code, clique com o botão direito em `index.html` > *Reveal in File Explorer* e dê dois cliques no arquivo.
   No rodapé aparece **API conectada** com o ponto verde.
4. Com o banco vazio, a página inicial mostra o botão **Carregar dados de demonstração**.
   Ele cadastra tudo pela própria API, rota por rota, em poucos segundos:
   - 3 municípios reais, com o código oficial do IBGE: Bonito, Fernando de Noronha e Alto Paraíso de Goiás;
   - 3 destinos e 7 atrativos, com capacidade de carga e horários de visita para os próximos 6 dias;
   - 6 viajantes, 4 reservas, 8 fornecedores, 16 avaliações e 5 pedidos do Selo EcoRota (3 já auditados);
   - 4 meios de transporte com fatores de emissão, e 3 viagens com trechos e serviços.

   A carga pode ser rodada de novo sem duplicar nada: o site primeiro lê o que o banco já tem e só cadastra o que falta.
   - Se o banco já tem os municípios, destinos e atrativos do site antigo, o botão vira **Completar dados de demonstração**.
   - Se a carga parar no meio, clique em **Tentar de novo**.
   - O mesmo botão fica em *Área do gestor* > *Visão geral*.

## Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Capa animada com busca, números do banco, destinos em destaque, atrativos com vaga, Selo EcoRota e simulador de pegada de carbono. |
| Destinos | `destinos.html` | Lista com busca e filtros por estado e por tipo. |
| Atrativos | `atrativos.html` | Busca, filtros (destino, tipo, só gratuitos) e ordem (próxima vaga, preço, nome). |
| Atrativo | `atrativo.html?id=` | Ficha do lugar, medidor da capacidade de carga, horários com vagas e reserva. |
| Fornecedores | `fornecedores.html` | Ranking (selo válido, perfil reivindicado e nota), filtros, indicar um fornecedor e cadastrar o próprio negócio. |
| Fornecedor | `fornecedor.html?id=` | Perfil, notas, avaliações, resposta do dono, reivindicar o perfil e pedir o Selo EcoRota. |
| Pegada de carbono | `pegada.html` | Simulador e *Minhas viagens*: trechos, serviços contratados e situação da viagem. |
| Minha conta | `conta.html` | Reservas (com cancelamento), avaliações e viagens do viajante. |
| Sobre | `sobre.html` | Quem somos, missão, visão e valores, o que a EcoRota faz, para quem é, regras do Selo EcoRota, compromissos e perguntas frequentes. |
| Área do gestor | `gestor.html` | Visão geral, auditoria do Selo EcoRota, capacidade e horários, destinos e atrativos, transporte e emissões, critérios do selo. Fica no rodapé. |

**Entrar:** a API ainda não tem senha, então o viajante entra só com o e-mail (ou cria a conta, que faz `POST /api/viajantes`).
Com os dados de demonstração, a janela de entrar mostra um *acesso rápido* com os viajantes cadastrados.
O site lembra quem entrou no próprio navegador.

## Rotas da API usadas

| Página | Rotas |
|---|---|
| Início | `GET` destinos, atrativos, fornecedores, avaliações, certificações, janelas-visitacao, criterios-sustentabilidade, modais-transporte, fatores-emissao |
| Destinos e Atrativos | `GET /destinos`, `GET /atrativos`, `GET /janelas-visitacao` |
| Atrativo | `GET /atrativos/{id}`, `GET /atrativos?idDestino=`, `GET /capacidades-carga?idAtrativo=`, `GET /janelas-visitacao?idAtrativo=`, `POST /reservas` |
| Fornecedores | `GET /fornecedores`, `GET /municipios`, `GET /avaliacoes`, `GET /certificacoes`, `POST /fornecedores` |
| Fornecedor | `GET /fornecedores/{id}`, `GET /avaliacoes?idFornecedor=`, `GET /avaliacoes/fornecedor/{id}/resumo`, `GET /certificacoes?idFornecedor=`, `POST /avaliacoes`, `POST /certificacoes`, `PATCH /fornecedores/{id}/reivindicar`, `PATCH /avaliacoes/{id}/responder` |
| Pegada de carbono | `GET /modais-transporte`, `GET /fatores-emissao`, `GET /viagens?idViajante=`, `POST /viagens`, `POST /viagens/{id}/trechos`, `POST /viagens/{id}/servicos`, `PATCH /viagens/{id}/status` |
| Minha conta | `GET /reservas?idViajante=`, `GET /avaliacoes?idViajante=`, `GET /viagens?idViajante=`, `PATCH /reservas/{id}/cancelar` |
| Entrar | `GET /viajantes`, `GET /viajantes/{id}`, `POST /viajantes` |
| Área do gestor | `GET` de todas as listas, `POST` de municípios, destinos, atrativos, capacidades-carga, janelas-visitacao, modais-transporte, fatores-emissao e criterios-sustentabilidade, `POST /certificacoes/{id}/itens-auditoria`, `PATCH /certificacoes/{id}/status` |

Os erros da API aparecem embaixo do campo certo do formulário.
Exemplos: horário acima da cota (422), e-mail ou CNPJ repetido (409), avaliar o mesmo fornecedor duas vezes (409)
e aprovar o selo sem os critérios obrigatórios (422).

## Se algo não funcionar

| O que aparece | O que fazer |
|---|---|
| No rodapé, **API desligada**, ou a mensagem *Não foi possível falar com a API* | Ligue a API (passo 2) e recarregue a página. Se ela roda em outra porta, troque o `API_URL` no começo do `js/api.js`. |
| Destinos e atrativos funcionam, mas o resto dá erro (*Not Found*, 404) | A API rodando é a versão antiga. Use a versão completa, com os 14 controllers. |
| A carga de demonstração parou no meio | Clique em **Tentar de novo**: o que já foi cadastrado continua salvo. |
| `'mvnw.cmd' não é reconhecido` | No PowerShell, escreva `.\mvnw.cmd spring-boot:run`. |
| `MalformedInputException` no `application.properties` | O arquivo está salvo em Latin-1. No VS Code: clique em `UTF-8` na barra de baixo, *Reabrir com codificação* > *Western (ISO 8859-1)*, depois *Salvar com codificação* > *UTF-8*. |
| `UnsupportedClassVersionError`, `release version 21 not supported` ou `JAVA_HOME` | O projeto é para Java 21. Aponte o `JAVA_HOME` para o JDK 21 e rode `.\mvnw.cmd clean spring-boot:run`. |
| `Access denied for user 'root'` | Troque a senha em `spring.datasource.password`, no `src/main/resources/application.properties`. |
| `Found non-empty schema(s) 'ecorota' but no schema history table` | O banco foi criado por outro script. Rode `DROP DATABASE ecorota;` no Workbench e suba a API de novo. |
| `Communications link failure` | O MySQL está desligado: ligue o serviço do MySQL. |
| `Port 8080 was already in use` | Já tem uma API aberta em outro terminal: feche esse terminal. |

## Arquivos

- `*.html`: uma página por arquivo.
- `css/estilo.css`: o visual de todas as páginas. `css/fontes.css` e a pasta `fonts/`: a fonte Plus Jakarta Sans,
  guardada no próprio site para funcionar sem internet (licença livre SIL OFL, em `fonts/OFL-PlusJakartaSans.txt`).
- `js/api.js`: o endereço da API (`API_URL`) e a função `api()`, que todas as páginas usam para chamar o back-end com `fetch()`.
- `js/ui.js`: topo, rodapé, janelas, avisos, formatação de datas e valores, e a entrada do viajante.
- `js/arte.js`: as ilustrações dos lugares (praia, gruta, rio, cachoeira, chapada…), desenhadas em SVG pelo próprio site.
  Não usam fotos de terceiros, então não há problema de direitos de imagem nem de internet.
- `js/componentes.js`: partes repetidas, como os cartões de atrativo, destino e fornecedor e o simulador de pegada.
- `js/demo.js`: os dados de demonstração. Os municípios e atrativos são reais, com o código oficial do IBGE.
  Coordenadas são aproximadas e preços e fatores de emissão, ilustrativos.
  Pessoas, fornecedores, CNPJs e avaliações são fictícios.
- `js/<página>.js`: um arquivo por página, com o mesmo nome do HTML (`inicio.js` é o da `index.html`).

## Observações

- Algumas mensagens de erro da API chegam com o acento trocado ("MunicÃ­pio" em vez de "Município").
  O texto já está assim no código Java. O site corrige isso na tela.
- A API não tem rotas para editar nem excluir cadastros, então o site cadastra, lista e usa as ações que existem
  (cancelar reserva, reivindicar perfil, responder avaliação, auditar o selo e mudar a situação da viagem).
