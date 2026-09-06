const http = require('http');
const fs = require('fs');
const path = require('path');

// Simula um host tipo GitHub Pages: cache agressivo por padrão (max-age=600), igual
// muita hospedagem estática manda por padrão. O objetivo do teste é provar que a correção
// do service worker (fetch com {cache:'no-store'}) ignora isso e ainda assim pega a versão
// nova, sem precisar de ninguém limpar cache manualmente.
let pastaAtual = process.argv[2] || '/home/claude/servidor-teste';

const server = http.createServer((req, res) => {
  if(req.url === '/__trocar-versao__'){
    pastaAtual = pastaAtual.includes('servidor-teste-v2') ? '/home/claude/servidor-teste' : '/home/claude/servidor-teste-v2';
    res.writeHead(200);
    res.end('trocado para: ' + pastaAtual);
    console.log('[servidor] trocou para pasta:', pastaAtual);
    return;
  }
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(pastaAtual, urlPath);
  fs.readFile(filePath, (err, data) => {
    if(err){ res.writeHead(404); res.end('nao encontrado: ' + filePath); return; }
    const ext = path.extname(filePath);
    const tipos = { '.html':'text/html', '.js':'application/javascript', '.json':'application/json', '.png':'image/png' };
    res.writeHead(200, {
      'Content-Type': tipos[ext] || 'application/octet-stream',
      'Cache-Control': 'max-age=600' // cache agressivo de propósito, pra testar se a correcao ignora isso
    });
    res.end(data);
  });
});

const PORTA = 8934;
server.listen(PORTA, () => console.log('[servidor] rodando na porta ' + PORTA + ', servindo:', pastaAtual));
