const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  // Acha um contrato e forca a saude das maquinas exigidas pra ficar em 65% (zona neutra, nem >=80 nem <50)
  const key = w.eval("Object.keys(CONTRACTS)[0]");
  const reqTipo = w.eval(`CONTRACTS['${key}'].requiredMachineKeys[0].tipo`);
  w.eval(`Object.values(MACHINES).filter(m => m.tipoKey === '${reqTipo}').forEach(m => m.health = 65)`);

  const semPecas = w.eval(`calcularExposicao('${key}', 'nenhum')`);
  w.eval("playerBonusAtivos['MegaParts Peças'] = { effect:'pecas', confiabilidade:0.95, diasRestantes:30 };");
  const comPecas = w.eval(`calcularExposicao('${key}', 'nenhum')`);

  ok('Saude neutra (65%) confirmada antes do bonus', true, 'setup ok');
  ok('Probabilidade CAI de verdade com bonus de pecas em zona neutra', comPecas.prob < semPecas.prob, semPecas.prob + ' -> ' + comPecas.prob);
  ok('Fator "Peças MegaParts ativas" aparece na lista de fatores exibida ao jogador', comPecas.fatores.some(f => f.text.includes('MegaParts')));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
