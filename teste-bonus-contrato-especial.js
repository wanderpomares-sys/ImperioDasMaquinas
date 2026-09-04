const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval('playerCash = 5000000; reputacao = 100;');

  // forca um slot a ficar 'especial' via sorteio real repetido
  const key = Object.keys(w.eval('CONTRACTS'))[0];
  let achou = false;
  for(let i=0;i<80 && !achou;i++){
    w.eval(`regenerarContrato('${key}')`);
    achou = w.eval(`CONTRACTS['${key}'].personalidade`) === 'especial';
  }
  ok('Conseguiu um contrato especial pra testar', achou);

  w.eval("goTo('contratos')");
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');

  // forca conclusao no prazo (progress 99 -> 100, dentro do prazo)
  w.eval(`acceptedContracts[${idx}].progress = 99; acceptedContracts[${idx}].diasDecorridos = 1;`);
  w.eval('window.__mr = Math.random; Math.random = () => 0.99;'); // evita risco/pedido nesse avanco
  const repAntes = w.eval('reputacao');
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr;');
  w.eval('fecharMensagemCliente()'); // fecha a msg de agradecimento, revela resumo financeiro

  const repDepois = w.eval('reputacao');
  ok('Reputacao subiu 2 (normal) + 8 (bonus especial) = 10 no total', repDepois === repAntes + 10, repAntes + ' -> ' + repDepois);
  ok('Noticia do bonus especial foi registrada', w.eval("noticias.some(n => n.titulo.includes('especial cumprido'))"));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
