const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Sem noticias: sino parado ===');
  w.eval('renderNoticiasBadge()');
  ok('Sino sem classe de balanco', !d.getElementById('sinoIcone').classList.contains('sino-alerta'));

  console.log('\n=== Chega noticia: sino comeca a balancar ===');
  w.eval("registrarNoticia('📋','Novo contrato disponível','teste')");
  ok('Sino ganhou a classe de balanco', d.getElementById('sinoIcone').classList.contains('sino-alerta'));
  ok('Badge mostra 1', d.getElementById('noticiasBadge').textContent === '1');

  console.log('\n=== Abre o diario (marca como lida): sino para de balancar ===');
  w.eval('abrirNoticias()');
  ok('Sino perdeu a classe de balanco', !d.getElementById('sinoIcone').classList.contains('sino-alerta'));
  ok('Badge escondido', d.getElementById('noticiasBadge').style.display === 'none');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
