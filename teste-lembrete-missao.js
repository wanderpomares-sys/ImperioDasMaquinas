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

  // jsdom nao tem WebGL de verdade -- bloqueia so a parte 3D, sem quebrar o resto da logica
  w.eval("typeof THREE !== 'undefined' ? (THREE.WebGLRenderer = function(){ this.domElement=document.createElement('canvas'); this.setSize=()=>{}; this.render=()=>{}; this.dispose=()=>{}; }) : null;");

  console.log('=== GATILHO 1: inicio de sessao (primeira vez no Hub) ===');
  w.eval("goTo('hub')");
  w.waitForTimeoutHack = true;
}, 1200);

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  ok('Overlay de lembrete aparece na primeira visita ao Hub', d.getElementById('lembreteMissaoOverlay').style.display === 'flex');
  ok('Mostra o motivo "inicio" certo', d.getElementById('lembreteMissaoEyebrow').textContent.includes('Bem-vindo'));
  w.eval('fecharLembreteMissao()');

  console.log('\n=== GATILHO 1b: NAO deve repetir numa segunda visita ao Hub na mesma sessao ===');
  w.eval("goTo('contratos')");
  w.eval("goTo('hub')");
  setTimeout(() => {
    ok('Overlay NAO reabre sozinho na segunda visita', d.getElementById('lembreteMissaoOverlay').style.display !== 'flex');

    console.log('\n=== GATILHO 2: a cada 2 missoes concluidas ===');
    w.eval(`
      const campanha = campanhaAtual();
      // forca as 2 primeiras missoes da campanha pra "concluida" diretamente, simulando progresso real
      campanha[0].valor = () => campanha[0].meta;
      campanha[1].valor = () => campanha[1].meta;
    `);
    w.eval('sincronizarMissoes();');
    setTimeout(() => {
      ok('Overlay abre ao completar a 2a missao', d.getElementById('lembreteMissaoOverlay').style.display === 'flex',
         d.getElementById('lembreteMissaoTitulo').textContent);
      w.eval('fecharLembreteMissao()');

      console.log('\n=== GATILHO 3: penultima missao (so falta 1) ===');
      const totalMissoes = w.eval('campanhaAtual().length');
      console.log('Total de missoes na campanha atual:', totalMissoes);
      if (totalMissoes >= 3) {
        w.eval(`campanhaAtual()[2].valor = () => campanhaAtual()[2].meta;`);
        w.eval('sincronizarMissoes();');
        setTimeout(() => {
          ok('Overlay abre ao completar a penultima (so falta 1)', d.getElementById('lembreteMissaoOverlay').style.display === 'flex',
             d.getElementById('lembreteMissaoTitulo').textContent);
          console.log('\nErros JSDOM:', erros.length ? erros.join(' | ') : '(nenhum)');
          console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
        }, 700);
      } else {
        console.log('Campanha atual tem menos de 3 missoes, pulando esse teste especifico');
        console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
      }
    }, 700);
  }, 300);
}, 1800);
