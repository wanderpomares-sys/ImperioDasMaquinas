const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 3000;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].hasMachine)");
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');

  // Quebra TODAS as maquinas alocadas nesse contrato -- reproduz "so tinha a retro, e ela quebrou"
  w.eval(`acceptedContracts[${idx}].machineKeys.forEach(k => MACHINES[k].quebrada = true);`);

  console.log('=== Com TODAS as maquinas do contrato quebradas ===');
  const fator = w.eval(`calcularFatorProdutividade(acceptedContracts[${idx}], CONTRACTS[acceptedContracts[${idx}].key])`);
  ok('Fator de produtividade é 0 (obra realmente parada)', fator === 0, fator);

  const antesAvancar = w.eval(`acceptedContracts[${idx}].progress`);
  w.eval(`avancarContrato(${idx})`);
  const depoisAvancar = w.eval(`acceptedContracts[${idx}] ? acceptedContracts[${idx}].progress : 'contrato sumiu'`);
  ok('Progresso NAO avança nem 1 dia com tudo quebrado', depoisAvancar === antesAvancar, `${antesAvancar} -> ${depoisAvancar}`);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
