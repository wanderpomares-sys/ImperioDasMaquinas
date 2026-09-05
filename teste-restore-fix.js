const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('/mnt/user-data/outputs/_PACOTE-GITHUB/index.html', 'utf8');
let pass=0, fail=0;
const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

const errosConsole = [];
const vc = new VirtualConsole();
vc.on('error', (...args) => errosConsole.push(args.join(' ')));
vc.on('jsdomError', e => errosConsole.push('JSDOM: ' + e.message));

const savedState = {
  versao: 3, playerCash: 342500, playerSedeNivel: 2, reputacao: 118,
  faturamentoAcumulado: 890000,
  acceptedContracts: [{ key:'aterro', name:'Contrato de teste em andamento', value:150000, prazoDias:12, diasDecorridos:5, progress:42, machineKeys:['escavadeira'], seguro:'completa', custoSeguroPago:5000, custoRiscoAdministrado:0, custoAtraso:0, state:'EM_ANDAMENTO', eventoAtivo:null }],
  historico: [{icon:'🔵', titulo:'Contrato aceito: teste', detalhe:'x', ts:Date.now()}],
  financiamentosAtivos: [{nome:'Escavadeira', parcela:3500, parcelasRestantes:10, diasParaProxima:15}]
};

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: vc,
  beforeParse(window){
    window.localStorage.setItem('imperioDasMaquinas_conta', JSON.stringify({companyName:'Construtora Teste', ownerName:'Fulano', logo:'🏗️'}));
    window.localStorage.setItem('IMPERIO_GAME_STATE', JSON.stringify(savedState));
  }
});

setTimeout(() => {
  const w = dom.window, d = w.document;

  console.log('=== ERROS DE CONSOLE/JSDOM DURANTE O CARREGAMENTO ===');
  console.log(errosConsole.length ? errosConsole.join('\n---\n') : '(nenhum)');
  ok('Nenhum erro de "antes da inicializacao" (zona morta temporal)', !errosConsole.some(e => e.includes('before initialization')));

  console.log('\n=== RESTAURACAO: valores batem com o que foi salvo, nao com o padrao (60000/etc) ===');
  ok('playerCash restaurado (nao ficou no padrao 60000)', w.eval('playerCash') === 342500, w.eval('playerCash'));
  ok('playerSedeNivel restaurado', w.eval('playerSedeNivel') === 2, w.eval('playerSedeNivel'));
  ok('reputacao restaurada', w.eval('reputacao') === 118, w.eval('reputacao'));
  ok('faturamentoAcumulado restaurado', w.eval('faturamentoAcumulado') === 890000);

  console.log('\n=== O CONTRATO EM ANDAMENTO NAO SUMIU (a causa mais grave do problema relatado) ===');
  ok('acceptedContracts tem o contrato salvo', w.eval('acceptedContracts.length') === 1);
  ok('progresso do contrato preservado', w.eval('acceptedContracts[0].progress') === 42);
  ok('dias decorridos preservados', w.eval('acceptedContracts[0].diasDecorridos') === 5);

  console.log('\n=== HISTORICO E FINANCIAMENTO TAMBEM PRESERVADOS ===');
  ok('historico restaurado', w.eval('historico.length') === 1);
  ok('financiamentosAtivos restaurado', w.eval('financiamentosAtivos.length') === 1);

  console.log('\n=== TELA DE LOGIN MOSTRA "JOGO RESTAURADO" ===');
  ok('Texto de login confirma restauracao', d.getElementById('loginCompanyName').textContent.includes('restaurado'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
