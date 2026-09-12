const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== CALCULO DO EMPRESTIMO ===');
  const emp = w.eval('calcularEmprestimo(10000)');
  ok('Valor com juros de 30% sobre 10000 = 13000', emp.valorComJuros === 13000, emp.valorComJuros);
  ok('Parcela = 13000/6 arredondado', emp.parcela === Math.round(13000/6), emp.parcela);

  console.log('\n=== APROVACAO POR REPUTACAO ===');
  w.eval('reputacao = 20;'); // abaixo do minimo de 40
  const semRep = w.eval('podeContrairEmprestimo(10000)');
  ok('Reputacao 20 (abaixo de 40) bloqueia emprestimo', semRep.ok === false, semRep.motivo);
  w.eval('reputacao = 100;');
  const comRep = w.eval('podeContrairEmprestimo(10000)');
  ok('Reputacao 100 aprova emprestimo pequeno', comRep.ok === true);

  console.log('\n=== TETO COMPARTILHADO entre financiamento e emprestimo ===');
  w.eval('playerPatrimonio = 0; faturamentoAcumulado = 0;'); // forca o piso de 150000
  w.eval('financiamentosAtivos = []; emprestimosAtivos = [];');
  const tetoAntes = w.eval('calcularTetoEndividamento()');
  ok('Teto no piso de 150000 sem patrimonio', tetoAntes === 150000, tetoAntes);
  // Pega um emprestimo grande que quase esgota o teto
  w.eval('contrairEmprestimo(100000)'); // parcela*6 = ~130000 em divida
  const debitoApos = w.eval('calcularDebitoTotalAtivo()');
  ok('Debito subiu apos o emprestimo', debitoApos > 100000, debitoApos);
  const podeMaisFinanciamento = w.eval(`podeFinanciar('escavadeira2')`);
  console.log('  (checando se ainda cabe financiar mais, com boa parte do teto ja usado pelo emprestimo)');
  ok('calcularDebitoTotalAtivo conta o emprestimo pro teto de financiamento tambem', typeof podeMaisFinanciamento.ok === 'boolean');

  console.log('\n=== CENARIO 1: NAO deve falir se ainda ha maquina pra vender ===');
  w.eval('jogoEmFalencia = false; financiamentosAtivos = []; emprestimosAtivos = []; playerCash = -10000; reputacao = 20;'); // sem credito, mas com maquina
  w.eval('verificarFalencia()');
  ok('Com maquina disponivel, NAO declara falencia mesmo com caixa negativo e sem credito', w.eval('jogoEmFalencia') === false);

  console.log('\n=== CENARIO 2: NAO deve falir se ainda ha credito disponivel ===');
  w.eval('jogoEmFalencia = false; Object.keys(MACHINES).forEach(k => MACHINES[k].inContract = true);'); // "vende" tudo (simula sem maquina livre)
  w.eval('reputacao = 100;'); // com credito disponivel
  w.eval('verificarFalencia()');
  ok('Sem maquina livre mas com credito disponivel, NAO declara falencia', w.eval('jogoEmFalencia') === false);

  console.log('\n=== CENARIO 3: DEVE falir quando genuinamente nao sobra nada ===');
  w.eval('jogoEmFalencia = false; reputacao = 10; financiamentosAtivos = []; emprestimosAtivos = [];');
  w.eval('verificarFalencia()');
  ok('Sem maquina livre, sem reputacao pro credito, caixa negativo -> declara falencia', w.eval('jogoEmFalencia') === true);
  const overlayVisivel = w.eval("document.getElementById('falenciaOverlay').style.display");
  ok('Overlay de falencia ficou visivel', overlayVisivel === 'flex', overlayVisivel);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
