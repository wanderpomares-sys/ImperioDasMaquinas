const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
const erros = [];
vc.on('jsdomError', e => erros.push(e.message));
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:vc });

function espera(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  await espera(1200);
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval("THREE.WebGLRenderer = function(){ this.domElement=document.createElement('canvas'); this.setSize=()=>{}; this.render=()=>{}; this.dispose=()=>{}; };");

  console.log('=== GATILHO 1: inicio de sessao ===');
  w.eval("goTo('hub')");
  await espera(1500); // espera o setTimeout interno de 1200ms do jogo + folga
  ok('Overlay aparece na primeira visita ao Hub', d.getElementById('lembreteMissaoOverlay').style.display === 'flex');
  ok('Motivo "inicio" certo', d.getElementById('lembreteMissaoEyebrow').textContent.includes('Bem-vindo'));
  w.eval('fecharLembreteMissao()');

  console.log('\n=== GATILHO 1b: nao repete numa segunda visita ===');
  w.eval("goTo('contratos')"); w.eval("goTo('hub')");
  await espera(1500);
  ok('Overlay NAO reabre sozinho de novo', d.getElementById('lembreteMissaoOverlay').style.display !== 'flex');

  console.log('\n=== GATILHO 2+3: numa campanha de 3 missoes, completar a 2a e tambem a penultima ao mesmo tempo (esperado, nao e bug) ===');
  const totalMissoes = w.eval('campanhaAtual().length');
  console.log('Total de missoes na campanha atual:', totalMissoes);
  w.eval(`campanhaAtual()[0].valor = () => campanhaAtual()[0].meta;`);
  w.eval(`campanhaAtual()[1].valor = () => campanhaAtual()[1].meta;`);
  w.eval('sincronizarMissoes();');
  await espera(700);
  ok('Overlay abre ao completar a 2a de 3 (que tambem e a penultima)', d.getElementById('lembreteMissaoOverlay').style.display === 'flex',
     d.getElementById('lembreteMissaoTitulo').textContent);
  w.eval('fecharLembreteMissao()');

  console.log('\n=== Completar a ULTIMA missao (3a de 3) -- NAO deve disparar lembrete (campanha ja terminou) ===');
  w.eval(`campanhaAtual()[2].valor = () => campanhaAtual()[2].meta;`);
  w.eval('sincronizarMissoes();');
  await espera(700);
  ok('Overlay NAO abre ao terminar a campanha inteira (nada mais pra lembrar)', d.getElementById('lembreteMissaoOverlay').style.display !== 'flex');

  console.log('\nErros JSDOM:', erros.length ? erros.join(' | ') : '(nenhum)');
  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
})();
