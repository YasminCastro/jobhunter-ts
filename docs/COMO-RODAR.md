# Como rodar o JobHunter

Guia para subir o projeto completo (API + n8n + Ollama) com Docker e usar o workflow do n8n. Para a visão geral do projeto, veja o [README](../README.md).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) com Docker Compose (no Windows e no macOS, o Docker Desktop já inclui os dois)
- Cerca de **5 GB de espaço em disco** para o modelo `llama3.1:8b`
- Pelo menos **8 GB de RAM**, porque o modelo precisa ser carregado na memória
- Uma conta no **Telegram**, para criar o bot que envia as vagas

> **Sobre a placa de vídeo:** o `docker-compose.yml` roda o Ollama só no processador (CPU). Funciona em qualquer máquina, mas a análise de cada vaga pode levar de alguns segundos a mais de um minuto, dependendo do computador.

## Passo a passo

1. Copie o workflow para a pasta que o n8n importa na inicialização:

   ```bash
   cp JobHunter.json n8n-workflows/
   ```

2. Suba os serviços:

   ```bash
   docker compose up -d --build
   ```

   O serviço `ollama-pull` baixa o modelo `llama3.1:8b` na primeira execução. São alguns GB, então pode demorar.

3. Abra o n8n em http://localhost:5678, crie a conta local e configure as credenciais do **Ollama** e do **Telegram**. O passo a passo está em [CREDENCIAIS.md](CREDENCIAIS.md).

4. Personalize a busca, o seu perfil e a mensagem do Telegram seguindo [PERSONALIZAÇÃO.md](PERSONALIZA%C3%87%C3%83O.md).

5. Execute o workflow **JobHunter**.

| Serviço  | Container           | Porta                    |
| -------- | ------------------- | ------------------------ |
| API      | `job-hunter-api`    | `127.0.0.1:3000`         |
| Ollama   | `job-hunter-ollama` | `127.0.0.1:11434`        |
| n8n      | `job-hunter-n8n`    | `5678`                   |

Os volumes guardam os modelos do Ollama (`ollama_data`), os dados do n8n (`n8n_data`) e o banco de vagas enviadas (`api_data`). Os logs da API ficam em `./logs`.

## Ver as vagas de novo

Cada vaga é enviada uma vez só. Para limpar o histórico e receber todas de novo:

```bash
docker compose exec api node_modules/.bin/tsx src/scripts/clearSentJobs.ts
```

## Workflow do n8n

[`JobHunter.json`](../JobHunter.json) é o workflow principal:

1. **Manual Trigger:** dispara a execução.
2. **HTTP Request:** chama a API com os filtros de busca.
3. **Split Out:** separa cada vaga.
4. **Basic LLM Chain + Ollama:** avalia a vaga contra o perfil do candidato e devolve um JSON com a nota.
5. **Juntar análise:** junta a vaga com a análise do LLM.
6. **If:** deixa passar só as vagas com `score >= 60`.
7. **Telegram:** envia a vaga.

### Workflow original

[`Rafa-Example.json`](../Rafa-Example.json) é o workflow original do [tutorial da Rafaella Ballerini](https://youtu.be/sq8ThaXkp7k?si=vCbjlukTatV6VIXE), no qual este projeto foi baseado. Ele faz a mesma coisa usando serviços externos: Apify para o scraping do LinkedIn e Groq como LLM. Também gera um rascunho de carta de apresentação para cada vaga. Fica aqui como referência e para dar o crédito a ela.
