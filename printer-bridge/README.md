# Printer Bridge - Filamento Cust

## O que é o Printer Bridge?
O Printer Bridge é um serviço local que permite que a aplicação web **Filamento Cust** se comunique com a sua impressora 3D (como a Creality Hi) que está na sua rede local (LAN). 

## Por que ele é necessário?
Por motivos de segurança, navegadores bloqueiam páginas web hospedadas na internet de acessar diretamente endereços IPs privados na sua rede local (ex: `192.168.1.105`). O Printer Bridge atua como um "mensageiro" seguro: ele roda no seu computador, recebe as solicitações da página web e as repassa para a impressora.

## Como instalar e iniciar (Windows)
1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Dê um duplo clique no arquivo `start-bridge.bat` nesta pasta.
3. Ele abrirá uma tela preta do terminal, instalará as dependências na primeira vez e iniciará o servidor.
4. Você verá a mensagem: `[Bridge] Servidor iniciado. Escutando na porta 3001.`

## Como parar
Para parar o serviço, basta fechar a janela do terminal (CMD) que foi aberta pelo `start-bridge.bat`.

## Como verificar se está funcionando
Abra o seu navegador e acesse: `http://localhost:3001/health`
Você deve ver a mensagem: `{"status":"ok","service":"filamento-cust-printer-bridge"}`

## Configurando no Aplicativo Web
1. Abra o aplicativo Filamento Cust.
2. Acesse a aba **Produção**. O aplicativo deverá mostrar "Bridge ONLINE" em verde no topo.
3. Clique em **Adicionar Impressora**.
4. Insira o IP da sua Creality Hi (ex: `192.168.1.105`) e clique em **Testar Conexão**. O aplicativo usará este Bridge para testar e monitorar sua impressora!
