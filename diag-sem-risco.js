const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  w.eval('playerCash = 50000000; reputacao = 150;');

  const resultado = w.eval(`
    (function(){
      let tentativas = 0, aceitos = 0, noPrazo = 0, atrasado = 0, comAlertaAtraso = 0, semNenhumProblema = 0, erros = 0;
      const maxTentativas = 250;

      while(aceitos < 60 && tentativas < maxTentativas){
        tentativas++;
        Object.values(MACHINES).forEach(m => { if(!m.inContract) m.health = 100; });
        const key = Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine);
        if(!key) { regenerarContrato(Object.keys(CONTRACTS)[tentativas % Object.keys(CONTRACTS).length]); continue; }

        currentContractKey = key;
        selectedSeguro = 'completa'; // seguro completo = reduz MUITO a chance de risco, isola o efeito do sorteio diario
        try { acceptContract(); } catch(e){ erros++; continue; }
        const idx = acceptedContracts.length - 1;
        if(idx < 0 || !acceptedContracts[idx] || acceptedContracts[idx].key !== key){ continue; }
        aceitos++;
        fecharMensagemCliente();

        const historicoAntes = historico.length;
        let teveRisco = false;
        let seguranca = 0;
        try {
          while(acceptedContracts[idx] && seguranca < 300){
            if(acceptedContracts[idx].state === 'EM_RISCO'){
              teveRisco = true;
              const catalog2 = CONTRACTS[acceptedContracts[idx].key];
              const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
              resolverComOpcaoEngenharia(idx, opcoes[0].id);
            } else {
              avancarContrato(idx);
            }
            fecharMensagemCliente();
            seguranca++;
          }
        } catch(e){ erros++; continue; }

        const ultimo = completedContracts[completedContracts.length-1];
        if(!ultimo) continue;

        if(!teveRisco){
          semNenhumProblema++;
          if(!ultimo.noPrazo) atrasado++; else noPrazo++;
        }
      }
      return JSON.stringify({ aceitos, semNenhumProblema, noPrazo, atrasado, erros });
    })()
  `);
  console.log(resultado);
}, 1500);
