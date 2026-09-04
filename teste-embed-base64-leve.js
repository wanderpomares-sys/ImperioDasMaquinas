const fs = require('fs');
const t0 = Date.now();
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
console.log('arquivo lido em ' + (Date.now()-t0) + 'ms, tamanho ' + html.length);
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const t1 = Date.now();
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
setTimeout(() => {
  console.log('dom pronto em ' + (Date.now()-t1) + 'ms');
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.join('\n') : '(nenhum)');

  console.log('\n=== ESTRUTURA DE DADOS (sem tocar no DOM pesado) ===');
  for (let i = 1; i <= 5; i++) {
    const foto = w.eval(`SEDES_DATA[${i}].foto`);
    ok('Sede ' + i + ' tem foto base64 valida', foto.startsWith('data:image/jpeg;base64,') && foto.length > 10000, foto.length + ' chars');
  }
  ['Desmatamento Fazenda Boa Vista','Extração de Cascalho','Remoção de Entulho de Obra'].forEach(n => {
    const url = w.eval(`VIDEO_POR_CONTRATO['${n}'].url`);
    ok(n + ' tem video base64 valido', url.startsWith('data:video/mp4;base64,') && url.length > 10000, url.length + ' chars');
  });

  console.log('\n=== LOGICA DE CAMPANHA (sessao 4) - sem renderizar tela ===');
  const s0 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Alvo inicial e Sede 2', s0.alvo === 2, s0.nome);
  ok('3 missoes na campanha 1', s0.totalMissoes === 3);
  w.eval('stats.contratosNoPrazo=3; maquinasComManutencaoRealizada.add("a"); maquinasComManutencaoRealizada.add("b"); faturamentoAcumulado=150000; reputacao=105; playerCash=200000; sincronizarMissoes();');
  const s1 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Pode comprar apos cumprir os 3 requisitos', s1.pode === true, JSON.stringify(s1));
  w.eval('comprarSede()');
  ok('Sede subiu para nivel 2', w.eval('playerSedeNivel') === 2);

  console.log('\n=== RENDER MINIMO (1 unica vez, tela leve) ===');
  const tRender = Date.now();
  let erro = null;
  try { w.eval("goTo('hub')"); } catch(e) { erro = e.message; }
  ok('goTo(hub) nao quebra', !erro, erro || ((Date.now()-tRender)+'ms'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam (total ' + (Date.now()-t0) + 'ms) ===');
}, 1500);
