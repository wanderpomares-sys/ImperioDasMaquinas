const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 100;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].prazoDias >= 8)");
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  w.eval(`acceptedContracts[${idx}].progress = 30;`);

  // confirma que existe maquina livre do mesmo tipo usado no contrato (frota inicial tem so 1 de cada,
  // entao SEM outra maquina do tipo livre, a opcao C nao deveria aparecer)
  const tipoUsado = w.eval(`MACHINES[acceptedContracts[${idx}].machineKeys[0]].tipoKey`);
  const livres = w.eval(`Object.values(MACHINES).filter(m => m.tipoKey === '${tipoUsado}' && !m.inContract).length`);
  console.log('Tipo usado no contrato:', tipoUsado, '| maquinas livres desse tipo:', livres);

  w.eval('window.__mr = Math.random; Math.random = () => 0.05;');
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr;');

  const numBotoes = d.getElementById('msgClienteBotoes').children.length;
  if(livres >= 1){
    ok('COM maquina livre: aparecem as 3 opcoes (aceitar/recusar/reforcar)', numBotoes === 3, numBotoes);
    const cashAntes = w.eval('playerCash');
    const qtdAntes = w.eval(`acceptedContracts[${idx}].machineKeys.length`);
    d.getElementById('msgClienteBotoes').children[2].click(); // terceiro botao = reforcar
    ok('Caixa foi debitado no reforco', w.eval('playerCash') < cashAntes);
    ok('Maquina extra entrou no contrato', w.eval(`acceptedContracts[${idx}].machineKeys.length`) === qtdAntes + 1);
    ok('riscoElevado NAO foi marcado (reforco nao aumenta risco)', !w.eval(`acceptedContracts[${idx}].riscoElevado`));
  } else {
    ok('SEM maquina livre: so aparecem 2 opcoes (aceitar/recusar, sem reforcar)', numBotoes === 2, numBotoes);
  }

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
