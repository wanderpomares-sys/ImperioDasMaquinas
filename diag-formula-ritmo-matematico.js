const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  // Simula so o acumulo de progresso (sem risco, sem desgaste) pra isolar o efeito puro da aleatoriedade
  const dist = w.eval(`
    (function(){
      const N = 2000;
      let diasParaConcluir = [];
      for(let i=0;i<N;i++){
        let progress = 0, dias = 0;
        const prazoDias = 10;
        while(progress < 100 && dias < 40){
          progress += (100/prazoDias) * (0.85 + Math.random()*0.30); // fatorProdutividade=1 (ideal)
          dias++;
        }
        diasParaConcluir.push(dias);
      }
      const media = diasParaConcluir.reduce((a,b)=>a+b,0)/N;
      const noPrazo = diasParaConcluir.filter(d => d <= 10).length;
      return JSON.stringify({ prazoDias:10, mediaDiasReal: media, pctNoPrazo: (noPrazo/N*100).toFixed(1) });
    })()
  `);
  console.log(dist);
}, 1500);
