const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Perda pequena (rotina) NAO mostra imagem de prejuizo ===');
  ok('Perda de 500 com caixa de 100000 nao e grave', w.eval('imagemPrejuizoSeGrave(100000, 500)') === null);

  console.log('\n=== Perda GRANDE (>15% do caixa) mostra imagem ===');
  const img1 = w.eval('imagemPrejuizoSeGrave(100000, 20000)');
  ok('Perda de 20% do caixa mostra imagem real', img1 && img1.includes('base64'));

  console.log('\n=== Caixa resultante criticamente baixo mostra imagem mesmo se a perda for pequena ===');
  const img2 = w.eval('imagemPrejuizoSeGrave(12000, 5000)'); // sobra 7000, abaixo do limiar de 10000
  ok('Caixa final criticamente baixo mostra imagem real', img2 && img2.includes('base64'));

  console.log('\n=== Contrato perdido mostra a foto do chefe gritando ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  w.eval(`acceptedContracts[${idx}].state = 'EM_RISCO';`);
  w.eval(`
    const catalog2 = CONTRACTS[acceptedContracts[${idx}].key];
    const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
    window.__mr = Math.random; Math.random = () => 0.99; // forca escalar=true (chanceEscalada sempre menor que 0.99... espera, precisa ser MENOR que chanceEscalada pra escalar)
  `);
  w.eval('Math.random = () => 0.01;'); // agora forca ESCALAR de verdade (0.01 < qualquer chanceEscalada)
  w.eval(`
    const catalog2 = CONTRACTS[acceptedContracts[${idx}].key];
    const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
    resolverComOpcaoEngenharia(${idx}, opcoes[opcoes.length-1].id);
  `);
  w.eval('Math.random = window.__mr;');
  const srcFinal = w.eval("document.getElementById('resultModalImg').src");
  ok('Modal de contrato perdido mostra a foto certa', srcFinal.includes('base64'), srcFinal.slice(0,40));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
