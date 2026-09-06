const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 150;');
  let escalou = false;
  for(let tentativa = 0; tentativa < 30 && !escalou; tentativa++){
    w.eval("goTo('contratos')");
    const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
    if(!key) continue;
    w.eval(`openContractDetail('${key}')`);
    w.eval('acceptContract()');
    const idx = w.eval('acceptedContracts.length - 1');
    if(idx < 0) continue;
    w.eval('fecharMensagemCliente()');
    w.eval(`acceptedContracts[${idx}].state = 'EM_RISCO';`);
    const antesLen = w.eval('lostContracts.length');
    try {
      w.eval(`
        const catalog2 = CONTRACTS[acceptedContracts[${idx}].key];
        const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
        resolverComOpcaoEngenharia(${idx}, opcoes[opcoes.length-1].id);
      `);
    } catch(e){ continue; }
    escalou = w.eval('lostContracts.length') > antesLen;
  }
  ok('Conseguiu forcar a escalada em ate 30 tentativas (sorteio real)', escalou);
  if(escalou){
    const srcFinal = w.eval("document.getElementById('resultModalImg').src");
    ok('Modal de contrato perdido mostra a foto certa', srcFinal.includes('base64'), srcFinal.slice(0,40));
  }

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
