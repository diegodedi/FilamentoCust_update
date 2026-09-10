# Regra de Compilação e Upload para GitHub

**CRITICAL RULE: Ao compilar uma nova versão e subir para o GitHub**

Sempre que o usuário pedir para "compilar uma nova versão e subir para o github" (ou variações semelhantes), o agente DEVE entender que isso significa:
1. **Incrementar a versão** (bump) no `package.json` (por exemplo, de 1.0.13 para 1.0.14).
2. **Compilar uma nova versão do executável** e **fazer o upload para o GitHub (Release)**, para permitir a atualização automática do aplicativo instalado no PC do usuário.

O comando esperado no projeto atual é o `npm run build:electron`, que usa o `electron-builder` para gerar o instalador (e o `latest.yml`) e já realiza a publicação (publish) se configurado no `package.json`.
