const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  const r = w.eval(`
    (function(){
      const ac = { machineKeys: ['a','b'] };
      const catalog = { requiredMachineKeys: [{tipo:'x', qtd:2}] };
      MACHINES['a'] = { health: 90, quebrada: false };
      MACHINES['b'] = { health: 90, quebrada: false };
      const semQuebra = calcularFatorProdutividade(ac, catalog);
      MACHINES['b'].quebrada = true;
      const comQuebra = calcularFatorProdutividade(ac, catalog);
      return JSON.stringify({ semQuebra, comQuebra });
    })()
  `);
  const d2 = JSON.parse(r);
  console.log(d2);
  ok('Fator SEM quebra e alto (2 de 2 maquinas saudaveis)', d2.semQuebra > 0.8, d2.semQuebra);
  ok('Fator COM quebra cai forte (so 1 de 2 conta, e piso de 0.15 aplica)', d2.comQuebra < d2.semQuebra * 0.6, d2.comQuebra);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
