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

  console.log('\n=== Render da tela de Sedes (nivel 1, alvo = nivel 2) ===');
  w.eval("goTo('sedes')");
  const listaHtml = d.getElementById('sedesLista').innerHTML;
  ok('Miniaturas tem onclick de zoom para os 5 niveis', [1,2,3,4,5].every(i => listaHtml.includes(`abrirZoomSede(${i})`)));
  ok('Miniatura da proxima sede (nivel 2) tem classe de brilho', listaHtml.includes('sede-thumb-alvo'));
  ok('Etiqueta "Seu próximo objetivo" aparece na lista', listaHtml.includes('Seu pr\u00f3ximo objetivo'));
  const hero = d.getElementById('sedeHero');
  ok('Hero tem classe clicavel', hero.classList.contains('sede-hero-click'));
  ok('Legenda do hero menciona toque pra ampliar', d.getElementById('sedeSubtitle').textContent.includes('ampliar'));

  console.log('\n=== Clicar na miniatura da PROXIMA sede (nivel 2) abre o zoom certo ===');
  w.eval('abrirZoomSede(2)');
  ok('Overlay de zoom abriu', d.getElementById('sedeZoomOverlay').style.display === 'flex');
  ok('Imagem do zoom e a foto da sede 2', d.getElementById('sedeZoomImg').src.includes('data:image/jpeg;base64') );
  ok('Legenda mostra o nome certo', d.getElementById('sedeZoomCaption').textContent === 'Garagem com Oficina');
  ok('Badge mostra "Seu próximo objetivo"', d.getElementById('sedeZoomBadge').innerHTML.includes('pr\u00f3ximo objetivo'));

  console.log('\n=== Fechar o zoom ===');
  w.eval('fecharZoomSede()');
  ok('Overlay fechou', d.getElementById('sedeZoomOverlay').style.display === 'none');

  console.log('\n=== Clicar no HERO (sede atual, nivel 1) abre zoom com badge "atual" ===');
  w.eval('abrirZoomSede(1)');
  ok('Legenda mostra sede 1', d.getElementById('sedeZoomCaption').textContent === 'O Barra\u00e7o');
  ok('Badge mostra "sede atual"', d.getElementById('sedeZoomBadge').innerHTML.includes('atual'));

  console.log('\n=== Clicar numa sede TRANCADA (nivel 4) nao mostra nenhum badge ===');
  w.eval('fecharZoomSede(); abrirZoomSede(4)');
  ok('Badge some (sede trancada, nem atual nem proxima)', d.getElementById('sedeZoomBadge').style.display === 'none');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
