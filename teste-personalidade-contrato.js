const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });

setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  const key = Object.keys(w.eval('CONTRACTS'))[0];

  function regeneraAte(tipoAlvo, maxTentativas){
    for(let i=0;i<maxTentativas;i++){
      w.eval(`regenerarContrato('${key}')`);
      if(w.eval(`CONTRACTS['${key}'].personalidade`) === tipoAlvo) return true;
    }
    return false;
  }

  console.log('=== TENTADOR: sorteio real ate sair, confere valor/risco/texto sobrescritos ===');
  const achouTentador = regeneraAte('tentador', 60);
  ok('Conseguiu sortear um contrato tentador em ate 60 tentativas', achouTentador);
  if(achouTentador){
    ok('Risco forcado pra high', w.eval(`CONTRACTS['${key}'].risk`) === 'high');
    ok('riskLabel bate com "Muito Alto"', w.eval(`CONTRACTS['${key}'].riskLabel`) === 'Muito Alto');
    ok('Tem texto de expectativa preenchido', w.eval(`CONTRACTS['${key}'].textoPersonalidade`).length > 10);
    ok('Penalidade usa o risco FINAL (high = 0.008), nao o original do arquetipo', w.eval(`CONTRACTS['${key}'].penaltyPctDia`) === 0.008);

    console.log('\n=== VISUAL: badge de tentador aparece na lista e no detalhe ===');
    w.eval("goTo('contratos')");
    const listaHtml = d.getElementById('contratosList').innerHTML;
    ok('Badge "Tentador" aparece na lista', listaHtml.includes('🔥 Tentador'));
    w.eval(`openContractDetail('${key}')`);
    const detalheHtml = d.getElementById('contratoDetailScroll').innerHTML;
    ok('Bloco de oportunidade tentadora aparece no detalhe', detalheHtml.includes('Oportunidade tentadora'));
    ok('Texto de expectativa aparece no detalhe', detalheHtml.includes(w.eval(`CONTRACTS['${key}'].textoPersonalidade`)));
  }

  console.log('\n=== ESPECIAL: sorteio real ate sair ===');
  const achouEspecial = regeneraAte('especial', 60);
  ok('Conseguiu sortear um contrato especial em ate 60 tentativas', achouEspecial);
  if(achouEspecial){
    w.eval("goTo('contratos')");
    const listaHtml2 = d.getElementById('contratosList').innerHTML;
    ok('Badge "Especial" aparece na lista', listaHtml2.includes('⭐ Especial'));
    w.eval(`openContractDetail('${key}')`);
    const detalheHtml2 = d.getElementById('contratoDetailScroll').innerHTML;
    ok('Bloco de contrato especial aparece no detalhe', detalheHtml2.includes('Contrato especial'));
  }

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
