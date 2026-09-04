const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key2 = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key2}')`);
  w.eval('acceptContract()');
  const idx2 = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  const prazoDias2 = w.eval(`CONTRACTS[acceptedContracts[${idx2}].key].prazoDias`);
  w.eval(`acceptedContracts[${idx2}].progress = 99; acceptedContracts[${idx2}].diasDecorridos = ${prazoDias2 - 1};`);
  w.eval('window.__mr2 = Math.random; Math.random = () => 0.99;');
  w.eval(`avancarContrato(${idx2})`);
  w.eval('Math.random = window.__mr2;');
  const completado2 = w.eval('completedContracts[completedContracts.length-1]');
  ok('Contrato dentro do prazo continua marcado corretamente como noPrazo=true', completado2.noPrazo === true);
  ok('Sem multa nesse caso', completado2.custoAtraso === 0);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
