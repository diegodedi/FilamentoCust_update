# Regra de Compilação e Upload para GitHub

**CRITICAL RULE: Ao compilar uma nova versão e subir para o GitHub**

Sempre que o usuário pedir para "compilar uma nova versão e subir para o github" (ou variações semelhantes), o agente DEVE entender que o fluxo 100% automático é:

1. **Incrementar a versão** (bump) no `package.json` (ex: de 1.0.27 para 1.0.28).
2. **Commit e Tag** das alterações no Git.
3. **Compilar e Publicar via Script**: Rodar o comando `npm run build:electron`, que executa:
   `vite build && dotenv -e .env -- electron-builder -p always`
   Esse comando gera o executável instalador na pasta `.dist_app/`, gera o arquivo de controle `latest.yml` e faz o upload automático da nova Release para o GitHub (`diegodedi/FilamentoCust_update`).
4. **Autoupdater no PC**: O aplicativo instalado no PC do usuário checa o GitHub Releases automaticamente via `electron-updater` e exibe o popup de atualização para o usuário.

## Autenticação com GitHub (GH_TOKEN)
- O script utiliza o token definido na variável `GH_TOKEN` no arquivo `.env` local.
- Para evitar que o fluxo automático quebre após 30 dias (tempo padrão de expiração do GitHub), o token clássico gerado no GitHub deve ter a validade configurada como **"No expiration"** com o escopo **`repo`**.
