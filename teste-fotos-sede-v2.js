const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval("goTo('sedes')");
  const heroBg = d.getElementById('sedeHero').style.backgroundImage;
  ok('Hero usa imagem embutida (data:image)', heroBg.includes('data:image/jpeg;base64'));
  const listaHtml = d.getElementById('sedesLista').innerHTML;
  ok('Lista com 5 imagens embutidas', (listaHtml.match(/data:image\/jpeg;base64/g)||[]).length === 5);
  ok('Capacidades atualizadas aparecem (5,8,12,18,30)', 
     ['5 maquina','8 maquina','12 maquina','18 maquina','30 maquina'].every(t => listaHtml.includes(t)));
  ok('Nenhuma referencia externa (unsplash/arquivo) sobrou', !listaHtml.includes('unsplash') && !listaHtml.includes('foto-sede-nivel'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
