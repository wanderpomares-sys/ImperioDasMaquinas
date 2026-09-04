const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  console.log('Frota inicial (1 de cada tipo):', w.eval('JSON.stringify(Object.values(MACHINES).map(m=>m.tipoKey))'));
  const analise = w.eval(`
    (function(){
      const frota = {};
      Object.values(MACHINES).forEach(m => { frota[m.tipoKey] = (frota[m.tipoKey]||0) + 1; });
      const impossiveis = [];
      const tiposNaoPossuidos = [];
      CONTRACT_POOL.forEach(arq => {
        (arq.req||[]).forEach(r => {
          if(!frota[r.tipo]){
            tiposNaoPossuidos.push({ contrato: arq.nome, tipo: r.tipo, qtdPedida: r.qtd });
          } else if(r.qtd > frota[r.tipo]){
            impossiveis.push({ contrato: arq.nome, tipo: r.tipo, qtdPedida: r.qtd, qtdPossuida: frota[r.tipo] });
          }
        });
      });
      return JSON.stringify({ totalArquetipos: CONTRACT_POOL.length, tiposNaoPossuidos, impossiveisPorQtd: impossiveis }, null, 1);
    })()
  `);
  console.log(analise);
}, 1500);
