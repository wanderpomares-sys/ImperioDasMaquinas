const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.join('\n') : '(nenhum)');

  console.log('\n=== BUG DO ATRASO INVISIVEL: reproduz o cenario exato relatado ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  w.eval("acceptContract()");
  const idxAc = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  const prazoDias = w.eval(`CONTRACTS[acceptedContracts[${idxAc}].key].prazoDias`);
  w.eval(`acceptedContracts[${idxAc}].progress = 99; acceptedContracts[${idxAc}].diasDecorridos = ${prazoDias};`);
  w.eval('window.__mr = Math.random; Math.random = () => 0.99;');

  w.eval(`
    window.__modalTitles = [];
    const _orig = showResultModal;
    showResultModal = function(icon, title, ...rest){ window.__modalTitles.push(title); return _orig(icon, title, ...rest); };
  `);

  const cashAntes = w.eval('playerCash');
  w.eval(`avancarContrato(${idxAc})`);
  w.eval('Math.random = window.__mr;');

  const titulos = w.eval('window.__modalTitles');
  const completado = w.eval('completedContracts[completedContracts.length-1]');

  ok('Contrato concluiu', !!completado);
  ok('noPrazo = false (genuinamente atrasado, 1 dia a mais que o prazo)', completado.noPrazo === false);
  ok('MULTA foi cobrada desta vez (nao mais 0 silenciosamente)', completado.custoAtraso > 0, completado.custoAtraso);
  ok('Caixa realmente foi debitado da multa', w.eval('playerCash') < cashAntes + completado.value); // sanity check generico
  ok('Historico registrou "Contrato atrasado" (nao ficou silencioso)', w.eval("historico.some(h => h.titulo.includes('atrasado'))"));
  ok('Mensagem final do cliente e a de ATRASADO (nao a de noPrazo)', w.eval("MENSAGENS_CONCLUSAO_CLIENTE.atrasado.includes(document.getElementById('msgClienteBalao').textContent)"));

  console.log('\n=== CASO NORMAL: contrato que termina DE VERDADE no prazo continua correto ===');
  w.eval("goTo('contratos')");
  const key2 = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key2}')`);
  w.eval('acceptContract()');
  const idx2 = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  const prazoDias2 = w.eval(`CONTRACTS[acceptedContracts[${idx2}].key].prazoDias`);
  w.eval(`acceptedContracts[${idx2}].progress = 99; acceptedContracts[${idx2}].diasDecorridos = ${prazoDias2 - 1};`); // ainda dentro do prazo neste avanco
  w.eval('window.__mr2 = Math.random; Math.random = () => 0.99;');
  w.eval(`avancarContrato(${idx2})`);
  w.eval('Math.random = window.__mr2;');
  const completado2 = w.eval('completedContracts[completedContracts.length-1]');
  ok('Contrato dentro do prazo continua marcado corretamente como noPrazo=true', completado2.noPrazo === true);
  ok('Sem multa nesse caso', completado2.custoAtraso === 0);

  console.log('\n=== INDICADOR DE RITMO: aparece no card "Em andamento" ===');
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
