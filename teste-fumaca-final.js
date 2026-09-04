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

  console.log('\n=== FLUXO COMPLETO: navegar por TODAS as telas sem excecao ===');
  const telas = ['hub','maquinas','contratos','manutencao','financas','loja','sedes','missoes'];
  telas.forEach(t => {
    let erro = null;
    try { w.eval(`goTo('${t}')`); } catch(e){ erro = e.message; }
    ok('Tela ' + t + ' abre sem excecao', !erro, erro || '');
  });

  console.log('\n=== FLUXO: aceitar contrato -> mensagem cliente -> ver hub atualizado ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  let erroFluxo = null;
  try {
    w.eval('acceptContract()');
    w.eval('fecharMensagemCliente()');
    w.eval("goTo('hub')");
  } catch(e){ erroFluxo = e.message; }
  ok('Fluxo aceite completo sem excecao', !erroFluxo, erroFluxo || '');
  ok('Hub reflete o contrato aceito (painel de obras)', d.getElementById('painelComando').innerHTML.includes('1 em andamento'));

  console.log('\n=== FLUXO: comprar sede -> ver evolucao -> hub reflete nova sede ===');
  w.eval('stats.contratosNoPrazo=3; maquinasComManutencaoRealizada.add("a"); maquinasComManutencaoRealizada.add("b"); faturamentoAcumulado=150000; sincronizarMissoes();');
  let erroSede = null;
  try {
    w.eval('comprarSede()');
    w.eval('closeEvolucaoSede()');
    w.eval("goTo('hub')");
  } catch(e){ erroSede = e.message; }
  ok('Fluxo de compra de sede sem excecao', !erroSede, erroSede || '');
  ok('Nivel de sede realmente mudou', w.eval('playerSedeNivel') === 2);

  console.log('\n=== SALVAR E RESTAURAR o jogo inteiro apos toda essa sessao ===');
  let erroSave = null;
  try { w.eval('salvarGameState()'); } catch(e){ erroSave = e.message; }
  ok('Salvar nao quebra', !erroSave, erroSave || '');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
