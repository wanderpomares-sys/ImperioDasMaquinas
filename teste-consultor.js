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

  console.log('\n=== CONDICAO 1: maquina quebrada e a mais urgente ===');
  w.eval("Object.values(MACHINES)[0].quebrada = true;");
  const c1 = w.eval('gerarConselhoConsultor()');
  ok('Fala da maquina quebrada primeiro', c1 && c1.includes('quebrada'), c1);
  w.eval("Object.values(MACHINES)[0].quebrada = false;");

  console.log('\n=== CONDICAO 2: sem contrato aceito, mas tem disponivel ===');
  w.eval('acceptedContracts.length = 0;');
  const temDisponivel = w.eval("Object.values(CONTRACTS).some(c => c.state==='DISPONIVEL' && c.hasMachine)");
  if(temDisponivel){
    const c2 = w.eval('gerarConselhoConsultor()');
    ok('Fala de precisar de mais contratos', c2 && c2.toLowerCase().includes('contrato'), c2);
  } else { console.log('  (pulado - nenhum contrato disponivel usavel nesse sorteio)'); }

  console.log('\n=== CONDICAO 4: caixa baixo ===');
  w.eval('acceptedContracts.push({key:Object.keys(CONTRACTS)[0], machineKeys:[]});'); // simula ter 1 aceito, pra pular a condicao 2
  w.eval('playerCash = 5000;');
  const c4 = w.eval('gerarConselhoConsultor()');
  ok('Fala de contas apertadas', c4 && c4.toLowerCase().includes('apertad'), c4);

  console.log('\n=== CONDICAO: caixa alto e saudavel ===');
  w.eval('playerCash = 5000000; reputacao=150; stats.contratosNoPrazo=999; faturamentoAcumulado=99999999; maquinasComManutencaoRealizada.add("x"); maquinasComManutencaoRealizada.add("y"); maquinasComManutencaoRealizada.add("z");');
  Object.values; // no-op
  const cAlto = w.eval('gerarConselhoConsultor()');
  ok('Diz alguma coisa (nao trava com estado bom)', cAlto === null || typeof cAlto === 'string', cAlto);

  console.log('\n=== MODERACAO: nao fala 2x seguidas dentro do intervalo ===');
  w.eval('ultimoConselhoTimestamp = 0; playerCash = 5000;'); // forca condicao de caixa baixo de novo, cooldown zerado
  w.eval("goTo('hub')");
  w.eval('window.__mr = Math.random; Math.random = () => 0.01;'); // garante que passa no sorteio de 45%
  w.eval('tentarFalarComConsultor()');
  const abriuPrimeira = d.getElementById('mensagemClienteOverlay').style.display === 'flex';
  ok('Primeira tentativa (cooldown zerado) abre a mensagem', abriuPrimeira);
  w.eval('fecharMensagemCliente()');
  w.eval('tentarFalarComConsultor()'); // tenta de novo imediatamente, cooldown deveria bloquear
  const abriuSegunda = d.getElementById('mensagemClienteOverlay').style.display === 'flex';
  ok('Segunda tentativa imediata NAO abre (moderacao/cooldown funcionando)', !abriuSegunda);
  w.eval('Math.random = window.__mr;');

  console.log('\n=== SO FALA QUANDO O HUB ESTA VISIVEL ===');
  w.eval('ultimoConselhoTimestamp = 0;');
  w.eval("goTo('contratos')");
  w.eval('tentarFalarComConsultor()');
  ok('Fora do Hub, nao abre mensagem nenhuma', d.getElementById('mensagemClienteOverlay').style.display !== 'flex');

  console.log('\n=== FOTO E NOME DO CONSULTOR CARREGAM CERTO ===');
  w.eval('ultimoConselhoTimestamp = 0; playerCash = 5000;');
  w.eval("goTo('hub')");
  w.eval('window.__mr2 = Math.random; Math.random = () => 0.01;');
  w.eval('tentarFalarComConsultor()');
  w.eval('Math.random = window.__mr2;');
  ok('Nome do consultor aparece', d.getElementById('msgClienteNome').textContent === 'Marisa Andrade');
  ok('Foto do consultor carrega', d.getElementById('msgClienteFoto').src.includes('7580821'));
  ok('Cargo aparece', d.getElementById('msgClienteCargo').textContent.includes('Consultora'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
