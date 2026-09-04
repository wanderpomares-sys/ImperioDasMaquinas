const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass = 0, fail = 0;
  const ok = (label, cond, extra) => {
    cond ? pass++ : fail++;
    console.log((cond ? 'PASSA  ' : 'FALHA  ') + label + (extra !== undefined ? '  -> ' + extra : ''));
  };

  console.log('=== A6: BUG HUNT - CICLO LONGO DE CONTRATOS ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  let excecoes = 0;
  let ciclos = 0;
  for (let i = 0; i < 40; i++) {
    try {
      w.eval("goTo('contratos')");
      const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
      if (!key) continue;
      w.eval(`openContractDetail('${key}')`);
      try { w.eval("acceptContract('padrao')"); } catch(e) { try { w.eval('acceptContract()'); } catch(e2){} }
      // avança o relógio para forçar conclusões/atrasos
      for (let t = 0; t < 5; t++) { try { w.eval('updateClock()'); } catch(e) {} }
      ciclos++;
    } catch (e) {
      excecoes++;
      console.log('  excecao no ciclo ' + i + ': ' + e.message);
    }
  }
  ok('Nenhuma excecao em 40 ciclos de contrato', excecoes === 0, excecoes + ' excecoes em ' + ciclos + ' ciclos executados');

  console.log('\n=== A6: MAQUINAS ORFAS (inContract sem contrato ativo real) ===');
  const orfas = w.eval(`
    Object.keys(MACHINES).filter(k => {
      const m = MACHINES[k];
      if (!m.inContract) return false;
      const aindaEmAndamento = acceptedContracts.some(ac =>
        (ac.state === 'EM_ANDAMENTO' || ac.state === 'EM_RISCO' || ac.state === 'ATRASADO')
        && ac.machineKeys && ac.machineKeys.includes(k));
      return !aindaEmAndamento;
    })
  `);
  ok('Nenhuma maquina orfa (inContract=true sem contrato de verdade)', orfas.length === 0, JSON.stringify(orfas));

  console.log('\n=== A6: PATRIMONIO E CAIXA NUNCA FICAM NEGATIVOS OU NaN ===');
  const cashFinal = w.eval('playerCash');
  const patFinal = w.eval('recalcularPatrimonio()');
  ok('Caixa nao e NaN', !Number.isNaN(cashFinal), cashFinal);
  ok('Caixa nao e negativo', cashFinal >= 0, cashFinal);
  ok('Patrimonio nao e NaN', !Number.isNaN(patFinal), patFinal);
  ok('Patrimonio nao e negativo', patFinal >= 0, patFinal);

  console.log('\n=== A6: TODAS AS TELAS RENDERIZAM SEM EXCECAO APOS O CICLO LONGO ===');
  ['hub','maquinas','contratos','manutencao','financas','loja','sedes','missoes'].forEach(t => {
    let e = null;
    try { w.eval(`goTo('${t}')`); } catch(ex) { e = ex.message; }
    ok('goTo(' + t + ') apos ciclo longo', !e, e || '');
  });

  console.log('\n=== A6: RECARREGAR O JOGO (simular fechar e abrir) NAO QUEBRA ===');
  let estadoAntes = { cash: w.eval('playerCash'), sede: w.eval('playerSedeNivel'), rep: w.eval('reputacao') };
  w.eval('salvarGameState()');
  w.eval('playerCash = 1; playerSedeNivel = 1; reputacao = 1;'); // simula estado "zerado" antes do restore
  w.console.error = (...a) => console.log('  [console.error interno]', a.map(String).join(' '));
  let restaurou = null;
  try { restaurou = w.eval('restaurarGameState()'); } catch(e) { restaurou = 'erro: ' + e.message; }
  ok('restaurarGameState() executa sem excecao', restaurou === true, restaurou);
  ok('Caixa restaurado bate com o salvo', w.eval('playerCash') === estadoAntes.cash, estadoAntes.cash + ' vs ' + w.eval('playerCash'));
  ok('Sede restaurada bate com a salva', w.eval('playerSedeNivel') === estadoAntes.sede);

  console.log('\n=== RESULTADO A6 (bug hunt): ' + pass + ' passaram, ' + fail + ' falharam ===');
  console.log('Erros de console acumulados: ' + (errs.length ? errs.join(' | ') : 'nenhum'));
}, 2500);
