# 🌌 Asteroid Monitoring QA

Suíte de testes automatizados para a API **NASA NeoWs (Near Earth Object Web Service)**, monitorando asteroides próximos à Terra em tempo real. Desenvolvido com **Playwright** e **TypeScript**.

---

## 📋 Sobre o Projeto

Este projeto valida o comportamento da API pública da NASA que fornece dados sobre objetos próximos à Terra (NEOs). Os testes cobrem desde a conectividade básica até validações de regras de negócio, como classificação de asteroides perigosos, velocidade de aproximação e distância em relação à Terra.

---

## 🚀 Tecnologias

| Ferramenta | Versão | Finalidade |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | Runtime JavaScript |
| [Playwright](https://playwright.dev) | ^1.40 | Framework de testes |
| [TypeScript](https://www.typescriptlang.org) | ^5.0 | Tipagem estática |
| [dotenv](https://github.com/motdotla/dotenv) | ^16.0 | Variáveis de ambiente |

---

## 📁 Estrutura do Projeto

```
asteroid-monitoring-qa/
├── tests/
│   ├── asteroid.spec.ts       # Testes de conexão e validação de schema
│   └── danger_zone.spec.ts    # Testes de análise de risco e regras de negócio
├── playwright-report/
│   └── index.html             # Relatório HTML dos testes
├── .env                       # Variáveis de ambiente (não commitado)
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.ts       # Configuração global do Playwright
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js 18 ou superior
- Uma chave de API gratuita da NASA → [obtenha aqui](https://api.nasa.gov)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/asteroid-monitoring-qa.git
cd asteroid-monitoring-qa
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure a variável de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
NASA_API_KEY=sua_chave_aqui
```

> ⚠️ O arquivo `.env` está listado no `.gitignore` e **nunca deve ser commitado**. Nunca exponha sua chave de API publicamente.

---

## 🧪 Casos de Teste

### `asteroid.spec.ts` — Conexão e Estrutura

| ID | Descrição | Tipo |
|---|---|---|
| 1 | Valida status 200 ao consultar o feed da NASA | Positivo |
| 2 | Verifica campos obrigatórios na raiz da resposta (`element_count`, `near_earth_objects`) | Schema |
| 3 | Garante rejeição com status 403 ao usar chave inválida | Negativo |
| 4 | Valida a estrutura de cada asteroide individualmente (id, name, diameter, velocity) | Schema |
| 5 | Busca asteroide específico por ID via `/neo/:id` e valida `orbital_data` | Encadeado |

### `danger_zone.spec.ts` — Zona de Perigo

| ID | Descrição | Tipo |
|---|---|---|
| 6 | Classifica asteroides perigosos vs seguros com contagem e verificação de integridade | Regra de negócio |
| 7 | Valida velocidade de aproximação em km/h dentro de faixa realista (0–300.000 km/h) | Regra de negócio |
| 8 | Verifica distância de miss em km e em distâncias lunares com classificação de risco | Regra de negócio |
| 9 | Valida que o diâmetro estimado mínimo é sempre ≤ máximo | Consistência |
| 10 | Confirma que a soma dos asteroides por data é igual ao `element_count` declarado | Integridade |

---

## ▶️ Como Executar

### Rodar todos os testes

```bash
npx playwright test
```

### Rodar um arquivo específico

```bash
npx playwright test tests/asteroid.spec.ts
npx playwright test tests/danger_zone.spec.ts
```

### Rodar um teste específico pelo nome

```bash
npx playwright test -g "CT03"
```

### Rodar em modo verbose (ver cada passo)

```bash
npx playwright test --reporter=list
```

### Visualizar o relatório HTML

```bash
npx playwright show-report
```

---

## 📊 Exemplo de Saída

```
Running 10 tests using 1 worker

  ✓  1 - Deve retornar status 200 ao consultar asteroides de hoje (312ms)
  ✓  2 - Deve conter os campos obrigatórios na resposta da API (289ms)
  ✓  3 - Deve retornar erro 403 com chave de API inválida (201ms)
  ✓  4 - Deve validar campos de cada asteroide individualmente (445ms)
  ✓  5 - Deve buscar asteroide específico por ID (678ms)
  ✓  6 - Deve classificar corretamente asteroides perigosos e seguros (398ms)
  ✓  7 - Deve validar velocidade de aproximação dos asteroides (412ms)
  ✓  8 - Deve validar distância de aproximação à Terra (389ms)
  ✓  9 - Deve validar tamanho estimado dos asteroides (401ms)
  ✓  10 - Deve verificar período de datas retornado pela API (367ms)

  10 passed (4.5s)
```

---

## 🌐 API Utilizada

**NASA NeoWs — Near Earth Object Web Service**

| Endpoint | Descrição |
|---|---|
| `GET /neo/rest/v1/feed` | Lista asteroides próximos à Terra nos próximos 7 dias |
| `GET /neo/rest/v1/neo/:id` | Detalhes de um asteroide específico por ID |

- **Base URL:** `https://api.nasa.gov/neo/rest/v1`
- **Documentação oficial:** [api.nasa.gov](https://api.nasa.gov)
- **Autenticação:** API Key via query parameter `?api_key=SUACHAVE`
- **Limite gratuito:** 1.000 requisições/hora

---

## 🔑 Obtendo sua Chave da NASA

1. Acesse [https://api.nasa.gov](https://api.nasa.gov)
2. Preencha o formulário de cadastro
3. Receba a chave no seu e-mail imediatamente
4. Adicione a chave no arquivo `.env` conforme descrito na configuração

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feat/novo-teste`
3. Commit suas mudanças: `git commit -m 'feat: adiciona validação de X'`
4. Envie para a branch: `git push origin feat/novo-teste`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com 🔭 monitorando o céu com código
</div>
