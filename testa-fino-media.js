const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const medias = [1.000, 1.005, 1.010, 1.012, 1.015, 1.018, 1.020, 1.025];
  medias.forEach(media => {
    const min = media - 0.06; // spread fixo de 0.12, mais estreito que o original 0.30
    const r = w.eval(`
      (function(){
        const N = 4000, prazoDias = 10;
        let noPrazo = 0;
        for(let i=0;i<N;i++){
          let progress = 0, dias = 0;
          while(progress < 100 && dias < 40){
            progress += (100/prazoDias) * (${min} + Math.random()*0.12);
            dias++;
          }
          if(dias <= prazoDias) noPrazo++;
        }
        return (noPrazo/N*100).toFixed(1);
      })()
    `);
    console.log('media=' + media.toFixed(3) + ' [min=' + min.toFixed(3) + ', spread=0.12] -> ' + r + '% no prazo');
  });
}, 1500);
