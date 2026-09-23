## **Como configurar a credencial do Ollama (local)**

O Ollama é a Inteligência Artificial que roda no seu próprio computador. Ela lê as descrições das vagas, compara com o seu perfil e dá uma nota de aderência. Como o Ollama roda localmente pelo Docker, **não é preciso criar conta nem chave de API**. Basta dizer ao n8n onde ele está.

1. Com os serviços rodando (`docker compose up -d`), abra o n8n em **http://localhost:5678**.
2. Abra o workflow **JobHunter** e dê dois cliques no nó **Ollama Chat Model**.
3. No campo **Credential**, clique em **Create New Credential** (será criada uma credencial do tipo **Ollama account**).
4. No campo **Base URL**, coloque: `http://ollama:11434`
5. Clique em **Save**. O n8n vai testar a conexão e mostrar uma mensagem de sucesso.
6. Confira se o modelo selecionado no nó é o **llama3.1:8b** (ele é baixado automaticamente na primeira vez que os serviços sobem, o que pode levar alguns minutos). Se aparecer o aviso `The value "llama3.1:8b" is not supported!`, veja [PROBLEMAS.md](PROBLEMAS.md).

> **Atenção:** use `http://ollama:11434`, e não `http://localhost:11434`. Dentro do Docker, o n8n enxerga o Ollama pelo nome do serviço (`ollama`). Com `localhost`, a conexão falha.

## **Como criar o Bot no Telegram e pegar o Chat ID**

Para o Telegram, precisamos de duas informações: criar o robô para pegar o "Token" e descobrir o seu número de identificação "Chat ID" para o robô saber para quem enviar a vaga.

## **Criando o Robô (Token)**

1. Abra o aplicativo do Telegram e, na barra de pesquisa, digite **@BotFather** (escolha o que tem o selo azul de verificado).
2. Abra a conversa e clique em **Iniciar**.
3. Envie a mensagem `/newbot` para começar a criar seu robô.
4. Envie um nome para o robô (exemplo: "Meu Robô de Empregos").
5. Envie um "username" (nome de usuário) único, que **obrigatoriamente** precisa terminar com a palavra "bot" (exemplo: `vagas_rafa_bot`).
6. Quando o nome for aceito, o BotFather enviará uma mensagem de sucesso. Copie o código enorme que vem logo abaixo da frase "Use this token to access the HTTP API:". Esse é o seu **Token**.

## **Pegando o seu Chat ID**

1. O robô só pode te enviar mensagens se você falar com ele primeiro. Pesquise no Telegram pelo username do robô que você acabou de criar (exemplo: `@vagas_rafa_bot`), abra a conversa e clique em **Iniciar**.
2. Volte na pesquisa do Telegram e digite **@userinfobot**.
3. Abra a conversa com esse bot e clique em **Iniciar**.
4. Ele vai responder instantaneamente com algumas informações. Copie o número que aparece na linha **Id:** (esse é o seu **Chat ID**).
5. Cole esse número no campo "Chat ID" na configuração final da mensagem no n8n.
