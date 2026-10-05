const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole(), url:'http://localhost/' });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerSedeNivel = 2; concederRecompensaPremium(); salvarGameState();');
  w.eval('premiumRecompensaConcedida = {};'); // simula reabrir do zero
  w.eval('restaurarGameState();');
  ok('premiumRecompensaConcedida sobrevive ao reload', w.eval('premiumRecompensaConcedida.retroOuro') === true);

  const totalAntes = w.eval('Object.keys(MACHINES).length');
  w.eval('concederRecompensaPremium();'); // nao deveria duplicar apos reload
  const totalDepois = w.eval('Object.keys(MACHINES).length');
  ok('Nao duplica a recompensa apos reload', totalAntes === totalDepois);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
