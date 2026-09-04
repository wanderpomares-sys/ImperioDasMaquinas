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

  console.log('\n=== NIVEL PEQUENO: resgatar missao mostra toast de conquista ===');
  w.eval('stats.contratosNoPrazo = 3; sincronizarMissoes();');
  w.eval("resgatarMissao('s2a')");
  const toastDisplay = d.getElementById('toastConquista').style.display;
  ok('Toast de conquista aparece', toastDisplay === 'block', toastDisplay);
  ok('Titulo mostra o texto certo', d.getElementById('toastConquistaTitulo').textContent.includes('conclu'));
  ok('Subtitulo mostra o titulo da missao', d.getElementById('toastConquistaSub').textContent.length > 0);
  ok('Particulas foram geradas', d.getElementById('toastConquistaParticulas').children.length === 4);

  console.log('\n=== NIVEL MEDIO: concluir contrato mostra confete no modal (nao so texto) ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  w.eval("acceptContract()");
  const idxAc = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  w.eval(`acceptedContracts[${idxAc}].progress = 99; acceptedContracts[${idxAc}].diasDecorridos = 1;`);
  w.eval('window.__mr = Math.random; Math.random = () => 0.99;');
  w.eval(`avancarContrato(${idxAc})`);
  w.eval('Math.random = window.__mr;');
  w.eval('fecharMensagemCliente()'); // fecha o agradecimento do cliente pra revelar o modal financeiro
  ok('Modal de resultado abriu com classe success', d.querySelector('.result-modal-box').classList.contains('success'));
  const miniConfeteQtd = d.getElementById('miniConfeteContainer').children.length;
  ok('Mini confete foi gerado no modal (nivel medio, nao so texto)', miniConfeteQtd === 14, miniConfeteQtd);

  console.log('\n=== NIVEL GRANDE: comprar sede mostra tela cheia com evolucao ===');
  w.eval('playerCash = 200000; reputacao = 105; stats.contratosNoPrazo = 3; faturamentoAcumulado = 150000;');
  w.eval('maquinasComManutencaoRealizada.add("a"); maquinasComManutencaoRealizada.add("b"); sincronizarMissoes();');
  const nivelAntes = w.eval('playerSedeNivel');
  w.eval('comprarSede()');
  ok('Sede subiu de nivel', w.eval('playerSedeNivel') > nivelAntes);
  ok('Overlay de evolucao apareceu (tela cheia)', d.getElementById('evolucaoSedeOverlay').style.display === 'flex');
  ok('Mostra o nome da sede ANTIGA', d.getElementById('evolucaoNomeAntes').textContent.length > 0);
  ok('Mostra o nome da sede NOVA', d.getElementById('evolucaoNomeDepois').textContent.length > 0);
  ok('Foto ANTES carregada', d.getElementById('evolucaoFotoAntes').style.backgroundImage.includes('data:image'));
  ok('Foto DEPOIS carregada', d.getElementById('evolucaoFotoDepois').style.backgroundImage.includes('data:image'));
  ok('Confete grande foi gerado (46 particulas)', d.getElementById('evolucaoConfete').children.length === 46);
  ok('Titulo NAO diz Imperio ainda (nivel 2, nao e o topo)', d.getElementById('evolucaoTitulo').textContent === 'VOCÊ CRESCEU');

  console.log('\n=== FECHAR a tela de evolucao funciona ===');
  w.eval('closeEvolucaoSede()');
  ok('Overlay fechou', d.getElementById('evolucaoSedeOverlay').style.display === 'none');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
