const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== As 5 fotos do catalogo sao distintas e novas ===');
  const fotos = w.eval("Object.values(CATALOG).map(c => c.photo)");
  const idsEsperados = ['36957845','34100275','33068417','14475776','34226756'];
  idsEsperados.forEach((id, i) => ok('Foto ' + (i+1) + ' contem o ID ' + id, fotos.some(f => f.includes(id))));
  ok('Nenhuma foto repetida entre si', new Set(fotos).size === fotos.length);
  ok('Nenhuma reutiliza a foto do Desmatamento/frota (5125782)', !fotos.some(f => f.includes('5125782')));

  console.log('\n=== Renderiza a tela da loja sem quebrar ===');
  let erro = null;
  try { w.eval("goTo('loja')"); } catch(e) { erro = e.message; }
  ok('goTo(loja) funciona', !erro, erro || '');
  const listaHtml = d.getElementById('lojaList').innerHTML;
  idsEsperados.forEach(id => ok('Card da loja mostra foto ' + id, listaHtml.includes(id)));

  console.log('\n=== Tela de detalhe tambem usa a foto nova ===');
  w.eval("openLojaDetail('retro2')");
  const detailHtml = d.getElementById('loja-detail-view').innerHTML;
  ok('Detalhe da retroescavadeira usa a foto nova (34226756)', detailHtml.includes('34226756'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
