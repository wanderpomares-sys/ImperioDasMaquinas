const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const vc = new VirtualConsole();
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Render UNICO da tela de Sedes (o que o jogador ve) ===');
  const t0 = Date.now();
  w.eval("goTo('sedes')");
  console.log('renderizou em ' + (Date.now()-t0) + 'ms');
  const heroBg = d.getElementById('sedeHero').style.backgroundImage;
  ok('Hero usa imagem embutida (data:image)', heroBg.includes('data:image/jpeg;base64'));
  const listaHtml = d.getElementById('sedesLista').innerHTML;
  ok('Lista mostra os 5 niveis com imagem embutida', (listaHtml.match(/data:image\/jpeg;base64/g) || []).length === 5);

  console.log('\n=== Render UNICO do overlay de video (Ver obra) ===');
  w.eval('playerCash=5000000; reputacao=150;');
  w.eval("acceptedContracts.push({ key: Object.keys(CONTRACTS)[0], name: 'Extração de Cascalho', value: 1000, machineKeys: [] })");
  const t1 = Date.now();
  w.eval("abrirObra(acceptedContracts.length - 1)");
  console.log('renderizou em ' + (Date.now()-t1) + 'ms');
  const wrap = d.getElementById('obraVideoWrap').innerHTML;
  ok('Video embutido carregado no overlay', wrap.includes('data:video/mp4;base64'));
  ok('Atributos corretos', wrap.includes('autoplay') && wrap.includes('muted') && wrap.includes('loop') && wrap.includes('playsinline'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
