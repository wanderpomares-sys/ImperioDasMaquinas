const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.join('\n') : '(nenhum)');

  console.log('\n=== INICIALIZACAO: as 5 maquinas iniciais tem apelido e historico zerado ===');
  const todasIniciais = w.eval('Object.values(MACHINES).every(m => m.apelido && typeof m.contratosRealizados === "number" && typeof m.faturamentoGerado === "number" && typeof m.manutencoesFeitas === "number" && typeof m.diasNaEmpresa === "number")');
  ok('Todas as 5 maquinas iniciais tem os campos novos', todasIniciais);
  ok('Historico comeca zerado', w.eval('Object.values(MACHINES).every(m => m.contratosRealizados === 0 && m.faturamentoGerado === 0 && m.manutencoesFeitas === 0 && m.diasNaEmpresa === 0)'));
  const apelidosDistintos = w.eval('new Set(Object.values(MACHINES).map(m=>m.apelido)).size');
  console.log('  apelidos sorteados:', w.eval('JSON.stringify(Object.values(MACHINES).map(m=>m.apelido))'));

  console.log('\n=== DIAS DE EMPRESA: avanca todo dia, mesmo maquina parada ===');
  const mkParada = w.eval("Object.keys(MACHINES).find(k => !MACHINES[k].inContract)");
  ok('Achou uma maquina parada pra testar', !!mkParada, mkParada);
  const diasAntes = w.eval(`MACHINES['${mkParada}'].diasNaEmpresa`);
  w.eval('envelhecerFrota(5)');
  ok('diasNaEmpresa avancou 5 mesmo parada', w.eval(`MACHINES['${mkParada}'].diasNaEmpresa`) === diasAntes + 5);

  console.log('\n=== MANUTENCAO: contabiliza manutencoesFeitas nos 3 caminhos ===');
  w.eval('playerCash = 5000000;');
  w.eval(`goTo('manutencao'); openMaintDetail('${mkParada}');`);
  const manutAntes = w.eval(`MACHINES['${mkParada}'].manutencoesFeitas`);
  w.eval('scheduleMaint()');
  ok('scheduleMaint incrementa manutencoesFeitas', w.eval(`MACHINES['${mkParada}'].manutencoesFeitas`) === manutAntes + 1);

  const mk2 = w.eval("Object.keys(MACHINES).find(k => !MACHINES[k].inContract && k !== '" + mkParada + "')") || mkParada;
  w.eval(`openMaintDetail('${mk2}'); abrirOficinas();`);
  const manutAntes2 = w.eval(`MACHINES['${mk2}'].manutencoesFeitas`);
  w.eval("selecionarOficina('road')");
  ok('selecionarOficina incrementa manutencoesFeitas', w.eval(`MACHINES['${mk2}'].manutencoesFeitas`) === manutAntes2 + 1);

  w.eval(`MACHINES['${mk2}'].quebrada = true;`);
  const manutAntes3 = w.eval(`MACHINES['${mk2}'].manutencoesFeitas`);
  w.eval(`repararEmergencia('${mk2}')`);
  ok('repararEmergencia incrementa manutencoesFeitas', w.eval(`MACHINES['${mk2}'].manutencoesFeitas`) === manutAntes3 + 1);

  console.log('\n=== VISUAL: apelido e historico aparecem no detalhe de manutencao ===');
  w.eval(`openMaintDetail('${mkParada}')`);
  const detalheHtml = d.getElementById('manutDetailScroll').innerHTML;
  ok('Apelido aparece no titulo', detalheHtml.includes(w.eval(`MACHINES['${mkParada}'].apelido`)));
  ok('Caixa de historia aparece', detalheHtml.includes('História da'));
  ok('Mostra dias de empresa', detalheHtml.includes('Dias de empresa'));
  ok('Mostra contratos realizados', detalheHtml.includes('Contratos realizados'));
  ok('Mostra faturamento gerado', detalheHtml.includes('Faturamento gerado'));
  ok('Mostra manutencoes feitas', detalheHtml.includes('Manutenções feitas'));

  console.log('\n=== SELO DE VETERANA: aparece so com 15+ contratos ===');
  w.eval(`MACHINES['${mkParada}'].contratosRealizados = 14;`);
  w.eval(`openMaintDetail('${mkParada}')`);
  ok('SEM selo com 14 contratos', !d.getElementById('manutDetailScroll').innerHTML.includes('VETERANA'));
  w.eval(`MACHINES['${mkParada}'].contratosRealizados = 15;`);
  w.eval(`openMaintDetail('${mkParada}')`);
  ok('COM selo com 15 contratos', d.getElementById('manutDetailScroll').innerHTML.includes('VETERANA'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
