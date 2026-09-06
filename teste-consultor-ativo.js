const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== Estado neutro (nada urgente): NUNCA mais fica em silencio ===');
  w.eval('playerCash = 100000; reputacao = 100; acceptedContracts.push({key:Object.keys(CONTRACTS)[0], machineKeys:[]});');
  let algumNull = false;
  for(let i=0;i<20;i++){
    const c = w.eval('gerarConselhoConsultor()');
    if(c === null) algumNull = true;
  }
  ok('Em 20 chamadas com estado neutro, nunca retornou null', !algumNull);

  console.log('\n=== Intervalo minimo caiu pra 45s ===');
  ok('INTERVALO_MIN_CONSELHO_MS agora e 45000', w.eval('INTERVALO_MIN_CONSELHO_MS') === 45000);

  console.log('\n=== Situacao urgente (maquina quebrada) continua tendo prioridade sobre dica generica ===');
  w.eval('Object.values(MACHINES)[0].quebrada = true;');
  const c2 = w.eval('gerarConselhoConsultor()');
  ok('Ainda prioriza a maquina quebrada, nao vira dica generica', c2.includes('quebrada'));

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
