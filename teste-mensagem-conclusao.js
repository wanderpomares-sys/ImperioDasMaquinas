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
  w.eval("acceptContract()");
  const idxAc = w.eval('acceptedContracts.length - 1');
  const clienteAceite = w.eval(`acceptedContracts[${idxAc}].cliente.nome`);
  w.eval('fecharMensagemCliente()');

  w.eval(`acceptedContracts[${idxAc}].progress = 99; acceptedContracts[${idxAc}].diasDecorridos = 1;`);
  w.eval('window.__mr = Math.random; Math.random = () => 0.99;');
  let erro = null;
  try { w.eval(`avancarContrato(${idxAc})`); } catch(e){ erro = e.message; }
  w.eval('Math.random = window.__mr;');
  ok('avancarContrato ate a conclusao nao quebra', !erro, erro || '');

  ok('Mensagem do MESMO cliente aparece primeiro', d.getElementById('msgClienteNome').textContent === clienteAceite);
  ok('Resumo financeiro AINDA NAO apareceu', !d.getElementById('resultModalOverlay').classList.contains('show'));

  w.eval('fecharMensagemCliente()');
  ok('Resumo financeiro ABRIU depois de fechar a mensagem', d.getElementById('resultModalOverlay').classList.contains('show'));
  const texto = d.getElementById('resultModalText').textContent;
  ok('Resumo financeiro preserva o liquido e o imposto', texto.includes('Líquido de custos') && texto.includes('Imposto provisionado'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
