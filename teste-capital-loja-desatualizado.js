const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
const erros = [];
vc.on('jsdomError', e => erros.push(e.message));
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:vc });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Reproduz o cenario exato: caixa muda SEM passar por updateFinanceDisplays, depois navega pra Loja ===');
  w.eval("goTo('loja')"); // visita uma vez com 60000 (inicial), fixando o '.js-cash' nesse valor
  const capitalInicial = d.querySelector('.js-cash').textContent;
  console.log('Capital mostrado na primeira visita:', capitalInicial);

  // Simula uma mudanca de caixa que NAO passa por updateFinanceDisplays -- exatamente o que
  // aconteceria se o jogador tivesse saido da Loja, o caixa mudasse em outro lugar, e voltasse
  w.eval('playerCash = 199353;'); // muda o caixa direto, sem chamar updateFinanceDisplays
  w.eval("goTo('hub')"); // navega pra outro lugar primeiro
  w.eval("goTo('loja')"); // volta pra loja -- o Capital TEM que refletir 199353 agora

  const capitalDepois = d.querySelector('.js-cash').textContent;
  console.log('Capital mostrado ao voltar pra Loja, apos caixa mudar:', capitalDepois);
  ok('Capital da Loja reflete o caixa real (nao ficou preso no valor antigo)',
     capitalDepois.includes('199.353') || capitalDepois.includes('199353'), capitalDepois);

  console.log('\n=== Confirma que o calculo de compra bate com o que a tela mostra ===');
  const key = w.eval('Object.keys(CATALOG)[0]');
  w.eval(`currentLojaKey = '${key}'; currentLojaMode = 'vista'; renderLojaDetail();`);
  const remaining = w.eval('remaining');
  console.log('Capital exibido:', capitalDepois, '| Caixa apos compra calculado:', w.eval('fmt(playerCash - CATALOG[currentLojaKey].vista)'));

  console.log('\nErros JSDOM:', erros.length ? erros.join(' | ') : '(nenhum)');
  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
