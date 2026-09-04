const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 150;');
  const key2 = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`acceptedContracts.push({ key:'${key2}', name:'Teste sem cliente', value:50000, prazoDias:10, diasDecorridos:1, progress:99, machineKeys:[], seguro:'nenhum', custoSeguroPago:0, custoRiscoAdministrado:0, custoAtraso:0, state:'EM_ANDAMENTO', eventoAtivo:null });`);
  const idxSemCliente = w.eval('acceptedContracts.length - 1');
  w.eval('window.__mr2 = Math.random; Math.random = () => 0.99;');
  let erro2 = null;
  try { w.eval(`avancarContrato(${idxSemCliente})`); } catch(e){ erro2 = e.message; }
  w.eval('Math.random = window.__mr2;');

  ok('Conclusao sem cliente nao quebra', !erro2, erro2 || '');
  ok('Vai direto pro resumo financeiro', d.getElementById('resultModalOverlay').classList.contains('show'));
  ok('NAO abre card de cliente (contrato nao tinha um)', d.getElementById('mensagemClienteOverlay').style.display !== 'flex');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
