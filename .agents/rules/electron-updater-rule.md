# Regra de Atualização do Electron (electron-updater)

**CRITICAL RULE: NUNCA remova a configuração \publish\ do bloco \uild\ no arquivo \package.json\.**

## Motivo
O sistema de atualização automática (auto-updater) via GitHub Releases depende da configuração \publish\ dentro do objeto \uild\ do \package.json\. Se essa configuração for removida, o \electron-builder\ não gerará o arquivo \latest.yml\ durante o processo de build, e o aplicativo instalado no computador do usuário não conseguirá verificar, baixar e instalar as atualizações automaticamente.

## Exemplo da Configuração Obrigatória
O \package.json\ deve SEMPRE conter a seguinte estrutura no bloco \uild\:

\\\json
"build": {
  ...
  "publish": [
    {
      "provider": "github",
      "owner": "diegodedi",
      "repo": "FilamentoCust_update",
      "releaseType": "release"
    }
  ]
}
\\\

## Ação Requerida do Agente
Sempre que for modificar o \package.json\, certifique-se de que o bloco \publish\ continue existindo e configurado corretamente para o GitHub do repositório.
