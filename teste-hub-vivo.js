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

  console.log('\n=== HUB: painel de comando renderiza com dados reais ===');
  w.eval("goTo('hub')");
  const painel = d.getElementById('painelComando').innerHTML;
  ok('Painel nao esta vazio', painel.length > 100);
  ok('Mostra caixa formatado', painel.includes('R$'));
  ok('Mostra contagem de frota', painel.includes(Object.keys(w.eval('MACHINES')).length + ' máquina'));
  ok('Mostra proxima conquista (nome da sede)', painel.includes(w.eval('SEDES_DATA[2].nome')));

  console.log('\n=== HUB: maquinas nao sao mais estaticas ===');
  const maqRow = d.getElementById('hubMaquinasRow').innerHTML;
  const nomesReais = w.eval('Object.values(MACHINES).map(m=>m.name)');
  ok('Mostra pelo menos 1 nome real da frota', nomesReais.some(n => maqRow.includes(n)));
  ok('NAO mostra mais o texto estatico antigo (Escavadeira CAT 320D fixo)', 
     !maqRow.includes('onclick="goTo(\'manutencao\'); openMaintDetail(\'escavadeira\');"') || nomesReais.includes('Escavadeira Hidráulica CAT 320D'));

  console.log('\n=== HUB: contratos disponiveis refletem o pool real ===');
  const ccRow = d.getElementById('hubContratosRow').innerHTML;
  const disponiveisReais = w.eval("Object.keys(CONTRACTS).filter(k=>CONTRACTS[k].state==='DISPONIVEL').map(k=>CONTRACTS[k].name)");
  ok('Mostra pelo menos 1 contrato real do pool atual', disponiveisReais.some(n => ccRow.includes(n)));
  ok('Card tem onclick pro contrato certo', ccRow.includes('openContractDetail'));

  console.log('\n=== ALERTA FALSO DE CHUVA FOI REMOVIDO ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  w.eval("acceptContract()");
  w.eval('fecharMensagemCliente()');
  w.eval("goTo('hub')");
  const alertasComContrato = d.getElementById('alertasPendentesRow').innerHTML;
  ok('NAO mostra mais "Chuva forte" mesmo com contrato ativo', !alertasComContrato.includes('Chuva forte'));

  console.log('\n=== ALERTA REAL: contrato em risco aparece de verdade ===');
  const idxAc = w.eval('acceptedContracts.length - 1');
  w.eval(`acceptedContracts[${idxAc}].state = 'EM_RISCO';`);
  w.eval("goTo('hub')");
  const alertasComRisco = d.getElementById('alertasPendentesRow').innerHTML;
  ok('Mostra alerta de situacao de risco', alertasComRisco.includes('Situação de risco') || alertasComRisco.includes('risco'));

  console.log('\n=== ALERTA REAL: noticia nao lida aparece ===');
  w.eval(`acceptedContracts[${idxAc}].state = 'EM_ANDAMENTO';`);
  w.eval("registrarNoticia('📋','Novo contrato disponível','teste')");
  w.eval("goTo('hub')");
  const alertasComNoticia = d.getElementById('alertasPendentesRow').innerHTML;
  ok('Mostra alerta de noticia nao lida', alertasComNoticia.includes('notícia'));

  console.log('\n=== CAIXA: variacao desde a ultima visita calcula certo ===');
  w.eval('caixaUltimaVisitaHub = null;'); // reseta pra testar do zero
  w.eval("goTo('hub')"); // primeira visita, define baseline
  w.eval('playerCash += 50000;');
  w.eval("goTo('financas'); goTo('hub');"); // sai e volta
  const painel2 = d.getElementById('painelComando').innerHTML;
  ok('Mostra variacao positiva de +50.000', painel2.includes('+R$') && painel2.includes('50.000'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
