const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  w.eval("goTo('hub')");
  w.eval('ultimoCaixaExibido = 1000; playerCash = 2000; updateFinanceDisplays();');

  console.log('=== Logo apos chamar (0ms): ainda nao chegou no valor final (esta em transicao) ===');
  const logoApos = d.getElementById('hubCash').textContent;
  ok('Valor logo apos NAO e igual ao final ainda (prova que anima, nao salta)', logoApos !== 'R$ 2.000', logoApos);

  setTimeout(() => {
    console.log('\n=== Apos 700ms (animacao de 550ms ja devia ter terminado): valor final exato ===');
    const final = d.getElementById('hubCash').textContent;
    ok('Chegou no valor final exato', final === 'R$ 2.000', final);

    console.log('\n=== Reputacao tambem anima e trava no valor certo ===');
    w.eval("ajustarReputacao(10)");
    setTimeout(() => {
      const repFinal = d.getElementById('hubReputacao').textContent;
      ok('Reputacao final bate (110/150)', repFinal.includes('110'), repFinal);
      console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
    }, 700);
  }, 700);
}, 1500);
