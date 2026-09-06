const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  const mk = Object.keys(w.eval('MACHINES'))[0];

  w.eval(`MACHINES['${mk}'].health = 60; MACHINES['${mk}'].quebrada = false;`);
  w.eval(`goTo('manutencao'); openMaintDetail('${mk}');`);
  ok('Saude OK (60%) NAO mostra alerta de enferrujada', !d.getElementById('manutDetailScroll').innerHTML.includes('evento_maquina_enferrujada') && !d.getElementById('manutDetailScroll').innerHTML.includes('Saúde crítica'));

  w.eval(`MACHINES['${mk}'].health = 15;`);
  w.eval(`openMaintDetail('${mk}');`);
  const html1 = d.getElementById('manutDetailScroll').innerHTML;
  ok('Saude critica (15%) mostra a foto da maquina enferrujada', html1.includes('base64'));
  ok('Mostra o aviso de saude critica', html1.includes('Saúde crítica'));

  w.eval(`MACHINES['${mk}'].quebrada = true;`);
  w.eval(`openMaintDetail('${mk}');`);
  const html2 = d.getElementById('manutDetailScroll').innerHTML;
  ok('Maquina QUEBRADA mostra o bloco de reparo, nao o de enferrujada (nao duplica aviso)', html2.includes('REPARO DE EMERGÊNCIA') && !html2.includes('Saúde crítica'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
