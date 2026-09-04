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

  w.eval('playerCash = 5000000; reputacao = 150;');

  let mk = null, idx = null, quebrou = false;

  console.log('\n=== FORCAR A QUEBRA: repete com contrato novo sempre que o atual concluir sem quebrar ===');
  const cashAntes0 = w.eval('playerCash');
  for(let ciclo = 0; ciclo < 12 && !quebrou; ciclo++){
    w.eval("goTo('contratos')");
    const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine)");
    if(!key) continue;
    w.eval(`openContractDetail('${key}')`);
    w.eval('acceptContract()');
    idx = w.eval('acceptedContracts.length - 1');
    if(idx < 0 || !w.eval(`acceptedContracts[${idx}]`)) continue;
    w.eval('fecharMensagemCliente()');
    w.eval(`acceptedContracts[${idx}].pedidoClienteOferecido = true;`);
    mk = w.eval(`acceptedContracts[${idx}].machineKeys[0]`);
    w.eval(`MACHINES['${mk}'].health = 20;`);

    for(let i=0; i<40 && !quebrou; i++){
      if(w.eval(`!acceptedContracts[${idx}]`)) break;
      if(w.eval(`acceptedContracts[${idx}].state`) === 'EM_RISCO'){
        w.eval(`
          const opcoes = OPCOES_ENGENHARIA[CONTRACTS[acceptedContracts[${idx}].key].tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
          resolverComOpcaoEngenharia(${idx}, opcoes[0].id);
        `);
      } else {
        const cashImediatamenteAntes = w.eval('playerCash');
        w.eval(`avancarContrato(${idx})`);
        quebrou = w.eval(`MACHINES['${mk}'].quebrada`) === true;
        if(quebrou) w.eval(`window.__cashAntesDaQuebra = ${cashImediatamenteAntes};`);
      }
    }
  }
  ok('Conseguiu forcar a quebra em ate 12 ciclos de contrato', quebrou);

  if(quebrou){
    ok('Custo emergencial foi debitado NA HORA da quebra (comparado ao instante imediatamente anterior)',
       w.eval('playerCash < window.__cashAntesDaQuebra'), w.eval('window.__cashAntesDaQuebra') + ' -> ' + w.eval('playerCash'));
    ok('Overlay dramatico de quebra abriu', d.getElementById('quebraOverlay').style.display === 'flex');
    ok('Nome da maquina certo no overlay', d.getElementById('quebraNomeMaquina').textContent === w.eval(`MACHINES['${mk}'].name`));
    ok('Destrocos foram gerados', d.getElementById('quebraDestrocos').children.length === 20);
    ok('Historico registrou a quebra', w.eval("historico.some(h => h.titulo.includes('quebrou'))"));

    w.eval('fecharQuebraMaquina()');
    ok('Fechar navega pra manutencao da maquina certa', w.eval('currentMaintKey') === mk);

    const detalheHtml = d.getElementById('manutDetailScroll').innerHTML;
    ok('Mostra bloco de reparo de emergencia', detalheHtml.includes('REPARO DE EMERGÊNCIA'));

    const custoEsperado = Math.round(w.eval(`MACHINES['${mk}'].original.price`) * 1.8);
    const cashAntesReparo = w.eval('playerCash');
    w.eval(`repararEmergencia('${mk}')`);
    ok('Reparo tira do estado quebrado', w.eval(`MACHINES['${mk}'].quebrada`) === false);
    ok('Custo do reparo correto', cashAntesReparo - w.eval('playerCash') === custoEsperado);
  }

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
