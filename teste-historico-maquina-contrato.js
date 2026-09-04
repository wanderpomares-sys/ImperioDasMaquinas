const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  w.eval(`acceptedContracts[${idx}].pedidoClienteOferecido = true;`);

  const mk = w.eval(`acceptedContracts[${idx}].machineKeys[0]`);
  const contratosAntes = w.eval(`MACHINES['${mk}'].contratosRealizados`);
  const faturamentoAntes = w.eval(`MACHINES['${mk}'].faturamentoGerado`);
  const valorContrato = w.eval(`acceptedContracts[${idx}].value`);

  // forca conclusao no prazo, sem risco
  w.eval(`acceptedContracts[${idx}].progress = 99; acceptedContracts[${idx}].diasDecorridos = 1;`);
  w.eval('window.__mr = Math.random; Math.random = () => 0.99;');
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr;');
  w.eval('fecharMensagemCliente()');

  ok('contratosRealizados subiu 1 pra maquina que participou', w.eval(`MACHINES['${mk}'].contratosRealizados`) === contratosAntes + 1);
  ok('faturamentoGerado subiu o valor exato do contrato', w.eval(`MACHINES['${mk}'].faturamentoGerado`) === faturamentoAntes + valorContrato);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
