const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const candidatos = [
    { nome:'so estreita, sem folga [0.94,1.06]', min:0.94, spread:0.12 },
    { nome:'estreita + folga leve [0.97,1.09]', min:0.97, spread:0.12 },
    { nome:'estreita + folga media [1.00,1.12]', min:1.00, spread:0.12 },
    { nome:'estreita + folga forte [1.02,1.14]', min:1.02, spread:0.12 },
  ];
  candidatos.forEach(cand => {
    const r = w.eval(`
      (function(){
        const N = 3000, prazoDias = 10;
        let noPrazo = 0, diasSoma = 0;
        for(let i=0;i<N;i++){
          let progress = 0, dias = 0;
          while(progress < 100 && dias < 40){
            progress += (100/prazoDias) * (${cand.min} + Math.random()*${cand.spread});
            dias++;
          }
          diasSoma += dias;
          if(dias <= prazoDias) noPrazo++;
        }
        return JSON.stringify({ mediaMultiplicador: (${cand.min}+${cand.spread}/2).toFixed(3), pctNoPrazo: (noPrazo/N*100).toFixed(1) });
      })()
    `);
    console.log(cand.nome + ' -> ' + r);
  });
}, 1500);
