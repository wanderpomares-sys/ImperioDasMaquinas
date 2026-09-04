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

  console.log('\n=== CENARIO REAL: primeira visita ao Hub (estabelece baseline) ===');
  w.eval("goTo('hub')");
  ok('Caixa mostra o valor correto de cara na primeira visita', d.getElementById('painelCaixaValor').textContent === w.eval('fmt(playerCash)'));

  console.log('\n=== SAI DO HUB, algo muda o caixa EM SEGUNDO PLANO (como o usuario realmente joga) ===');
  w.eval("goTo('contratos')"); // sai do hub
  const cashAntes = w.eval('playerCash');
  w.eval('playerCash += 200000; registrarHistorico("💰","Contrato concluido","teste");'); // dispara renderHubExtras() em segundo plano, hub NAO esta ativo
  ok('Hub nao esta ativo durante a mudanca', !d.getElementById('screen-hub').classList.contains('active'));

  console.log('\n=== VOLTA PRO HUB: a animacao PRECISA disparar agora (esse era o bug) ===');
  w.eval("goTo('hub')");
  const logoAoChegar = d.getElementById('painelCaixaValor').textContent;
  ok('Ao CHEGAR no Hub, o valor NAO esta direto no final (esta em transicao)', logoAoChegar !== w.eval('fmt(playerCash)'), logoAoChegar + ' (deveria mostrar algo entre ' + w.eval('fmt('+cashAntes+')') + ' e o valor novo)');

  setTimeout(() => {
    const final = d.getElementById('painelCaixaValor').textContent;
    ok('Depois de ~700ms, chega no valor final exato', final === w.eval('fmt(playerCash)'), final);

    console.log('\n=== SEGUNDO CICLO: sai, muda nos bastidores de novo, volta -- continua funcionando ===');
    w.eval("goTo('manutencao')");
    w.eval('playerCash += 75000; ajustarReputacao(3);'); // muda caixa E reputacao fora do hub
    w.eval("goTo('hub')");
    const logoAoChegar2 = d.getElementById('painelCaixaValor').textContent;
    ok('Segundo ciclo tambem anima ao chegar (nao ficou "gasto" so na primeira vez)', logoAoChegar2 !== w.eval('fmt(playerCash)'), logoAoChegar2);

    setTimeout(() => {
      const finalCash = d.getElementById('painelCaixaValor').textContent;
      const finalRep = d.getElementById('painelRepValor').textContent;
      ok('Caixa chega certo no segundo ciclo', finalCash === w.eval('fmt(playerCash)'));
      ok('Reputacao tambem chega certo no segundo ciclo', finalRep.includes(String(w.eval('reputacao'))));

      console.log('\n=== ENQUANTO PERMANECE NO HUB, mudanca tambem anima normalmente ===');
      w.eval('playerCash += 10000;'); // ainda no hub, dispara renderHubExtras via algum fluxo -- simula chamando direto
      w.eval('renderPainelComando();');
      const logoApos3 = d.getElementById('painelCaixaValor').textContent;
      ok('Mudanca com Hub already visivel tambem anima (nao trava so pra fora-e-volta)', logoApos3 !== w.eval('fmt(playerCash)'), logoApos3);

      console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
    }, 700);
  }, 700);
}, 1500);
