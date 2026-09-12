const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== CENARIO 1: caixa negativo mas TEM maquina pra vender -> NAO e falencia ===');
  w.eval('reputacao = 150; playerCash = -6000;'); // abaixo do limiar (-5000)
  w.eval('verificarFalencia()');
  ok('Nao declarou falencia (tem maquina disponivel)', w.eval('jogoEmFalencia') === false);

  console.log('\n=== CENARIO 2: caixa negativo, SEM maquina livre, mas TEM credito -> NAO e falencia ===');
  w.eval('reputacao = 150; playerCash = -6000;');
  // marca todas as maquinas como em contrato, pra tirar a alternativa de vender
  w.eval("Object.values(MACHINES).forEach(m => m.inContract = true);");
  w.eval('financiamentosAtivos = []; emprestimosAtivos = []; playerPatrimonio = 500000; faturamentoAcumulado = 500000;');
  w.eval('verificarFalencia()');
  ok('Nao declarou falencia (sem maquina livre, mas com credito disponivel)', w.eval('jogoEmFalencia') === false,
     'podeVender=' + w.eval('podeVenderAlgumaMaquina()') + ' podeEmprestimo=' + JSON.stringify(w.eval('podeContrairEmprestimo(10000)')));

  console.log('\n=== CENARIO 3: caixa negativo, sem maquina livre, sem credito (reputacao baixa) -> FALENCIA ===');
  w.eval('jogoEmFalencia = false;'); // reset
  w.eval('reputacao = 10; playerCash = -6000;'); // abaixo do minimo de 40 pra emprestimo
  w.eval('verificarFalencia()');
  ok('Declarou falencia (reputacao baixa demais pra credito, sem maquina)', w.eval('jogoEmFalencia') === true);
  ok('Overlay de falencia esta visivel', dom.window.document.getElementById('falenciaOverlay').style.display === 'flex');

  console.log('\n=== CENARIO 4: caixa positivo -> NUNCA e falencia, mesmo sem maquina/credito ===');
  w.eval('jogoEmFalencia = false;');
  w.eval('reputacao = 10; playerCash = 500;'); // positivo, acima do limiar -5000
  w.eval('verificarFalencia()');
  ok('Nao declarou falencia (caixa positivo)', w.eval('jogoEmFalencia') === false);

  console.log('\n=== VALIDACAO DO EMPRESTIMO: juros e parcelas calculados certo ===');
  const emp = w.eval('calcularEmprestimo(10000)');
  ok('Juros de 30% aplicado', emp.valorComJuros === 13000, JSON.stringify(emp));
  ok('6 parcelas', emp.parcelas === 6);

  console.log('\n=== VALIDACAO: contrair emprestimo de verdade poe dinheiro no caixa ===');
  w.eval('jogoEmFalencia = false; reputacao = 150; playerCash = 1000; emprestimosAtivos = []; financiamentosAtivos = []; playerPatrimonio=500000; faturamentoAcumulado=500000;');
  const cashAntes = w.eval('playerCash');
  w.eval('contrairEmprestimo(20000)');
  ok('Caixa aumentou em 20000', w.eval('playerCash') === cashAntes + 20000, `${cashAntes} -> ${w.eval('playerCash')}`);
  ok('Emprestimo registrado na lista', w.eval('emprestimosAtivos.length') === 1);

  console.log('\n=== VALIDACAO: venderMaquina bloqueia maquina em contrato ===');
  w.eval("Object.keys(MACHINES).forEach(k => MACHINES[k].inContract = false);");
  const primeiraKey = w.eval('Object.keys(MACHINES)[0]');
  w.eval(`MACHINES['${primeiraKey}'].inContract = true;`);
  const cashAntesVenda = w.eval('playerCash');
  w.eval(`venderMaquina('${primeiraKey}')`);
  ok('Venda bloqueada (maquina em contrato), caixa nao mudou', w.eval('playerCash') === cashAntesVenda);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
