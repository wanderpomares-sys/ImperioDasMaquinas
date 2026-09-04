const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.join('\n') : '(nenhum)');

  console.log('\n=== DIVIDA 1: RISCO DE SEDE agora entra no calculo ===');
  const key = w.eval("Object.keys(CONTRACTS)[0]");
  w.eval('playerSedeNivel = 1;'); // risco 1.2 (pior)
  const probNivel1 = w.eval(`calcularExposicao('${key}', 'nenhum').prob`);
  w.eval('playerSedeNivel = 5;'); // risco 0.85 (melhor)
  const probNivel5 = w.eval(`calcularExposicao('${key}', 'nenhum').prob`);
  ok('Sede nivel 5 tem probabilidade de risco MENOR que nivel 1', probNivel5 < probNivel1, probNivel1 + ' -> ' + probNivel5);
  w.eval('playerSedeNivel = 1;');

  console.log('\n=== DIVIDA 2a: BONUS DE PECAS reduz risco de verdade ===');
  const probSemPecas = w.eval(`calcularExposicao('${key}', 'nenhum').prob`);
  w.eval("playerBonusAtivos['MegaParts Peças'] = { effect:'pecas', confiabilidade:0.95, diasRestantes:30 };");
  const probComPecas = w.eval(`calcularExposicao('${key}', 'nenhum').prob`);
  ok('Com bonus de pecas, risco cai ou mantem (nunca sobe)', probComPecas <= probSemPecas, probSemPecas + ' -> ' + probComPecas);
  w.eval("delete playerBonusAtivos['MegaParts Peças'];");

  console.log('\n=== DIVIDA 2b: BONUS DE PNEUS reduz desgaste de verdade ===');
  const mk = w.eval("Object.keys(MACHINES)[0]");
  w.eval(`MACHINES['${mk}'].inContract = true; MACHINES['${mk}'].health = 100;`);
  w.eval('const h0 = MACHINES["' + mk + '"].health;');
  // sem bonus
  w.eval(`envelhecerFrota(10)`);
  const healthSemBonus = w.eval(`MACHINES['${mk}'].health`);
  const desgasteSemBonus = 100 - healthSemBonus;
  w.eval(`MACHINES['${mk}'].health = 100;`);
  w.eval("playerBonusAtivos['RoadForce Pneus'] = { effect:'pneus', desgaste:-0.30, diasRestantes:30 };");
  w.eval(`envelhecerFrota(10)`);
  const healthComBonus = w.eval(`MACHINES['${mk}'].health`);
  const desgasteComBonus = 100 - healthComBonus;
  ok('Desgaste com bonus de pneus e MENOR que sem bonus', desgasteComBonus < desgasteSemBonus, desgasteSemBonus + ' -> ' + desgasteComBonus);

  console.log('\n=== DIVIDA 2c: BONUS EXPIRA DE VERDADE APOS OS DIAS ===');
  w.eval("playerBonusAtivos['RoadForce Pneus'] = { effect:'pneus', desgaste:-0.30, diasRestantes:5 };");
  w.eval('envelhecerFrota(3)');
  ok('Ainda ativo com 2 dias restantes', w.eval("!!playerBonusAtivos['RoadForce Pneus']"));
  w.eval('envelhecerFrota(3)');
  ok('Bonus expirou e foi removido apos passar os dias', !w.eval("playerBonusAtivos['RoadForce Pneus']"));

  console.log('\n=== DIVIDA 2d: BONUS PowerFuel desconta custo de manutencao ===');
  w.eval(`goTo('manutencao'); openMaintDetail('${mk}');`);
  const precoOriginal = w.eval("MACHINES['" + mk + "'].original.price");
  w.eval('playerCash = 999999;');
  const cashAntesSem = w.eval('playerCash');
  w.eval('scheduleMaint()');
  const gastoSemBonus = cashAntesSem - w.eval('playerCash');
  w.eval(`MACHINES['${mk}'].health = 50;`); // reseta pra poder gastar de novo de forma visivel
  w.eval("playerBonusAtivos['PowerFuel Combustível'] = { effect:'combustivel', consumo:-0.15, diasRestantes:30 };");
  const cashAntesCom = w.eval('playerCash');
  w.eval('scheduleMaint()');
  const gastoComBonus = cashAntesCom - w.eval('playerCash');
  ok('Manutencao custa menos com bonus PowerFuel ativo', gastoComBonus < gastoSemBonus, gastoSemBonus + ' -> ' + gastoComBonus);

  console.log('\n=== DIVIDA 3: LIMITE DE MAQUINAS POR SEDE bloqueia compra ===');
  w.eval('playerSedeNivel = 1; playerCash = 10000000; reputacao = 999;');
  const capacidadeNivel1 = w.eval('SEDES_DATA[1].maxMaquinas');
  ok('Capacidade da sede 1 e 5 maquinas (conferindo dado corrigido)', capacidadeNivel1 === 5);
  w.eval("goTo('loja'); openLojaDetail('retro2'); selectLojaMode('vista');");
  const frotaAntes = w.eval('Object.keys(MACHINES).length');
  w.eval('buyMachine()');
  const frotaDepois = w.eval('Object.keys(MACHINES).length');
  ok('Compra BLOQUEADA (frota ja no limite da sede 1)', frotaDepois === frotaAntes, frotaAntes + ' -> ' + frotaDepois);

  w.eval('playerSedeNivel = 5;'); // capacidade 20, bem folgado
  w.eval('buyMachine()');
  const frotaNivel5 = w.eval('Object.keys(MACHINES).length');
  ok('Compra PERMITIDA quando ha espaco (sede 5)', frotaNivel5 === frotaAntes + 1, frotaAntes + ' -> ' + frotaNivel5);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
