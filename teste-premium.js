const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== COMPRA: Escavadeira Black Elite a vista ===');
  w.eval('playerCash = 5000000; reputacao = 150; playerSedeNivel = 3;'); // sede grande o suficiente pra capacidade
  w.eval("currentLojaKey = 'escavadeiraPremium'; currentLojaMode = 'vista'; buyMachine();");
  const chave = w.eval(`Object.keys(MACHINES).find(k => MACHINES[k].name === 'Escavadeira Hidráulica Black Elite')`);
  ok('Maquina Premium foi criada', !!chave, chave);
  ok('Flag premium = true', w.eval(`MACHINES['${chave}'].premium`) === true);
  ok('bonusProdutividade = 0.12', w.eval(`MACHINES['${chave}'].bonusProdutividade`) === 0.12);
  ok('reducaoChanceQuebra = 0.4', w.eval(`MACHINES['${chave}'].reducaoChanceQuebra`) === 0.4);

  console.log('\n=== BONUS DE PRODUTIVIDADE: contrato so com essa maquina rende mais que o normal ===');
  const fatorComPremium = w.eval(`calcularFatorProdutividade({ machineKeys:['${chave}'] }, { requiredMachineKeys:[{tipo:'escavadeira',qtd:1}] })`);
  console.log('Fator com Premium (saude 100%, sozinha, 1 exigida):', fatorComPremium);
  ok('Fator reflete o bonus de +12% sobre o normal (1.0 * 1.12 = 1.12)', Math.abs(fatorComPremium - 1.12) < 0.001, fatorComPremium);

  console.log('\n=== RECOMPENSA: concede a Retro Ouro ao alcancar sede nivel 2 ===');
  w.eval('premiumRecompensaConcedida = {};'); // reset, caso algo tenha marcado antes
  w.eval('playerSedeNivel = 1;'); // ainda nao
  w.eval('concederRecompensaPremium();');
  ok('NAO concede antes da condicao (sede nivel 1)', !Object.values(w.eval('MACHINES')).some(m => m.name && m.name.includes('Edição Fundador')));
  w.eval('playerSedeNivel = 2;'); // agora sim
  w.eval('concederRecompensaPremium();');
  const chaveOuro = w.eval(`Object.keys(MACHINES).find(k => MACHINES[k].name && MACHINES[k].name.includes('Edição Fundador'))`);
  ok('Concede a Retro Ouro ao alcancar sede nivel 2', !!chaveOuro, chaveOuro);
  ok('Marcou como ja concedida', w.eval('premiumRecompensaConcedida.retroOuro') === true);

  console.log('\n=== NAO duplica se chamado de novo ===');
  const totalAntes = w.eval('Object.keys(MACHINES).length');
  w.eval('concederRecompensaPremium();');
  const totalDepois = w.eval('Object.keys(MACHINES).length');
  ok('Nao criou maquina duplicada', totalAntes === totalDepois, `${totalAntes} -> ${totalDepois}`);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
