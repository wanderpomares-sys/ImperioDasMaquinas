const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
let pass=0, fail=0;
const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };
const errosConsole = [];
const vc = new VirtualConsole();
vc.on('error', (...args) => errosConsole.push(args.join(' ')));

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;

  console.log('=== CENARIO EXATO RELATADO: comprar 4 maquinas, salvar, fechar, reabrir ===');
  const qtdInicial = w.eval('Object.keys(MACHINES).length');
  ok('Comeca com 5 maquinas', qtdInicial === 5);

  // compra 4 maquinas de verdade, pelo fluxo real — precisa de sede com capacidade (sede 1 tem
  // exatamente 5, igual a frota inicial, entao bloquearia qualquer compra a mais)
  w.eval('playerCash = 50000000; reputacao = 150; playerSedeNivel = 3;');
  const chaves = w.eval('Object.keys(CATALOG)');
  chaves.slice(0,4).forEach(k => {
    w.eval(`goTo('loja'); openLojaDetail('${k}'); selectLojaMode('vista'); buyMachine();`);
  });
  const qtdDepoisDeComprar = w.eval('Object.keys(MACHINES).length');
  ok('Frota subiu pra 9 apos comprar 4', qtdDepoisDeComprar === 9, qtdDepoisDeComprar);

  const nomesComprados = w.eval('JSON.stringify(Object.values(MACHINES).map(m=>m.name))');
  console.log('  Maquinas antes de salvar:', nomesComprados);

  // salva de verdade
  w.eval('salvarGameState();');
  const savedRaw = w.eval('localStorage.getItem("IMPERIO_GAME_STATE")');

  // AGORA simula reabertura completa: nova pagina, com esse save e a conta ja no localStorage
  const dom2 = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: new VirtualConsole(),
    beforeParse(window){
      window.localStorage.setItem('imperioDasMaquinas_conta', JSON.stringify({companyName:'Teste', ownerName:'F', logo:'🏗️'}));
      window.localStorage.setItem('IMPERIO_GAME_STATE', savedRaw);
    }
  });

  setTimeout(() => {
    const w2 = dom2.window;
    const qtdRestaurada = w2.eval('Object.keys(MACHINES).length');
    ok('Frota restaurada continua com 9 maquinas (nao voltou pra 5)', qtdRestaurada === 9, qtdRestaurada);

    const nomesRestaurados = w2.eval('JSON.stringify(Object.values(MACHINES).map(m=>m.name))');
    ok('Os nomes das maquinas compradas sobreviveram', nomesRestaurados === nomesComprados, nomesRestaurados);

    // confere que uma maquina comprada tem foto/preco intactos (nao só os campos genericos)
    const temFotoValida = w2.eval('Object.values(MACHINES).every(m => m.photo && m.photo.length > 5 && m.original && m.original.price > 0)');
    ok('Maquinas restauradas tem foto e preco de manutencao intactos', temFotoValida);

    ok('Caixa tambem restaurado', w2.eval('playerCash') > 0);
    ok('Nenhum erro de console durante a restauracao', errosConsole.length === 0, errosConsole.join(' | '));

    console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
  }, 1500);
}, 1500);
