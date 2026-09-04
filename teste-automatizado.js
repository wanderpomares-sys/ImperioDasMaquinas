const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/home/claude/app-v5.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('JSDOM: ' + e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

setTimeout(() => {
  const w = dom.window, d = w.document;
  const ok = (label, cond, extra) =>
    console.log((cond ? 'PASSA  ' : 'FALHA  ') + label + (extra ? '  -> ' + extra : ''));

  console.log('=== ERROS DE CARREGAMENTO ===');
  console.log(errs.length ? errs.slice(0, 5).join('\n') : '(nenhum)');

  console.log('\n=== TESTE 1: SEDES ===');
  w.eval("goTo('sedes')");
  const heroBg = d.getElementById('sedeHero').style.backgroundImage;
  ok('Hero da sede tem FOTO real', heroBg.includes('unsplash'), heroBg.slice(0, 60));
  const obj = d.getElementById('sedeObjetivos').textContent;
  ok('Objetivos aparecem', obj.length > 20);
  ok('Sem "R$ R$" duplicado', !obj.includes('R$R$') && !obj.includes('R$ R$'), obj.replace(/\s+/g, ' ').trim().slice(0, 80));
  const lista = d.getElementById('sedesLista').innerHTML;
  ok('Os 5 niveis listados', (lista.match(/background-image/g) || []).length === 5);
  ok('Barra de progresso presente', obj.length > 0 && d.getElementById('sedeObjetivos').innerHTML.includes('width:'));

  console.log('\n=== TESTE 2: MISSOES (antes de usar oficina) ===');
  w.eval("goTo('missoes')");
  const mis1 = d.getElementById('missoesList').textContent;
  ok('Missoes do jogo aparecem', mis1.includes('Entregas no prazo'), mis1.replace(/\s+/g, ' ').trim().slice(0, 70));
  ok('Explica como comecar fidelidade', mis1.includes('Oficina Parceira'));

  console.log('\n=== TESTE 3: OFICINAS ACESSIVEIS ===');
  const chaves = w.eval('Object.keys(MACHINES)');
  const k = chaves[0];
  w.eval("goTo('manutencao'); openMaintDetail('" + k + "')");
  const detalhe = d.body.innerHTML;
  ok('Botao "Oficina Parceira" existe na manutencao', detalhe.includes('abrirOficinas()'));

  w.eval('abrirOficinas()');
  const modalVis = d.getElementById('oficinasModalOverlay').style.display;
  ok('Modal de oficinas abre', modalVis === 'flex', 'display=' + modalVis);
  ok('Lista as 6 oficinas', (d.getElementById('oficinasContent').innerHTML.match(/selecionarOficina/g) || []).length === 6);

  console.log('\n=== TESTE 4: USAR OFICINA -> GERA MISSAO ===');
  const cashAntes = w.eval('playerCash');
  const healthAntes = w.eval("MACHINES['" + k + "'].health");
  w.eval("selecionarOficina('road')");
  const cashDepois = w.eval('playerCash');
  const healthDepois = w.eval("MACHINES['" + k + "'].health");
  ok('Caixa foi descontado', cashDepois === cashAntes - 8000, cashAntes + ' -> ' + cashDepois);
  ok('Condicao da maquina melhorou', healthDepois > healthAntes, healthAntes + ' -> ' + healthDepois);
  ok('Fidelidade registrada', w.eval("fidelidadeMarcas['pneus']") === 1);
  ok('Bonus da marca ativo', Object.keys(w.eval('playerBonusAtivos')).length === 1);

  w.eval("goTo('missoes')");
  const mis2 = d.getElementById('missoesList').textContent;
  ok('Missao de fidelidade agora aparece', mis2.includes('PNEUS') && mis2.includes('1 de 10'));

  console.log('\n=== TESTE 5: MAQUINAS / ENVELHECIMENTO ===');
  w.eval("goTo('maquinas')");
  const maq = d.getElementById('maquinasList').textContent;
  ok('Lista de maquinas renderiza', maq.length > 50);
  ok('Mostra idade', maq.includes('Idade:'));
  ok('Mostra confiabilidade', maq.includes('Confiabilidade'));

  console.log('\n=== TESTE 6: DESBLOQUEIO DE SEDE ===');
  w.eval('playerPatrimonio = 200000; verificarDesbloqueioSedes();');
  ok('Sede sobe para nivel 2 ao bater a meta', w.eval('playerSedeNivel') === 2, 'nivel=' + w.eval('playerSedeNivel'));
  w.eval('playerPatrimonio = 700000; contratosTier3Completos = 1; verificarDesbloqueioSedes();');
  ok('Sede sobe para nivel 3 (patrimonio + tier3)', w.eval('playerSedeNivel') === 3, 'nivel=' + w.eval('playerSedeNivel'));
  w.eval("goTo('sedes')");
  ok('Tela de sedes reflete o novo nivel', d.getElementById('sedeNomeAtual').textContent === 'Sede Media' || d.getElementById('sedeNomeAtual').textContent.indexOf('Sede M') === 0, d.getElementById('sedeNomeAtual').textContent);

  console.log('\n=== TESTE 7: NAVEGACAO GERAL (sem quebrar) ===');
  ['hub', 'maquinas', 'contratos', 'manutencao', 'financas', 'loja', 'sedes', 'missoes'].forEach(t => {
    let erro = null;
    try { w.eval("goTo('" + t + "')"); } catch (e) { erro = e.message; }
    ok('goTo(' + t + ')', !erro, erro || '');
  });

  console.log('\n=== ERROS ACUMULADOS ===');
  console.log(errs.length ? errs.slice(0, 8).join('\n') : '(nenhum)');
}, 2000);
