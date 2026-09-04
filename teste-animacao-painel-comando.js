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

  console.log('\n=== PRIMEIRO RENDER: mostra o valor direto (sem valor antigo pra animar de) ===');
  w.eval("goTo('hub')");
  ok('Caixa do painel tem ID estavel', !!d.getElementById('painelCaixaValor'));
  ok('Reputacao do painel tem ID estavel', !!d.getElementById('painelRepValor'));
  ok('Caixa mostra o valor correto de cara', d.getElementById('painelCaixaValor').textContent === w.eval('fmt(playerCash)'));

  console.log('\n=== SEGUNDO RENDER (valor mudou): NAO salta direto, esta em transicao ===');
  w.eval('playerCash += 100000;');
  w.eval('renderPainelComando();');
  const logoApos = d.getElementById('painelCaixaValor').textContent;
  ok('Logo apos mudar o valor, o texto NAO e o valor final ainda (esta animando)', logoApos !== w.eval('fmt(playerCash)'), logoApos);

  setTimeout(() => {
    console.log('\n=== APOS A ANIMACAO TERMINAR (~700ms): chega no valor exato ===');
    const final = d.getElementById('painelCaixaValor').textContent;
    ok('Caixa do painel chegou no valor final exato', final === w.eval('fmt(playerCash)'), final);

    console.log('\n=== REPUTACAO: mesmo comportamento ===');
    w.eval('ajustarReputacao(10);');
    setTimeout(() => {
      const repFinal = d.getElementById('painelRepValor').textContent;
      ok('Reputacao do painel anima e chega no valor certo', repFinal.includes(String(w.eval('reputacao'))), repFinal);

      console.log('\n=== RENDER REPETIDO SEM MUDANCA: nao fica re-animando a toa ===');
      const antesRepetido = d.getElementById('painelCaixaValor').textContent;
      w.eval('renderPainelComando();'); // mesmo valor de playerCash, nao devia disparar nova transicao visivel
      const logoApos2 = d.getElementById('painelCaixaValor').textContent;
      ok('Render sem mudanca de valor mantem o texto estavel', logoApos2 === antesRepetido, antesRepetido + ' vs ' + logoApos2);

      console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
    }, 700);
  }, 700);
}, 1500);
