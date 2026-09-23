# Problemas comuns

Soluções para erros que podem aparecer ao rodar o JobHunter. Para subir o projeto, veja [COMO-RODAR.md](COMO-RODAR.md).

## Ollama: `The value "llama3.1:8b" is not supported!`

O nó **Ollama Chat Model** mostra esse aviso no campo **Model**, mesmo com a credencial do Ollama testada com sucesso.

### Por que acontece

O n8n preenche o campo **Model** com a lista de modelos que já foram baixados no Ollama. Se o `llama3.1:8b` não estiver nessa lista, o n8n mostra o aviso. O teste da credencial só confere se o n8n consegue falar com o Ollama. Ele não confere se o modelo existe.

Quem baixa o modelo é o serviço `ollama-pull`, que roda uma vez quando os serviços sobem. O download tem cerca de 5 GB e pode levar vários minutos. O n8n não espera o download acabar, então é possível abrir o workflow antes de o modelo estar disponível.

### Como resolver

1. Veja se o modelo já está no Ollama:

   ```bash
   docker exec job-hunter-ollama ollama list
   ```

   Se o `llama3.1:8b` aparecer na lista, pule para o passo 4.

2. Veja o estado do serviço que baixa o modelo:

   ```bash
   docker compose ps -a ollama-pull
   ```

   - `Up`: o download ainda está em andamento. Espere até aparecer `Exited (0)`.
   - `Exited (0)`: o download terminou. Rode o `ollama list` de novo.
   - `Exited` com outro código: o download falhou. Siga para o passo 3.

   > O `docker compose logs ollama-pull` mostra só `pulling manifest` durante todo o download. É normal: sem um terminal interativo, o Ollama não mostra a barra de progresso. Não quer dizer que o download travou.

3. Se o download falhou, baixe o modelo manualmente. Assim você acompanha o progresso:

   ```bash
   docker exec -it job-hunter-ollama ollama pull llama3.1:8b
   ```

   Se esse comando também falhar, confira se há pelo menos 5 GB livres (`df -h`) e se a máquina acessa a internet (`curl -I https://registry.ollama.ai/v2/`).

4. No n8n, abra o nó **Ollama Chat Model**. No campo **Model**, clique em **fx** para trocar de *Expression* para *Fixed*. Escolha `llama3.1:8b` na lista e salve o workflow.

   Se o modelo não aparecer na lista, feche o nó e abra de novo para a lista ser recarregada.
