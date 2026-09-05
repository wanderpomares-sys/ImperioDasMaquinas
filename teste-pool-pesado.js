const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  // Regenera os 5 slots MUITAS vezes (simula muitas horas de jogo) e mede a taxa media de slots usaveis
  const r = w.eval(`
    (function(){
      let somaUsaveis = 0, rodadas = 300;
      const keys = Object.keys(CONTRACTS);
      for(let i=0;i<rodadas;i++){
        keys.forEach(k => regenerarContrato(k));
        somaUsaveis += keys.filter(k => CONTRACTS[k].hasMachine).length;
      }
      return JSON.stringify({ mediaUsaveisDe5: (somaUsaveis/rodadas).toFixed(2) });
    })()
  `);
  const d = JSON.parse(r);
  console.log('Media de slots usaveis (de 5), antes era ~3.1 (62%%):', d.mediaUsaveisDe5);
  ok('Media de slots usaveis subiu para pelo menos 4 de 5 (80%+)', parseFloat(d.mediaUsaveisDe5) >= 4.0, d.mediaUsaveisDe5);
  ok('Mas nao virou 5 de 5 sempre (aspiracao de comprar maquina nova continua existindo)', parseFloat(d.mediaUsaveisDe5) < 4.95, d.mediaUsaveisDe5);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
