const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== 13 eventos no total agora (9 antigos + 4 novos com foto) ===');
  ok('Total de eventos e 13', w.eval('EVENTOS_CONTRATO.length') === 13, w.eval('EVENTOS_CONTRATO.length'));
  ok('4 eventos tem campo img', w.eval("EVENTOS_CONTRATO.filter(e => e.img).length") === 4);

  console.log('\n=== Forcar cada evento com foto e conferir que a imagem aparece no modal ===');
  ['evento_time_feliz','evento_ferramenta_quebrada','evento_inspecao','evento_chuva_forte'].forEach(imgKey => {
    const evento = w.eval(`EVENTOS_CONTRATO.find(e => e.img === '${imgKey}')`);
    w.eval(`
      const ac = { name:'Teste', value:100000, progress:50, machineKeys:[] };
      const resultado = (${JSON.stringify(evento.efeito ? true : false)});
    `);
    // simula a exibicao direta (sem depender do sorteio de 22%)
    w.eval(`
      const evt = EVENTOS_CONTRATO.find(e => e.img === '${imgKey}');
      showResultModal(evt.icon, evt.titulo, evt.texto, null, evt.tipo === 'positivo' ? 'success' : null, false, evt.img ? EVENTO_IMG[evt.img] : null);
    `);
    const srcAtual = d.getElementById('resultModalImg').src;
    ok(`Imagem de "${imgKey}" aparece no modal`, srcAtual.includes('base64') && srcAtual.length > 100, srcAtual.slice(0,50));
    w.eval('closeResultModal()');
  });

  console.log('\n=== Evento SEM foto continua funcionando normal (nao quebrou nada) ===');
  w.eval(`
    const evt = EVENTOS_CONTRATO.find(e => !e.img);
    showResultModal(evt.icon, evt.titulo, evt.texto, null, null, false, evt.img ? EVENTO_IMG[evt.img] : null);
  `);
  ok('Imagem fica escondida quando o evento nao tem foto', d.getElementById('resultModalImg').style.display === 'none');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
