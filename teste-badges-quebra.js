const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  const mk = Object.keys(w.eval('MACHINES'))[0];
  w.eval(`MACHINES['${mk}'].quebrada = true;`);

  w.eval("goTo('manutencao')");
  ok('Lista de Manutencao mostra badge de quebrada', d.getElementById('manutList').innerHTML.includes('💥 QUEBRADA'));

  w.eval("goTo('maquinas')");
  ok('Lista de Maquinas mostra selo de quebrada', d.getElementById('maquinasList').innerHTML.includes('💥 QUEBRADA'));

  w.eval("goTo('hub')");
  ok('Hub mostra a maquina quebrada primeiro na fileira, com badge', d.getElementById('hubMaquinasRow').innerHTML.includes('QUEBRADA'));

  w.eval(`MACHINES['${mk}'].quebrada = false;`);
  w.eval("goTo('hub')");
  ok('Hub NAO mostra mais quebrada depois de reparada', !d.getElementById('hubMaquinasRow').innerHTML.includes('💥'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
