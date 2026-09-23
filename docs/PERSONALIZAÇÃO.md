# Códigos Busca De Emprego N8N

Aqui estão os campos que você pode personalizar no workflow **JobHunter** do n8n para adaptar o robô ao seu perfil. O resto do workflow já vem pronto e não precisa ser alterado.

Cada seção abaixo indica em qual nó o conteúdo deve ser colado:

1. **Filtros de busca:** o que buscar no LinkedIn e quais vagas descartar. Vai no body do nó **HTTP Request**.
2. **Perfil para a IA:** o seu perfil, que a IA usa para dar a nota de cada vaga. Vai no prompt do nó **Basic LLM Chain**.
3. **Mensagem do Telegram:** o formato da mensagem enviada para você. Vai no campo **Text** do nó **Send a text message**.

## 1. Busca de vagas do LinkedIn com Api JobHunter:

```json
{
  "position": "Fullstack Developer",
  "location": "Brazil",
  "experienceLevel": "entry level",
  "remoteFilter": "remote",
  "focusKeywords": [
    "frontend",
    "front-end",
    "front end",
    "fullstack",
    "full-stack",
    "full stack",
    "backend",
    "back-end",
    "back end",
    "software engineer",
    "engenheiro de software",
    "engenheira de software",
    "desenvolvedor",
    "desenvolvedora",
    "react",
    "angular",
    "next",
    "next.js",
    "node",
    "node.js",
    "typescript",
    "javascript",
    "n8n",
    "pleno",
    "plena",
    "PL"
  ],
  "discardKeywords": [
    "senior",
    "estágio",
    "estagio",
    "intern",
    "internship",
    "trainee",
    "júnior",
    "junior",
    "jr",
    "lead",
    "tech lead",
    "manager",
    "gerente",
    "director",
    "coordenador",
    "banco de talentos",
    "talent pool",
    "banco de perfis",
    "qa",
    "tester",
    "data",
    "dados",
    "devops",
    "suporte",
    "help desk",
    "infraestrutura",
    "ios",
    "flutter",
    "c#",
    ".net",
    "java",
    "php",
    "ruby",
    "vue",
    "golang",
    "rust",
    "wordpress",
    "magento",
    "deficiência",
    "pcd"
  ]
}
```

## 2. Análise e compatibilidade de vagas com IA:

```
Você é um recrutador técnico. Avalie a aderência da vaga ao perfil do candidato.

PERFIL DO CANDIDATO:
- Cargo: Desenvolvedora Fullstack / Frontend / Backend
- Senioridade: pleno
- Stacks: TypeScript, React, Node.js, Express, Docker, n8n
- Idiomas: Português nativo, Inglês Avançado
- Preferência: Remoto

VAGA:
Título: {{ $json.position }}
Empresa: {{ $json.company }}
Local: {{ $json.location }}
Descrição: {{ $json.jobDescription }}

Responda SOMENTE com um JSON neste formato:
{
  "score": <0 a 100>,
  "pontos_fortes": ["..."],
  "requisitos_faltantes": ["..."],
  "alertas": ["ex: exige inglês fluente, presencial em outra cidade"],
  "resumo": "2-3 frases sobre a vaga"
}

```

## 3. Envio da mensagem pelo Telegram com informações das vagas selecionadas:

```
🎯 *NOVA VAGA COMPATÍVEL ENCONTRADA!*

📌 *Vaga:* {{ $json.position }}
🏢 *Empresa:* {{ $json.company }}
📍 *Local:* {{ $json.location }}
🕒 *Publicada:* {{ $json.agoTime || $json.date }}
💰 *Salário:* {{ $json.salary || 'Não informado' }}
📊 *Score:* {{ $json.score }}/100

💡 *Resumo:*
{{ $json.resumo }}

✅ *Pontos fortes:*
{{ ($json.pontos_fortes || []).length ? '• ' + $json.pontos_fortes.join('\n• ') : '—' }}

⚠️ *Requisitos faltantes:*
{{ ($json.requisitos_faltantes || []).length ? '• ' + $json.requisitos_faltantes.join('\n• ') : '—' }}

🚩 *Alertas:*
{{ ($json.alertas || []).length ? '• ' + $json.alertas.join('\n• ') : '—' }}

🔗 [Abrir vaga no LinkedIn]({{ $json.jobUrl }})

```
