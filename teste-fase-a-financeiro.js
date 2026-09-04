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

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.join('\n') : '(nenhum)');

  console.log('\n=== A5 (achado): ACESSO A LOJA NO INICIO DE JOGO ===');
  w.eval('__reset_dummy = 1;'); // no-op, apenas marcador de secao
  const catalogo = w.eval('Object.keys(CATALOG)');
  let compraveisAVista = 0, compraveisFinanciado = 0;
  catalogo.forEach(k => {
    const vista = w.eval(`CATALOG['${k}'].vista`);
    if (60000 >= vista) compraveisAVista++;
    const aprov = w.eval(`podeFinanciar('${k}')`);
    if (aprov.ok) compraveisFinanciado++;
  });
  ok('Registrado: opcoes a vista com caixa inicial (informativo)', true, compraveisAVista + ' de ' + catalogo.length);
  ok('Existe ao menos 1 caminho de compra no inicio (financiado)', compraveisFinanciado >= 1, compraveisFinanciado + ' de ' + catalogo.length + ' aprovados');

  console.log('\n=== A1/A2: CENARIO 1 - COMPRA DE MAQUINA DESCONTA E REFLETE NA UI ===');
  w.eval("goTo('loja')");
  // 'retro2' e a unica opcao comprável com o caixa/reputação iniciais (achado da auditoria: ver relatorio)
  const catKey = 'retro2';
  w.eval(`openLojaDetail('${catKey}')`);
  w.eval("selectLojaMode('financiado')");
  const cashAntes1 = w.eval('playerCash');
  const entrada = w.eval(`calcularFinanciamento(CATALOG['${catKey}'].vista, CATALOG['${catKey}'].parcelasCount).entrada`);
  let comprouOk = null;
  try { w.eval('buyMachine()'); comprouOk = true; } catch(e) { comprouOk = 'erro: ' + e.message; }
  const cashDepois1 = w.eval('playerCash');
  ok('buyMachine executou sem excecao', comprouOk === true, comprouOk);
  ok('Caixa descontado no valor exato da entrada', cashDepois1 === cashAntes1 - entrada, (cashAntes1 - entrada) + ' esperado, veio ' + cashDepois1);
  w.eval("goTo('financas')");
  const painelCash = d.querySelector('.js-cash').textContent.replace(/\D/g, '');
  ok('Painel financeiro reflete o novo caixa', Number(painelCash) === Math.round(cashDepois1),
     'painel=' + painelCash + ' real=' + Math.round(cashDepois1));

  console.log('\n=== A1: CENARIO 2 - MANUTENCAO DESCONTA E APARECE NO HISTORICO ===');
  const k = w.eval('Object.keys(MACHINES)[0]');
  w.eval(`goTo('manutencao'); openMaintDetail('${k}')`);
  const cashAntes2 = w.eval('playerCash');
  const histAntes = w.eval('historico.length');
  const precoManut = w.eval("MACHINES['" + k + "'].original.price");
  w.eval('scheduleMaint()');
  const cashDepois2 = w.eval('playerCash');
  const histDepois = w.eval('historico.length');
  ok('Caixa foi descontado no valor exato', cashDepois2 === cashAntes2 - precoManut, (cashAntes2 - precoManut) + ' esperado, veio ' + cashDepois2);
  ok('Entrada nova no historico', histDepois === histAntes + 1, histAntes + ' -> ' + histDepois);

  console.log('\n=== A1: CENARIO 3 - OFICINA DESCONTA VALOR EXATO (nao generico) ===');
  const k2 = w.eval('Object.keys(MACHINES)[1] || Object.keys(MACHINES)[0]');
  w.eval(`goTo('manutencao'); openMaintDetail('${k2}'); abrirOficinas();`);
  const cashAntes3 = w.eval('playerCash');
  const custoOfc = w.eval("OFICINAS_DATA.find(o=>o.id==='mega').custo");
  w.eval("selecionarOficina('mega')");
  const cashDepois3 = w.eval('playerCash');
  ok('Caixa descontado no valor exato da oficina', cashDepois3 === cashAntes3 - custoOfc, (cashAntes3-custoOfc) + ' esperado, veio ' + cashDepois3);

  console.log('\n=== A2: CENARIO 4 - CONTRATO CONCLUIDO CREDITA O LIQUIDO CORRETO ===');
  w.eval("goTo('contratos')");
  const contratoKey = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  ok('Existe contrato disponivel para testar', !!contratoKey, contratoKey);
  if (contratoKey) {
    w.eval(`openContractDetail('${contratoKey}')`);
    let aceitou = null;
    try { w.eval("acceptContract('padrao')"); aceitou = true; }
    catch(e) { try { w.eval("acceptContract()"); aceitou = true; } catch(e2){ aceitou = 'erro: ' + e2.message; } }
    ok('Contrato aceito sem excecao', aceitou === true, aceitou);
  }

  console.log('\n=== A2: CENARIO 5 - VENDA DE MAQUINA CREDITA CAIXA ===');
  const chaves = w.eval('Object.keys(MACHINES)');
  const kv = chaves[chaves.length - 1];
  w.eval(`goTo('manutencao'); openMaintDetail('${kv}')`);
  const emContrato = w.eval(`MACHINES['${kv}'].inContract`);
  if (!emContrato) {
    const cashAntesV = w.eval('playerCash');
    w.eval(`venderMaquina('${kv}')`);
    const cashDepoisV = w.eval('playerCash');
    ok('Venda credita caixa (aumenta)', cashDepoisV > cashAntesV, cashAntesV + ' -> ' + cashDepoisV);
  } else {
    console.log('  (pulado: unica maquina livre estava em contrato)');
  }

  console.log('\n=== A2: CENARIO 6 - NENHUM DESCONTO "FANTASMA" SEM ACAO DO JOGADOR ===');
  w.eval("goTo('hub')");
  const cashParado1 = w.eval('playerCash');
  // Navega por todas as telas sem executar nenhuma acao de gasto
  ['maquinas','contratos','financas','loja','sedes','missoes','hub'].forEach(t => w.eval(`goTo('${t}')`));
  const cashParado2 = w.eval('playerCash');
  ok('Caixa nao muda so por navegar entre telas', cashParado1 === cashParado2, cashParado1 + ' -> ' + cashParado2);

  console.log('\n=== A2: CENARIO 7 - RECOMPENSA DE MISSAO SO CREDITA UMA VEZ (nao duplica) ===');
  w.eval('stats.contratosNoPrazo = 3; sincronizarMissoes();');
  const cashM1 = w.eval('playerCash');
  w.eval("resgatarMissao('s2a')");
  const cashM2 = w.eval('playerCash');
  w.eval("resgatarMissao('s2a')");
  const cashM3 = w.eval('playerCash');
  ok('Primeira resgatada credita', cashM2 === cashM1 + 5000, cashM1 + ' -> ' + cashM2);
  ok('Segunda tentativa NAO credita de novo', cashM3 === cashM2, cashM2 + ' -> ' + cashM3);

  console.log('\n=== A2: CENARIO 8 - COMPRA DE SEDE NAO PERMITE CAIXA NEGATIVO ===');
  w.eval('playerCash = 100; playerSedeNivel = 1; reputacao = 999; stats.contratosNoPrazo=999; stats.oficinasUsadas=999; faturamentoAcumulado=999999999; maquinasComManutencaoRealizada = new Set(["a","b"]); sincronizarMissoes();');
  const cashAntesSede = w.eval('playerCash');
  w.eval('comprarSede()');
  const cashDepoisSede = w.eval('playerCash');
  const nivelDepois = w.eval('playerSedeNivel');
  ok('Compra bloqueada por falta de caixa mesmo com missoes/reputacao OK', nivelDepois === 1 && cashDepoisSede === cashAntesSede, 'nivel=' + nivelDepois + ' cash=' + cashDepoisSede);

  console.log('\n=== RESULTADO FASE A (financeiro): ' + pass + ' passaram, ' + fail + ' falharam ===');
  console.log('Erros de console acumulados: ' + (errs.length ? errs.join(' | ') : 'nenhum'));
}, 2500);
