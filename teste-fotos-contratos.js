const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  const total = w.eval('CONTRACT_POOL.length');
  ok('CONTRACT_POOL tem 40 arquetipos', total === 40, total);

  const chaves = w.eval('Object.keys(CONTRATO_IMG).length');
  ok('CONTRATO_IMG tem 39 chaves', chaves === 39, chaves);

  // Confere CADA UM dos 40 arquetipos individualmente
  const resultado = w.eval(`
    CONTRACT_POOL.map(c => ({
      nome: c.nome,
      photoOk: typeof c.photo === 'string' && c.photo.startsWith('data:image/jpeg;base64,') && c.photo.length > 1000,
      heroOk: typeof c.hero === 'string' && c.hero.startsWith('data:image/jpeg;base64,') && c.hero.length > 1000,
    }))
  `);
  let todosOk = true;
  resultado.forEach(r => {
    if (!r.photoOk || !r.heroOk) {
      todosOk = false;
      console.log(`  PROBLEMA em "${r.nome}": photo=${r.photoOk} hero=${r.heroOk}`);
    }
  });
  ok('Todos os 40 arquetipos tem photo E hero validos (base64 real)', todosOk);

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
