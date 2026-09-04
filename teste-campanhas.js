const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/home/claude/app-v6.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass = 0, fail = 0;
  const ok = (label, cond, extra) => {
    cond ? pass++ : fail++;
    console.log((cond ? 'PASSA  ' : 'FALHA  ') + label + (extra ? '  -> ' + extra : ''));
  };

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.slice(0, 5).join('\n') : '(nenhum)');

  console.log('\n=== 1. CAMPANHA INICIAL ===');
  const st0 = w.eval('JSON.stringify(statusCompraSede())');
  const s0 = JSON.parse(st0);
  ok('Alvo e a Sede 2', s0.alvo === 2, s0.nome);
  ok('Campanha tem 3 missoes', s0.totalMissoes === 3);
  ok('Nenhuma concluida no inicio', s0.missoesFeitas === 0);
  ok('Nao pode comprar ainda', s0.pode === false);
  ok('Requisito de reputacao existe', s0.req.reputacao === 105, 'rep=' + s0.req.reputacao);
  ok('Requisito de custo existe', s0.req.custo === 180000);

  console.log('\n=== 2. TELA DE MISSOES MOSTRA QUANTAS FALTAM ===');
  w.eval("goTo('missoes')");
  const mis = d.getElementById('missoesList').textContent;
  ok('Mostra "Campanha rumo a"', mis.includes('Campanha rumo a'));
  ok('Mostra nome da sede alvo', mis.includes('Garagem com Oficina'));
  ok('Informa quantas faltam', mis.includes('Faltam 3'), mis.match(/Faltam \d+ missao\(oes\)/) ? mis.match(/Faltam \d+ missao\(oes\)/)[0] : '?');
  ok('Lista as 3 missoes', mis.includes('Primeiras entregas') && mis.includes('Frota em dia') && mis.includes('Primeiro caixa'));
  ok('Informa reputacao e caixa exigidos', mis.includes('reputacao 105'));

  console.log('\n=== 3. TELA DE SEDES: 3 REQUISITOS + BOTAO ===');
  w.eval("goTo('sedes')");
  const sed = d.getElementById('sedeObjetivos');
  ok('Mostra requisito Missoes', sed.textContent.includes('Missoes da campanha'));
  ok('Mostra requisito Reputacao', sed.textContent.includes('Reputacao'));
  ok('Mostra requisito Caixa', sed.textContent.includes('Caixa disponivel'));
  ok('Botao de compra BLOQUEADO', sed.innerHTML.includes('disabled'));
  ok('Botao explica o que falta', sed.textContent.includes('faltam'), sed.textContent.match(/faltam[^<]*/) ? sed.textContent.match(/faltam[^<]*/)[0].slice(0, 60) : '?');

  console.log('\n=== 4. PROGREDIR MISSOES ===');
  w.eval('stats.contratosNoPrazo = 3; sincronizarMissoes();');
  ok('Missao de entregas concluida', w.eval("campanhaAtual().find(m=>m.id==='s2a').concluida") === true);
  ok('Agora faltam 2', JSON.parse(w.eval('JSON.stringify(statusCompraSede())')).missoesFaltam === 2);

  w.eval("maquinasComManutencaoRealizada.add('a'); maquinasComManutencaoRealizada.add('b'); faturamentoAcumulado = 150000; sincronizarMissoes();");
  const s1 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Todas as 3 missoes concluidas', s1.missoesOk === true, s1.missoesFeitas + '/' + s1.totalMissoes);
  ok('Ainda NAO pode comprar (falta rep e caixa)', s1.pode === false);

  console.log('\n=== 5. GATE DE REPUTACAO E DINHEIRO ===');
  w.eval('reputacao = 105;');
  const s2 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Reputacao OK, mas caixa nao', s2.repOk === true && s2.cashOk === false);
  ok('Compra bloqueada so pelo dinheiro', s2.pode === false);

  w.eval('comprarSede()');
  ok('comprarSede() recusa sem caixa', w.eval('playerSedeNivel') === 1, 'nivel=' + w.eval('playerSedeNivel'));

  console.log('\n=== 6. COMPRA EFETIVA ===');
  w.eval('playerCash = 250000;');
  w.eval("goTo('sedes')");
  ok('Botao agora HABILITADO', d.getElementById('sedeObjetivos').innerHTML.includes('COMPRAR SEDE'));
  const cashAntes = w.eval('playerCash');
  w.eval('comprarSede()');
  ok('Sede subiu para nivel 2', w.eval('playerSedeNivel') === 2);
  ok('Caixa foi debitado', w.eval('playerCash') === cashAntes - 180000, cashAntes + ' -> ' + w.eval('playerCash'));

  console.log('\n=== 7. NOVA CAMPANHA APARECE ===');
  const s3 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Alvo virou Sede 3', s3.alvo === 3, s3.nome);
  ok('Nova campanha tem 4 missoes', s3.totalMissoes === 4);
  w.eval("goTo('missoes')");
  const mis2 = d.getElementById('missoesList').textContent;
  ok('Missoes novas aparecem', mis2.includes('Encara o risco') && mis2.includes('Parceria de oficina'));
  ok('Missoes antigas sumiram', !mis2.includes('Primeiras entregas'));

  console.log('\n=== 8. RESGATE DE RECOMPENSA ===');
  w.eval('contratosTier3Completos = 1; sincronizarMissoes();');
  const cash2 = w.eval('playerCash');
  w.eval("resgatarMissao('s3a')");
  ok('Recompensa creditada', w.eval('playerCash') === cash2 + 15000);
  w.eval("resgatarMissao('s3a')");
  ok('Nao resgata duas vezes', w.eval('playerCash') === cash2 + 15000);

  console.log('\n=== 9. OFICINA ALIMENTA MISSAO s3b ===');
  const k = w.eval('Object.keys(MACHINES)')[0];
  w.eval("goTo('manutencao'); openMaintDetail('" + k + "'); abrirOficinas();");
  w.eval("selecionarOficina('road')");
  ok('Contador de oficina subiu', w.eval('stats.oficinasUsadas') === 1);
  ok('Missao s3b reflete o uso', w.eval("campanhaAtual().find(m=>m.id==='s3b').progresso") === 1);

  console.log('\n=== 10. NAVEGACAO GERAL ===');
  ['hub', 'maquinas', 'contratos', 'manutencao', 'financas', 'loja', 'sedes', 'missoes'].forEach(t => {
    let e = null;
    try { w.eval("goTo('" + t + "')"); } catch (ex) { e = ex.message; }
    ok('goTo(' + t + ')', !e, e || '');
  });

  console.log('\n=== 11. NIVEL MAXIMO ===');
  w.eval('playerSedeNivel = 5;');
  const s5 = JSON.parse(w.eval('JSON.stringify(statusCompraSede())'));
  ok('Detecta nivel maximo', s5.maximo === true);
  let e5 = null;
  try { w.eval("goTo('sedes'); goTo('missoes')"); } catch (ex) { e5 = ex.message; }
  ok('Telas nao quebram no maximo', !e5, e5 || '');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
  console.log('Erros de console: ' + (errs.length ? errs.slice(0, 5).join(' | ') : 'nenhum'));
}, 2000);
