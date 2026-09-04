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

  console.log('=== Confirma quantos arquetipos ficam ativos por vez (explica o sorteio) ===');
  const totalArquetipos = w.eval('CONTRACT_POOL.length');
  const slotsAtivos = w.eval('Object.keys(CONTRACTS).length');
  console.log('  CONTRACT_POOL tem ' + totalArquetipos + ' arquetipos; CONTRACTS (ativos agora) tem ' + slotsAtivos + ' slots');

  console.log('\n=== Testa abrirObra() diretamente para os 3 nomes, sem depender do sorteio ===');
  const casos = [
    { nome: 'Desmatamento Fazenda Boa Vista', arq: 'video-desmatamento.mp4' },
    { nome: 'Extração de Cascalho', arq: 'video-cascalho.mp4' },
    { nome: 'Remoção de Entulho de Obra', arq: 'video-entulho.mp4' }
  ];
  casos.forEach(c => {
    // injeta um contrato aceito sintetico so pra exercitar abrirObra() -> mesmo caminho de codigo
    // que qualquer contrato de verdade usaria (a funcao so olha ac.name e CONTRACTS[ac.key])
    w.eval(`
      const chaveExistente = Object.keys(CONTRACTS)[0];
      acceptedContracts.push({ key: chaveExistente, name: '${c.nome}', value: 1000, machineKeys: [] });
    `);
    const idx = w.eval('acceptedContracts.length - 1');
    w.eval(`abrirObra(${idx})`);
    const wrapHtml = d.getElementById('obraVideoWrap').innerHTML;
    ok(c.nome + ': video correto carregado', wrapHtml.includes(c.arq), wrapHtml.includes('<video') ? 'outro video/sem video' : 'sem tag video');
    ok(c.nome + ': atributos corretos (muted/loop/autoplay/playsinline)', 
       wrapHtml.includes('autoplay') && wrapHtml.includes('muted') && wrapHtml.includes('loop') && wrapHtml.includes('playsinline'));
    ok(c.nome + ': label do overlay mostra o nome certo', wrapHtml.includes(c.nome));
    w.eval('acceptedContracts.pop()'); // limpa pro proximo caso
  });

  console.log('\n=== Confirma que os arquivos de video existem fisicamente na pasta do jogo ===');
  const fs2 = require('fs');
  ['video-desmatamento.mp4','video-cascalho.mp4','video-entulho.mp4'].forEach(f => {
    ok(f + ' existe em 01-JOGO/', fs2.existsSync('/mnt/user-data/outputs/01-JOGO/' + f));
  });

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 2000);
