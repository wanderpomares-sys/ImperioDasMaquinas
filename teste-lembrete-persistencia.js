const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole(), url:'http://localhost/' });
function espera(ms) { return new Promise(r => setTimeout(r, ms)); }
(async () => {
  await espera(1200);
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval("THREE.WebGLRenderer = function(){ this.domElement=document.createElement('canvas'); this.setSize=()=>{}; this.render=()=>{}; this.dispose=()=>{}; };");

  console.log('=== Completa 2 missoes de verdade, deixa notificar, salva ===');
  w.eval("goTo('hub')");
  await espera(1500);
  w.eval('fecharLembreteMissao()');
  w.eval(`
    const c = campanhaAtual();
    c[0].valor = () => c[0].meta;
    c[1].valor = () => c[1].meta;
    sincronizarMissoes();
  `);
  await espera(700);
  ok('Lembrete disparou pra 2 missoes', d.getElementById('lembreteMissaoOverlay').style.display === 'flex');
  w.eval('fecharLembreteMissao()');
  const contagemAntes = w.eval('lembreteMissaoState.ultimaContagemNotificada');
  console.log('ultimaContagemNotificada antes de salvar:', contagemAntes);

  w.eval('salvarGameState()');

  console.log('\n=== Simula reabrir o jogo: zera o rastreamento, recarrega ===');
  w.eval('lembreteMissaoState.ultimaContagemNotificada = 0;');
  w.eval('restaurarGameState()');
  const contagemDepois = w.eval('lembreteMissaoState.ultimaContagemNotificada');
  ok('Contagem notificada sobrevive ao reload', contagemDepois === contagemAntes, `${contagemAntes} -> ${contagemDepois}`);

  console.log('\n=== Roda sincronizarMissoes de novo pos-reload -- NAO deve reabrir o lembrete (ja foi visto) ===');
  w.eval('sincronizarMissoes();');
  await espera(700);
  ok('Lembrete NAO reabre sozinho apos reload (ja tinha sido visto antes de salvar)',
     d.getElementById('lembreteMissaoOverlay').style.display !== 'flex');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
})();
