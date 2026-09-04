const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const candidatos = [
    { nome:'atual [0.85,1.15]', min:0.85, spread:0.30 },
    { nome:'[0.90,1.10]', min:0.90, spread:0.20 },
    { nome:'[0.92,1.08]', min:0.92, spread:0.16 },
    { nome:'[0.94,1.06]', min:0.94, spread:0.12 },
    { nome:'[0.96,1.04]', min:0.96, spread:0.08 },
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
        return JSON.stringify({ mediaDias: (diasSoma/N).toFixed(2), pctNoPrazo: (noPrazo/N*100).toFixed(1) });
      })()
    `);
    console.log(cand.nome + ' -> ' + r);
  });
}, 1500);
