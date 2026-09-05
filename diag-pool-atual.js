const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const r = w.eval(`
    (function(){
      const frota = {};
      Object.values(MACHINES).forEach(m => { frota[m.tipoKey] = (frota[m.tipoKey]||0) + 1; });
      let comMaquina = 0, semMaquina = 0;
      CONTRACT_POOL.forEach(arq => {
        const ok = (arq.req||[]).every(r => frota[r.tipo] && frota[r.tipo] >= r.qtd);
        if(ok) comMaquina++; else semMaquina++;
      });
      return JSON.stringify({ total: CONTRACT_POOL.length, comMaquina, semMaquina, pctSemMaquina: (semMaquina/CONTRACT_POOL.length*100).toFixed(1), frota });
    })()
  `);
  console.log(r);

  // Simula os 5 slots atuais e conta quantos sao aceitaveis
  const slots = w.eval(`JSON.stringify(Object.keys(CONTRACTS).map(k => ({nome:CONTRACTS[k].name, hasMachine:CONTRACTS[k].hasMachine})))`);
  console.log('\nSlots atuais:', slots);
}, 1500);
