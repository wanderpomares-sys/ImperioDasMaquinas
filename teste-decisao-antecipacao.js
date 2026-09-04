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

  w.eval('playerCash = 5000000; reputacao = 100;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].prazoDias >= 8)");
  ok('Achou um contrato com prazo >= 8 dias pra testar', !!key, key);
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  w.eval(`acceptedContracts[${idx}].progress = 30;`); // dentro da janela 5-70 exigida

  console.log('\n=== FORCAR O GATILHO: mockando Math.random pra garantir a decisao ===');
  w.eval('window.__mr = Math.random; Math.random = () => 0.05;'); // 0.05 < 0.10, dispara o pedido
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr;');

  ok('pedidoClienteOferecido marcado como true', w.eval(`acceptedContracts[${idx}].pedidoClienteOferecido`) === true);
  ok('Overlay de decisao abriu', d.getElementById('mensagemClienteOverlay').style.display === 'flex');
  ok('Botao "Entendido" escondido (modo decisao)', d.getElementById('msgClienteBtnEntendido').style.display === 'none');
  const numBotoes = d.getElementById('msgClienteBotoes').children.length;
  ok('Tem pelo menos 2 opcoes (aceitar/recusar)', numBotoes >= 2, numBotoes);
  ok('Progresso NAO avancou nesse dia (dia foi consumido pela decisao)', w.eval(`acceptedContracts[${idx}].progress`) === 30);

  console.log('\n=== ESCOLHER "ACEITAR": reduz prazo, sobe reputacao, marca risco elevado ===');
  const prazoAntes = w.eval(`CONTRACTS[acceptedContracts[${idx}].key].prazoDias`);
  const repAntes = w.eval('reputacao');
  d.getElementById('msgClienteBotoes').children[0].click(); // primeiro botao = Aceitar
  const prazoDepois = w.eval(`CONTRACTS[acceptedContracts[${idx}].key].prazoDias`);
  ok('Prazo caiu em 2 dias', prazoDepois === prazoAntes - 2, prazoAntes + ' -> ' + prazoDepois);
  ok('Reputacao subiu 5', w.eval('reputacao') === repAntes + 5);
  ok('riscoElevado marcado', w.eval(`acceptedContracts[${idx}].riscoElevado`) === true);
  ok('Overlay fechou', d.getElementById('mensagemClienteOverlay').style.display === 'none');
  ok('Historico registrou a decisao', w.eval("historico.some(h => h.titulo.includes('Antecipação aceita'))"));

  console.log('\n=== SO ACONTECE 1 VEZ POR CONTRATO ===');
  w.eval('window.__mr2 = Math.random; Math.random = () => 0.01;'); // forcaria de novo se nao tivesse a trava
  w.eval(`acceptedContracts[${idx}].progress = 35;`);
  w.eval(`avancarContrato(${idx})`);
  w.eval('Math.random = window.__mr2;');
  ok('Nao abriu decisao de novo (ja foi oferecida)', d.getElementById('mensagemClienteOverlay').style.display !== 'flex' || !d.getElementById('msgClienteBotoes').children.length);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
