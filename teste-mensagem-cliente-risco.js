const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });

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

  console.log('=== RISCO FORCADO (Math.random mockado pra 0, garante o gatilho) ===');
  w.eval('window.__mathRandomOriginal = Math.random; Math.random = () => 0;'); // 0 < qualquer prob > 0, dispara sempre
  w.eval(`avancarContrato(${idxAc})`);
  w.eval('Math.random = window.__mathRandomOriginal;'); // restaura imediatamente

  const state = w.eval(`acceptedContracts[${idxAc}] ? acceptedContracts[${idxAc}].state : 'sumiu'`);
  ok('Risco disparou (forcado)', state === 'EM_RISCO', state);
  ok('Overlay de mensagem abriu para o risco', d.getElementById('mensagemClienteOverlay').style.display === 'flex');
  const nomeNoRisco = d.getElementById('msgClienteNome').textContent;
  ok('E o MESMO cliente do aceite — continuidade de personagem', nomeNoRisco === clienteAceite, clienteAceite + ' vs ' + nomeNoRisco);
  const catalog = w.eval(`CONTRACTS[acceptedContracts[${idxAc}].key]`);
  const riskDesc = w.eval(`CONTRACTS[acceptedContracts[${idxAc}].key].riskDesc`);
  ok('Mensagem menciona o motivo real do risco (riskDesc)', d.getElementById('msgClienteBalao').textContent.includes(riskDesc));
  ok('Foto do cliente continua carregada', d.getElementById('msgClienteFoto').src.includes('pexels.com'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
