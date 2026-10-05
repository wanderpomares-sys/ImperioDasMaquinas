const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Compra Trator Premium e Caminhao Premium ===');
  w.eval('playerCash = 5000000; reputacao = 150; playerSedeNivel = 3;');
  w.eval("currentLojaKey = 'tratorPremium'; currentLojaMode = 'vista'; buyMachine();");
  w.eval("currentLojaKey = 'caminhaoPremium'; currentLojaMode = 'vista'; buyMachine();");
  const trator = w.eval(`Object.keys(MACHINES).find(k => MACHINES[k].name === 'Trator de Esteira D6T Black Elite')`);
  const caminhao = w.eval(`Object.keys(MACHINES).find(k => MACHINES[k].name === 'Caminhão Basculante Ford Cargo Black Elite')`);
  ok('Trator Premium criado com flag premium', !!trator && w.eval(`MACHINES['${trator}'].premium`) === true, trator);
  ok('Caminhao Premium criado com flag premium', !!caminhao && w.eval(`MACHINES['${caminhao}'].premium`) === true, caminhao);
  ok('Precos corretos (trator 340k*1.7=578k, caminhao 190k*1.7=323k)',
     w.eval('CATALOG.tratorPremium.vista') === 578000 && w.eval('CATALOG.caminhaoPremium.vista') === 323000,
     `${w.eval('CATALOG.tratorPremium.vista')} / ${w.eval('CATALOG.caminhaoPremium.vista')}`);

  console.log('\n=== Recompensa escalonada: nivel 2 da so retro, nivel 3 da tambem a pa ===');
  w.eval('premiumRecompensaConcedida = {};');
  w.eval('playerSedeNivel = 2; concederRecompensaPremium();');
  ok('Nivel 2: ganhou retro ouro', w.eval('premiumRecompensaConcedida.retroOuro') === true);
  ok('Nivel 2: NAO ganhou pa ouro ainda', !w.eval('premiumRecompensaConcedida.paOuro'));
  w.eval('playerSedeNivel = 3; concederRecompensaPremium();');
  ok('Nivel 3: agora ganhou a pa ouro tambem', w.eval('premiumRecompensaConcedida.paOuro') === true);
  const paOuroChave = w.eval(`Object.keys(MACHINES).find(k => MACHINES[k].name && MACHINES[k].name.includes('WA200 Ouro'))`);
  ok('Pa Ouro foi criada de verdade na frota', !!paOuroChave, paOuroChave);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
