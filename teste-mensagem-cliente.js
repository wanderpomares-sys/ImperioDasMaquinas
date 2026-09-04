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

  console.log('\n=== ESTRUTURA: 6 contatos, todos com foto/nome/cargo ===');
  ok('6 contatos de cliente', w.eval('CONTATOS_CLIENTE.length') === 6);
  ok('Todos tem foto (URL http)', w.eval("CONTATOS_CLIENTE.every(c => c.foto && c.foto.startsWith('http'))"));
  ok('Todos tem nome e cargo preenchidos', w.eval("CONTATOS_CLIENTE.every(c => c.nome && c.cargo)"));
  ok('6 fotos distintas entre si', w.eval("new Set(CONTATOS_CLIENTE.map(c=>c.foto)).size") === 6);

  console.log('\n=== ACEITAR CONTRATO: mostra mensagem do cliente com foto, nao mais toast generico ===');
  w.eval('playerCash = 5000000; reputacao = 150;');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL')");
  w.eval(`openContractDetail('${key}')`);
  let erroAccept = null;
  try { w.eval("acceptContract()"); } catch(e) { erroAccept = e.message; }
  ok('acceptContract() executa sem excecao', !erroAccept, erroAccept || '');
  ok('Overlay de mensagem do cliente ABRIU', d.getElementById('mensagemClienteOverlay').style.display === 'flex');
  ok('Foto do cliente carregada no card', d.getElementById('msgClienteFoto').src.includes('pexels.com'));
  ok('Nome do cliente preenchido', d.getElementById('msgClienteNome').textContent.length > 0);
  ok('Balao de mensagem tem texto', d.getElementById('msgClienteBalao').textContent.length > 10);

  const idxAc = w.eval('acceptedContracts.length - 1');
  ok('Contrato aceito guardou o cliente sorteado', w.eval(`!!acceptedContracts[${idxAc}].cliente`));
  const clienteSalvo = w.eval(`acceptedContracts[${idxAc}].cliente.nome`);
  const clienteMostrado = d.getElementById('msgClienteNome').textContent;
  ok('Cliente mostrado no card e o mesmo salvo no contrato', clienteSalvo === clienteMostrado, clienteSalvo + ' vs ' + clienteMostrado);

  console.log('\n=== FECHAR A MENSAGEM: executa o callback (fecha detalhe, muda de aba) ===');
  w.eval('fecharMensagemCliente()');
  ok('Overlay fechou', d.getElementById('mensagemClienteOverlay').style.display === 'none');

  console.log('\n=== RISCO: reaparece o MESMO contato do aceite, nao um sorteio novo ===');
  w.eval(`acceptedContracts[${idxAc}].seguro = 'nenhum';`); // maximiza chance de risco pro teste
  let disparouRisco = false;
  for(let i=0;i<80 && !disparouRisco;i++){
    w.eval(`acceptedContracts[${idxAc}].state='EM_ANDAMENTO';`); // reseta caso o loop anterior tenha ido pra EM_RISCO sem eu checar
    w.eval(`avancarContrato(${idxAc})`);
    disparouRisco = w.eval(`acceptedContracts[${idxAc}] ? acceptedContracts[${idxAc}].state === 'EM_RISCO' : false`);
    if(w.eval(`!acceptedContracts[${idxAc}]`)) break; // contrato pode ter sido concluido/perdido no meio
  }
  ok('Situacao de risco disparou em ate 80 avancos', disparouRisco);
  if(disparouRisco){
    ok('Mensagem do cliente abriu para o risco', d.getElementById('mensagemClienteOverlay').style.display === 'flex');
    const nomeNoRisco = d.getElementById('msgClienteNome').textContent;
    ok('E o MESMO cliente do aceite (continuidade)', nomeNoRisco === clienteSalvo, clienteSalvo + ' vs ' + nomeNoRisco);
    ok('Mensagem de risco menciona o riskDesc do contrato', d.getElementById('msgClienteBalao').textContent.includes(catalogRiskDescCheck()));
  }

  function catalogRiskDescCheck(){
    return w.eval(`CONTRACTS[acceptedContracts[${idxAc}] ? acceptedContracts[${idxAc}].key : Object.keys(CONTRACTS)[0]].riskDesc || ''`);
  }

  console.log('\n=== FALLBACK: contrato sem cliente (injetado manualmente) nao quebra ===');
  w.eval(`acceptedContracts.push({ key: Object.keys(CONTRACTS)[0], name:'Teste sem cliente', value:1000, prazoDias:10, diasDecorridos:0, progress:0, machineKeys:[], seguro:'nenhum', custoSeguroPago:0, custoRiscoAdministrado:0, custoAtraso:0, state:'EM_ANDAMENTO', eventoAtivo:null });`);
  const idxSemCliente = w.eval('acceptedContracts.length - 1');
  let erroSemCliente = null;
  for(let i=0;i<30;i++){
    try { w.eval(`avancarContrato(${idxSemCliente})`); } catch(e){ erroSemCliente = e.message; break; }
    if(w.eval(`!acceptedContracts[${idxSemCliente}]`)) break;
  }
  ok('Contrato sem campo cliente nao quebra (usa fallback showResultModal)', !erroSemCliente, erroSemCliente || '');

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
