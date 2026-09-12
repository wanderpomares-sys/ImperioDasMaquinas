const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole(), url:'http://localhost/', storageQuota: 10000000 });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Contrai emprestimo, salva, "reabre" o jogo do zero, carrega ===');
  w.eval('reputacao = 150; playerCash = 1000; playerPatrimonio=500000; faturamentoAcumulado=500000; emprestimosAtivos=[]; financiamentosAtivos=[];');
  w.eval('contrairEmprestimo(30000)');
  const parcelasAntes = w.eval('emprestimosAtivos[0].parcelasRestantes');

  w.eval('salvarGameState()'); // supondo que essa e a funcao de salvar -- confirmado abaixo se existir

  // simula reabrir: zera as variaveis como se fosse um load do zero
  w.eval('emprestimosAtivos = []; jogoEmFalencia = "nao-deveria-existir";');
  const carregou = w.eval('restaurarGameState()');
  ok('restaurarGameState() rodou sem erro', carregou === true, 'retornou ' + carregou);
  ok('Emprestimo sobreviveu ao save/load', w.eval('emprestimosAtivos.length') === 1,
     'emprestimosAtivos=' + JSON.stringify(w.eval('emprestimosAtivos')));
  ok('Parcelas restantes batem', w.eval('emprestimosAtivos.length ? emprestimosAtivos[0].parcelasRestantes : null') === parcelasAntes);

  console.log('\n=== Declara falencia, salva, recarrega -> overlay tem que reaparecer sozinho ===');
  w.eval('jogoEmFalencia = false;');
  w.eval('declararFalencia()');
  w.eval('salvarGameState()');
  // reseta o DOM do overlay e a flag, como se fosse pagina nova
  dom.window.document.getElementById('falenciaOverlay').style.display = 'none';
  w.eval('jogoEmFalencia = false;');
  w.eval('restaurarGameState()');
  ok('jogoEmFalencia restaurado como true', w.eval('jogoEmFalencia') === true);
  ok('Overlay reapareceu sozinho ao carregar', dom.window.document.getElementById('falenciaOverlay').style.display === 'flex');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
