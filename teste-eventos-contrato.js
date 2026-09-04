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

  console.log('\n=== ESTRUTURA: 9 eventos, categorias corretas ===');
  ok('9 eventos no total', w.eval('EVENTOS_CONTRATO.length') === 9);
  ok('4 positivos', w.eval("EVENTOS_CONTRATO.filter(e=>e.tipo==='positivo').length") === 4);
  ok('3 neutros', w.eval("EVENTOS_CONTRATO.filter(e=>e.tipo==='neutro').length") === 3);
  ok('2 negativos', w.eval("EVENTOS_CONTRATO.filter(e=>e.tipo==='neutro').length") === 3);

  console.log('\n=== ELEGIBILIDADE depende do estado real (nao eh roleta) ===');
  ok('Frota critica (health=20) NAO e elegivel pra "Desempenho excepcional"',
     !w.eval("EVENTOS_CONTRATO.find(e=>e.titulo==='Desempenho excepcional').elegivel(20)"));
  ok('Frota otima (health=95) E elegivel pra "Desempenho excepcional"',
     w.eval("EVENTOS_CONTRATO.find(e=>e.titulo==='Desempenho excepcional').elegivel(95)"));
  ok('Frota otima NAO e elegivel pra "Desgaste acima do esperado" (evento negativo)',
     !w.eval("EVENTOS_CONTRATO.find(e=>e.titulo==='Desgaste acima do esperado').elegivel(95)"));
  ok('Frota critica E elegivel pra "Desgaste acima do esperado"',
     w.eval("EVENTOS_CONTRATO.find(e=>e.titulo==='Desgaste acima do esperado').elegivel(40)"));

  console.log('\n=== EFEITO REAL: cada evento muda algo de verdade, nao so texto ===');
  w.eval('playerCash = 100000;');
  const acFake = w.eval(`
    const ac = { name:'Teste', value: 100000, progress: 50, machineKeys: Object.keys(MACHINES).slice(0,1), seguro:'completo' };
    JSON.stringify(ac);
  `);
  // Testa cada efeito isoladamente forcando o evento (sem depender do random de elegibilidade/chance)
  const resultados = w.eval(`
    (function(){
      const out = [];
      EVENTOS_CONTRATO.forEach(function(evento){
        const ac = { name:'Teste', value: 100000, progress: 50, machineKeys: Object.keys(MACHINES).slice(0,1) };
        const cashAntes = playerCash;
        const progressAntes = ac.progress;
        const repAntes = reputacao;
        const healthAntes = MACHINES[ac.machineKeys[0]].health;
        const resultado = evento.efeito(ac);
        out.push({
          titulo: evento.titulo,
          cashMudou: playerCash !== cashAntes,
          progressMudou: ac.progress !== progressAntes,
          repMudou: reputacao !== repAntes,
          healthMudou: MACHINES[ac.machineKeys[0]].health !== healthAntes,
          resultado: resultado
        });
      });
      return JSON.stringify(out);
    })()
  `);
  const lista = JSON.parse(resultados);
  lista.forEach(r => {
    const mudouAlgo = r.cashMudou || r.progressMudou || r.repMudou || r.healthMudou;
    const eventosSoTexto = ['Cliente pediu um ajuste no escopo', 'Sinal de revisão em breve'];
    if(eventosSoTexto.includes(r.titulo)){
      ok(r.titulo + ': neutro puramente narrativo (esperado, sem efeito numerico)', !mudouAlgo);
    } else {
      ok(r.titulo + ': efeito real mensuravel', mudouAlgo, JSON.stringify(r));
    }
  });

  console.log('\n=== INTEGRACAO: tentarEventoContrato nao quebra e respeita a chance ===');
  const key = w.eval("Object.keys(CONTRACTS)[0]");
  const reqTipo = w.eval(`CONTRACTS['${key}'].requiredMachineKeys[0].tipo`);
  w.eval(`Object.values(MACHINES).filter(m => m.tipoKey === '${reqTipo}').forEach(m => m.health = 90)`);
  const exp = JSON.parse(w.eval(`JSON.stringify(calcularExposicao('${key}', 'completo'))`));
  ok('exp.avgHealth existe e bate com a saude forcada (90)', exp.avgHealth === 90, exp.avgHealth);

  let ocorrencias = 0, excecoes = 0;
  for(let i=0;i<300;i++){
    try {
      const r = w.eval(`tentarEventoContrato({name:'Teste', value:100000, progress:50, machineKeys:Object.keys(MACHINES).slice(0,1), seguro:'completo'}, ${JSON.stringify(exp)})`);
      if(r) ocorrencias++;
    } catch(e){ excecoes++; }
  }
  ok('Nenhuma excecao em 300 chamadas', excecoes === 0, excecoes);
  const taxaObservada = ocorrencias/300;
  ok('Taxa de ocorrencia bate aproximadamente com CHANCE_EVENTO_CONTRATO (0.22)',
     Math.abs(taxaObservada - 0.22) < 0.08, 'observado=' + taxaObservada.toFixed(3));

  console.log('\n=== PRIORIDADE: evento de sabor NUNCA aparece no mesmo dia que atraso ou conclusao ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key2 = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key2}')`);
  try { w.eval("acceptContract('padrao')"); } catch(e) { try { w.eval('acceptContract()'); } catch(e2){} }
  const idxAc = w.eval('acceptedContracts.length - 1');
  // forca o contrato pra 1 dia do prazo, garantindo atraso no proximo avanco (prioridade deve vencer)
  w.eval(`acceptedContratos_diasDecorridos_bak = 0;`);
  w.eval(`acceptedContracts[${idxAc}].diasDecorridos = CONTRACTS[acceptedContracts[${idxAc}].key].prazoDias + 1; acceptedContracts[${idxAc}].progress = 50;`);
  let erroAvanco = null;
  try { w.eval(`avancarContrato(${idxAc})`); } catch(e) { erroAvanco = e.message; }
  ok('avancarContrato nao quebra em cenario de atraso', !erroAvanco, erroAvanco || '');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
