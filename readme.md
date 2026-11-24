# EcoRota — Plataforma de Turismo Sustentável

Interface web da plataforma **EcoRota**, desenvolvida em **HTML5, CSS3 e JavaScript Vanilla modular**, projetada para conectar viajantes conscientes, prestadores de serviços locais certificados e gestores ambientais em uma experiência integrada de ecoturismo responsável.

> **Repositório do Back-end:** [tthiago-oliveira/ecorota-api](https://github.com/tthiago-oliveira/ecorota-api)

---

## Sobre o Projeto

O crescimento desordenado do turismo em áreas naturais pressiona ecossistemas sensíveis, dificulta a identificação de operadores realmente comprometidos com práticas socioambientais e omite o impacto climático dos deslocamentos.

O **EcoRota** nasce como uma solução digital completa para transformar a forma como roteiros ecológicos são planejados, operados e monitorados, apoiando-se em quatro pilares:

1. **Preservação por Capacidade de Carga:** Controle transparente de cotas de visitação por atrativo e horário, respeitando os limites ecológicos de trilhas, parques e unidades de conservação.
2. **Transparência e Selo EcoRota:** Valorização de fornecedores locais auditados em critérios ambientais, sociais, econômicos e de gestão, combatendo o *greenwashing* com avaliações verificadas de viajantes.
3. **Consciência Climática (Pegada de Carbono):** Calculadora interativa de emissões ($\text{kgCO}_2\text{e}$) baseada no *GHG Protocol*, permitindo simular trechos de viagem por modal de transporte e visualizar o impacto ambiental do roteiro.
4. **Gestão Integrada do Território:** Painel administrativo para cadastro de municípios, destinos, atrativos, regras de capacidade de carga e auditorias de certificação.

---

## Funcionalidades e Telas

A aplicação atende três perfis principais de usuários (**Viajante**, **Fornecedor** e **Gestor Ambiental**) distribuídos nas seguintes páginas:

| Página | Arquivo | Descrição e Funcionalidades |
| :--- | :--- | :--- |
| **Início** | `index.html` | Apresentação da plataforma, indicadores gerais do ecossistema, destaques de destinos e acesso rápido aos módulos. |
| **Destinos** | `destinos.html` | Exploração de municípios e regiões turísticas com filtros por estado (UF) e vocação ecológica. |
| **Atrativos** | `atrativos.html` | Catálogo de parques, trilhas, cachoeiras e reservas naturais com filtros por destino, exigência de guia e faixa de valor. |
| **Ficha do Atrativo** | `atrativo.html` | Detalhes completos do atrativo, localização geográfica, janelas de visitação disponíveis e reserva de vagas em tempo real. |
| **Fornecedores** | `fornecedores.html` | Diretório de operadoras, guias, hospedagens e serviços locais com destaque para detentores do **Selo EcoRota**. |
| **Perfil do Fornecedor** | `fornecedor.html` | Histórico de auditoria ESG, critérios certificados, fluxo de reivindicação de perfil via CNPJ, avaliações e respostas oficiais. |
| **Pegada de Carbono** | `pegada.html` | Planejador de viagens e simulador de emissões ($\text{kgCO}_2\text{e}$) por trecho e modal de transporte. |
| **Minha Conta** | `conta.html` | Área do viajante para consulta de reservas ativas, histórico de roteiros e envio de avaliações. |
| **Painel do Gestor** | `gestor.html` | Central operacional para cadastro de territórios, configuração de capacidade de carga, abertura de janelas e auditoria de selos. |
| **Sobre** | `sobre.html` | Manifesto do projeto, metodologia de sustentabilidade, arquitetura da solução e créditos. |

---

## Arquitetura e Tecnologias

O front-end foi construído sem dependência de frameworks pesados ou etapas de compilação (*zero-build*), garantindo leveza, carregamento instantâneo e facilidade de manutenção:

* **HTML5 Semântico:** Estrutura acessível e organizada por domínio de negócio.
* **CSS3 Modular (`css/estilo.css`):** Design system próprio com variáveis CSS, layout responsivo e tipografia **Plus Jakarta Sans** hospedada localmente (`fonts/`).
* **JavaScript ES6+ Modular (`js/`):**
  * `js/api.js`: Camada centralizada de comunicação REST (`fetch`) com detecção automática entre ambiente local e produção.
  * `js/componentes.js` & `js/ui.js`: Renderização dinâmica de cabeçalho, rodapé, modais, notificações (*toasts*), badges de certificação e tratamento de erros de validação.
  * `js/arte.js`: Ilustrações vetoriais e elementos visuais dinâmicos da interface.
  * `js/demo.js`: Base de dados de demonstração e rotina de população inicial (*seed*) para testes rápidos.

---

## Como Executar Localmente

Como o projeto utiliza apenas tecnologias web nativas, não é necessário instalar Node.js, npm ou bundlers.

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/tthiago-oliveira/ecorota.git
   cd ecorota
   ```

2. **Inicie a API Back-end (opcional para modo completo):**
   * Siga as instruções do repositório [`ecorota-api`](https://github.com/tthiago-oliveira/ecorota-api) para subir o servidor Spring Boot em `http://localhost:8080`.
   * O arquivo `js/api.js` detecta automaticamente quando o site está rodando localmente (`localhost`, `127.0.0.1` ou `file://`) e aponta as requisições para `http://localhost:8080/api`.

3. **Abra a aplicação no navegador:**
   * **Opção A (Recomendada — Live Server):** Abra a pasta `ecorota` no **VS Code**, clique com o botão direito em `index.html` e selecione **Open with Live Server**.
   * **Opção B (Direto no navegador):** Dê um duplo clique no arquivo `index.html` para abri-lo diretamente no navegador.

---

## Deploy e Configuração de Produção

Para publicar o front-end em serviços estáticos como **Vercel**, **Netlify** ou **GitHub Pages**:

1. Certifique-se de que a URL de produção da API no arquivo `js/api.js` aponta para o endereço público do back-end (ex.: `https://ecorota-api.onrender.com/api`).
2. Faça o *push* dos arquivos na raiz da branch `main` do repositório.
3. No provedor escolhido, aponte o diretório raiz (`/`) como pasta de publicação — nenhuma etapa de *build* é necessária.

---

## Estrutura de Pastas

```text
ecorota/
├── css/
│   ├── estilo.css          # Estilos globais, componentes e responsividade
│   └── fontes.css          # Declarações @font-face locais
├── fonts/                  # Arquivos .woff2 da família Plus Jakarta Sans
├── img/
│   └── logo.png            # Identidade visual do EcoRota
├── js/
│   ├── api.js              # Cliente HTTP e configuração de ambiente
│   ├── arte.js             # Gráficos e elementos visuais SVG
│   ├── atrativo.js         # Lógica da ficha de atrativo e reservas
│   ├── atrativos.js        # Listagem e filtros de atrativos
│   ├── componentes.js      # Navbar, footer e elementos compartilhados
│   ├── conta.js            # Gestão de reservas e perfil do viajante
│   ├── demo.js             # Dados de exemplo e carga inicial
│   ├── destinos.js         # Listagem de municípios e destinos
│   ├── fornecedor.js       # Detalhes, selo ESG e avaliações do fornecedor
│   ├── fornecedores.js     # Catálogo de prestadores de serviço
│   ├── gestor.js           # Painel administrativo e auditoria
│   ├── inicio.js           # Scripts da página inicial
│   ├── pegada.js           # Calculadora de pegada de carbono
│   ├── sobre.js            # Scripts da página institucional
│   └── ui.js               # Helpers de interface, máscaras e alertas
├── index.html
├── destinos.html
├── atrativos.html
├── atrativo.html
├── fornecedores.html
├── fornecedor.html
├── pegada.html
├── conta.html
├── gestor.html
├── sobre.html
├── .gitignore
└── README.md
```