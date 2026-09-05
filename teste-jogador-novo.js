const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/_PACOTE-GITHUB/index.html', 'utf8');
let pass=0, fail=0;
const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };
const errosConsole = [];
const vc = new VirtualConsole();
vc.on('error', (...args) => errosConsole.push(args.join(' ')));

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  console.log('=== Erros durante carregamento (jogador novo, sem save nenhum) ===');
  console.log(errosConsole.length ? errosConsole.join('\n') : '(nenhum)');
  ok('Nenhum erro no carregamento', errosConsole.length === 0);
  ok('Tela de cadastro (signup) aparece pra jogador novo, nao login', d.getElementById('screen-signup').classList.contains('active'));
  ok('playerCash comeca no valor padrao 60000', w.eval('playerCash') === 60000);
  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
