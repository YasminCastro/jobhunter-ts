# 🎯 JobHunter

Automação de busca de vagas no LinkedIn. Uma API própria busca as vagas, filtra por palavras-chave e ignora as que já foram vistas. Um workflow do **n8n** usa essa API, pede a um LLM local (**Ollama** com `llama3.1:8b`) uma nota de aderência ao seu perfil e manda as vagas com nota boa para o **Telegram**.

```
⚙️ n8n (gatilho) ──► 🔎 API JobHunter ──► 💼 LinkedIn
                        │
                        ▼
              📄 vagas novas + descrição
                        │
                        ▼
      🤖 Ollama (llama3.1:8b) dá a nota de aderência
                        │
                        ▼
            📊 score ≥ 60 ──► 📲 Telegram
```

## 💡 Origem

Este projeto foi baseado no [tutorial da Rafaella Ballerini](https://youtu.be/sq8ThaXkp7k?si=vCbjlukTatV6VIXE). A ideia aqui foi rodar tudo localmente, sem depender de APIs externas e sem pagar nada:

- 🔎 O scraping do LinkedIn, que no tutorial é feito pelo Apify, aqui é feito por uma API própria.
- 🤖 A análise das vagas, que no tutorial usa o Groq, aqui roda em um LLM local com o Ollama.
- 🐳 Tudo, inclusive o n8n, fica hospedado na sua máquina via Docker.

## 🛠️ Stack

- 🟩 **API:** Node.js 24 + TypeScript
- ⚙️ **Orquestração:** n8n
- 🦙 **LLM:** Ollama (`llama3.1:8b`)
- 🐳 **Infra:** Docker Compose

## 📚 Documentação

- 🚀 [Como rodar](docs/COMO-RODAR.md): como subir o projeto com Docker e como funciona o workflow do n8n.
- 🔑 [Credenciais](docs/CREDENCIAIS.md): como configurar o Ollama e o bot do Telegram no n8n.
- ✏️ [Campos personalizáveis](docs/PERSONALIZA%C3%87%C3%83O.md): filtros de busca, perfil para a IA e mensagem do Telegram.
- 🔌 [API](docs/API.md): endpoints, parâmetros e funcionamento da API.
