const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const r = w.eval(`
    (function(){
      const N = 5000, prazoDias = 10;
      let noPrazo = 0, diasSoma = 0;
      for(let i=0;i<N;i++){
        let progress = 0, dias = 0;
        while(progress < 100 && dias < 40){
          progress += (100/prazoDias) * (0.98 + Math.random()*0.08); // formula EXATA que esta no arquivo agora
          dias++;
        }
        diasSoma += dias;
        if(dias <= prazoDias) noPrazo++;
      }
      return JSON.stringify({ mediaMultiplicador: 1.02, mediaDiasReal: (diasSoma/N).toFixed(2), pctNoPrazoMatematicaPura: (noPrazo/N*100).toFixed(1) });
    })()
  `);
  console.log('Formula do arquivo (0.98 a 1.06):', r);
}, 1500);
