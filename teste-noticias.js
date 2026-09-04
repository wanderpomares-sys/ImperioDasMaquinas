const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Gatilho 2 e 3, ISOLADO: comprar sede 2 sem satisfazer a campanha seguinte ===');
  // Valores calibrados: exatamente o suficiente pra sede 2, propositalmente ABAIXO dos requisitos da sede 3
  w.eval('playerCash=200000; reputacao=105; stats.contratosNoPrazo=3; faturamentoAcumulado=150000;');
  w.eval('maquinasComManutencaoRealizada.add("a"); maquinasComManutencaoRealizada.add("b"); sincronizarMissoes();');
  const antesCompra = w.eval('noticias.length');
  w.eval('comprarSede()');
  const depoisCompra = w.eval('noticias.length');
  ok('Exatamente 2 noticias novas (sede + campanha), sem spillover pra campanha seguinte',
     depoisCompra === antesCompra + 2, antesCompra + ' -> ' + depoisCompra);
  ok('Sede subiu para nivel 2', w.eval('playerSedeNivel') === 2);
  ok('Nenhuma missao da campanha 2 foi completada de brinde', w.eval('campanhaAtual().every(m => !m.concluida)'));

  console.log('\n=== Gatilho 4, ISOLADO: completar 1 missao real da campanha 2 (rumo a sede 3) ===');
  const antesM = w.eval('noticias.length');
  w.eval('contratosTier3Completos = 1; sincronizarMissoes();'); // completa so a missao "Encara o risco" (meta=1)
  const depoisM = w.eval('noticias.length');
  ok('Exatamente 1 noticia nova de missao concluida', depoisM === antesM + 1, antesM + ' -> ' + depoisM);
  ok('Titulo e detalhe corretos', w.eval("noticias[0].titulo === 'Missão concluída!' && noticias[0].detalhe.includes('risco')"));

  console.log('\n=== Nao duplica ao chamar de novo ===');
  w.eval('sincronizarMissoes(); sincronizarMissoes();');
  ok('Nenhuma noticia nova (ja notificada)', w.eval('noticias.length') === depoisM);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
