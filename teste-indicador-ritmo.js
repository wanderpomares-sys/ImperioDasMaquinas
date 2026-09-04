const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key3 = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key3}')`);
  w.eval('acceptContract()');
  w.eval('fecharMensagemCliente()');
  w.eval("switchContratoTab('andamento')");
  const cardHtml = d.getElementById('contratosAndamentoList').innerHTML;
  ok('Mostra "No ritmo certo" no contrato recem aceito (dia 0)', cardHtml.includes('No ritmo certo'));
  ok('Mostra "Esperado até aqui" com percentual', cardHtml.includes('Esperado até aqui'));
  ok('Mostra marcador visual na barra (linha branca de referencia)', cardHtml.includes('Onde você deveria estar'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
