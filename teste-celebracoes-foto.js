const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== LOJA: imagem de ambientacao aparece no detalhe ===');
  w.eval("goTo('loja')");
  const k = w.eval('Object.keys(CATALOG)[0]');
  w.eval(`openLojaDetail('${k}')`);
  const htmlLoja = d.getElementById('lojaDetailScroll').innerHTML;
  ok('Mostra imagem real de entrega', htmlLoja.includes('base64') && htmlLoja.includes('Entrega de máquina nova'));

  console.log('\n=== SEDE: foto de inauguracao aparece na celebracao ===');
  w.eval('celebrarGrande(1, 2)');
  ok('Overlay de sede mostra a foto de inauguracao', d.getElementById('evolucaoFotoInauguracao').src.includes('base64'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
