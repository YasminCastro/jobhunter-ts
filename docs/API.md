# JobHunter API

API em Node.js/TypeScript que busca vagas no LinkedIn, filtra por palavras-chave, ignora vagas já vistas e devolve a descrição completa de cada uma. É ela que o workflow do n8n chama para buscar as vagas.

Para rodar o projeto completo (API + n8n + Ollama), veja o [README](../README.md).

## Stack

- Node.js 24, TypeScript (via `tsx`), Express 5, Zod, Winston
- **Scraping:** [`linkedin-jobs-api`](https://www.npmjs.com/package/linkedin-jobs-api), Axios, Cheerio, `random-useragent`
- **Persistência:** SQLite nativo do Node (`node:sqlite`), usado para lembrar as vagas já enviadas

## Rodando em modo desenvolvimento

É preciso ter Node.js 24 (por causa do `node:sqlite`).

```bash
npm install
npm run dev
```

A API sobe em http://localhost:3000 com hot reload (nodemon + tsx).

## Endpoints

### `GET /`

Health check. Retorna `{ "message": "Welcome to the JobHunter!" }`.

### `POST /jobspy`

Busca vagas no LinkedIn e retorna até **10 vagas novas**, cada uma com a descrição completa.

**Body:**

| Campo             | Tipo       | Obrigatório | Valores                                                                          |
| ----------------- | ---------- | ----------- | -------------------------------------------------------------------------------- |
| `position`        | `string`   | sim         | Cargo buscado, ex.: `"Fullstack Developer"`                                      |
| `location`        | `string`   | não         | ex.: `"Brazil"`                                                                  |
| `remoteFilter`    | `string`   | não         | `on site`, `remote`, `hybrid`                                                    |
| `dateSincePosted` | `string`   | não         | `24hr` (padrão), `past week`, `past month`                                       |
| `experienceLevel` | `string`   | não         | `internship`, `entry level`, `associate`, `senior`, `director`, `executive`      |
| `focusKeywords`   | `string[]` | não         | O título da vaga precisa conter pelo menos um destes termos                      |
| `discardKeywords` | `string[]` | não         | Vagas cujo título contém algum destes termos são descartadas                     |

A comparação de palavras-chave é feita só no **título**, por palavra inteira, sem diferenciar maiúsculas/minúsculas e ignorando acentos (`estagio` casa com `Estágio`).

**Exemplo:**

```bash
curl -X POST http://localhost:3000/jobspy \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Fullstack Developer",
    "location": "Brazil",
    "remoteFilter": "remote",
    "experienceLevel": "entry level",
    "focusKeywords": ["fullstack", "react", "node"],
    "discardKeywords": ["senior", "estagio", "junior"]
  }'
```

**Resposta:**

```json
{
  "success": true,
  "results": [
    {
      "position": "...",
      "company": "...",
      "location": "...",
      "jobUrl": "...",
      "jobDescription": "..."
    }
  ]
}
```

Se o body for inválido, a API responde `400` com as mensagens de validação.

#### Como a busca funciona

- Cada vaga vira um hash SHA-256 de `empresa | cargo | local | url`, salvo em `data/sent-jobs.db`. Vagas que já estão no banco são ignoradas, então cada vaga aparece só uma vez.
- Toda vaga nova vai para o banco, **inclusive as que forem descartadas pelos filtros de palavra-chave**.
- A API só passa para a próxima página (até 10) quando todas as vagas da página atual já tinham sido vistas.
- Entre uma descrição e outra há uma pausa de 2 a 3 segundos. Se o LinkedIn responder `429`, a API tenta de novo até 3 vezes com backoff exponencial.

### `GET /jobspy`

Lista as vagas salvas em `data/sent-jobs.db`, da mais recente para a mais antiga. Sem parâmetros, retorna todas.

**Query params (opcionais):**

| Campo       | Formato                         | Descrição                                                    |
| ----------- | ------------------------------- | ------------------------------------------------------------ |
| `startDate` | `YYYY-MM-DD` ou ISO 8601        | Vagas salvas a partir desta data                             |
| `endDate`   | `YYYY-MM-DD` ou ISO 8601        | Vagas salvas até esta data (com `YYYY-MM-DD`, inclui o dia todo) |

Datas sem horário são interpretadas em UTC. Para usar o fuso de Brasília, passe o offset: `2026-09-23T00:00:00-03:00`.

**Exemplo:**

```bash
curl "http://localhost:3000/jobspy?startDate=2026-09-01&endDate=2026-09-23"
```

**Resposta:**

```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "hash": "...",
      "company": "...",
      "position": "...",
      "location": "...",
      "jobUrl": "...",
      "createdAt": "2026-09-23T12:00:00.000Z"
    }
  ]
}
```

Datas inválidas ou `startDate` maior que `endDate` retornam `400`.

## Scripts

| Comando            | O que faz                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| `npm run dev`      | Sobe a API com hot reload                                                   |
| `npm run db:clean` | Apaga o histórico de vagas enviadas, para que todas voltem a aparecer      |

## Logs

Os logs são gravados em `logs/combined.log` (tudo) e `logs/error.log` (só erros), além de saírem no console.

## Estrutura

```
src/
├── app.ts                    # Configuração do Express
├── api/routes/
│   ├── index.ts              # Registro das rotas
│   ├── jobspy/               # Rota e schema Zod do /jobspy
│   ├── demo/                 # Rota de exemplo
│   └── controller/           # Lógica das rotas
├── helper/
│   ├── sentJobs.ts           # Controle de vagas já enviadas (SQLite)
│   ├── matchesAny.ts         # Match de palavras-chave
│   ├── validate.ts           # Middleware de validação Zod
│   ├── logger.ts             # Winston (console + logs/)
│   └── ...
├── middleware/error.ts       # Tratamento de erros
└── scripts/clearSentJobs.ts  # Limpeza do banco
```
