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

  // clona artificialmente uma maquina do mesmo tipo, livre, pra simular ter uma segunda unidade
  const tipoUsado = w.eval(`MACHINES[acceptedContracts[${idx}].machineKeys[0]].tipoKey`);
  w.eval(`
    const original = Object.values(MACHINES).find(m => m.tipoKey === '${tipoUsado}');
    MACHINES['extra_teste'] = Object.assign({}, original, { name: original.name + ' (extra)', inContract: false });
  `);
  w.eval(`acceptedContracts[${idx}].progress = 30;`);

  w.eval('window.__mr = Math.random; Math.random = () => 0.05;');
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr;');

  const numBotoes = d.getElementById('msgClienteBotoes').children.length;
  ok('COM maquina livre: aparecem as 3 opcoes', numBotoes === 3, numBotoes);

  const cashAntes = w.eval('playerCash');
  const qtdAntes = w.eval(`acceptedContracts[${idx}].machineKeys.length`);
  const prazoAntes = w.eval(`CONTRACTS[acceptedContracts[${idx}].key].prazoDias`);
  d.getElementById('msgClienteBotoes').children[2].click();
  ok('Caixa foi debitado no reforco', w.eval('playerCash') < cashAntes, cashAntes + ' -> ' + w.eval('playerCash'));
  ok('Maquina extra entrou no contrato', w.eval(`acceptedContracts[${idx}].machineKeys.length`) === qtdAntes + 1);
  ok('Maquina extra marcada como inContract', w.eval(`MACHINES['extra_teste'].inContract`) === true);
  ok('Prazo caiu 2 dias, igual a opcao de aceitar', w.eval(`CONTRACTS[acceptedContracts[${idx}].key].prazoDias`) === prazoAntes - 2);
  ok('riscoElevado NAO foi marcado (reforco nao aumenta risco, diferente de aceitar)', !w.eval(`acceptedContracts[${idx}].riscoElevado`));
  ok('Historico registrou o reforco', w.eval("historico.some(h => h.titulo.includes('Reforço de máquina'))"));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
