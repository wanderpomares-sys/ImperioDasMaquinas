const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
const erros = [];
vc.on('jsdomError', e => erros.push(e.message));
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:vc });
setTimeout(() => {
  const w = dom.window, d = w.document;
  let pass=0, fail=0;
  const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

  console.log('=== JOGO NOVO DE VERDADE: cria empresa do zero ===');
  w.eval(`
    companyName = 'Teste Ltda'; ownerName = 'Teste';
    selectedLogo = LOGO_OPTIONS[0];
    confirmSignup();
  `);
  console.log('Caixa inicial:', w.eval('playerCash'));
  console.log('Reputacao inicial:', w.eval('reputacao'));
  console.log('Quantas maquinas no inicio:', w.eval('Object.keys(MACHINES).length'));

  console.log('\n=== Aceita o primeiro contrato disponivel ===');
  w.eval("goTo('contratos')");
  const key = w.eval("Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine)");
  ok('Achou contrato cumprivel', !!key, key);
  w.eval(`openContractDetail('${key}')`);
  w.eval('acceptContract()');
  const idx = w.eval('acceptedContracts.length - 1');
  w.eval('fecharMensagemCliente()');
  console.log('Maquinas desse contrato:', JSON.stringify(w.eval(`acceptedContracts[${idx}].machineKeys`)));

  console.log('\n=== Quebra TODAS as maquinas desse contrato, gasta o caixa quase todo ===');
  w.eval(`acceptedContracts[${idx}].machineKeys.forEach(k => { MACHINES[k].quebrada = true; MACHINES[k].health = 10; });`);
  w.eval('playerCash = 2000;'); // bem pouco, mas positivo

  console.log('\n=== Renderiza a tela de contratos em andamento -- o botao de cancelar aparece? ===');
  w.eval("goTo('contratos')");
  w.eval('renderContratosAndamento()');
  const htmlAndamento = d.getElementById('listaContratosAndamento') ? d.getElementById('listaContratosAndamento').innerHTML : '(elemento nao encontrado -- verificando outro id)';
  console.log('Elemento existe?', !!d.getElementById('listaContratosAndamento'));

  console.log('\n=== Vai pra tela de Administracao -- botao de emprestimo aparece e funciona? ===');
  w.eval("goTo('financas')");
  w.eval('renderFinancas()');
  const temBotaoEmprestimo = w.eval(`document.body.innerHTML.includes('Solicitar empréstimo') || document.body.innerHTML.includes('emprestimo')`);
  ok('Texto relacionado a emprestimo aparece em algum lugar da pagina', temBotaoEmprestimo);

  const onclickEmprestimo = w.eval(`
    const btns = Array.from(document.querySelectorAll('button, div[onclick]'));
    const achado = btns.find(b => b.textContent.includes('empréstimo') || b.textContent.includes('Empréstimo'));
    achado ? achado.getAttribute('onclick') : 'NAO ACHOU NENHUM ELEMENTO CLICAVEL COM TEXTO EMPRESTIMO'
  `);
  console.log('onclick do elemento de emprestimo encontrado:', onclickEmprestimo);

  console.log('\n=== Tenta executar o fluxo de emprestimo de verdade, do jeito que o botao chamaria ===');
  try {
    const cashAntes = w.eval('playerCash');
    w.eval('abrirSolicitacaoEmprestimo()');
    console.log('abrirSolicitacaoEmprestimo executou sem erro');
  } catch(e) {
    console.log('ERRO ao chamar abrirSolicitacaoEmprestimo:', e.message);
  }

  console.log('\n=== Mesma coisa pro botao de cancelar contrato ===');
  w.eval("goTo('contratos')");
  const onclickCancelar = w.eval(`
    const btns = Array.from(document.querySelectorAll('button, div[onclick]'));
    const achado = btns.find(b => b.textContent.includes('Cancelar contrato'));
    achado ? achado.getAttribute('onclick') : 'NAO ACHOU BOTAO DE CANCELAR'
  `);
  console.log('onclick do botao cancelar:', onclickCancelar);

  console.log('\nErros JSDOM capturados:', erros.length ? erros.join(' | ') : '(nenhum)');
  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
}, 1500);
