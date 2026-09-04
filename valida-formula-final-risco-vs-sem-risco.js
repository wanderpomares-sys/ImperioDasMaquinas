const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  w.eval('playerCash = 50000000; reputacao = 150;');
  const r = w.eval(`
    (function(){
      let aceitos = 0, tentativas = 0;
      let semRiscoNoPrazo=0, semRiscoAtrasado=0, comRiscoNoPrazo=0, comRiscoAtrasado=0, perdidos=0;
      while(aceitos < 70 && tentativas < 250){
        tentativas++;
        Object.values(MACHINES).forEach(m => { if(!m.inContract) m.health = 100; });
        const key = Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine);
        if(!key) { regenerarContrato(Object.keys(CONTRACTS)[tentativas % Object.keys(CONTRACTS).length]); continue; }
        currentContractKey = key; selectedSeguro = 'nenhum'; // sem seguro, risco em condicoes normais (nao forcado nem evitado)
        try { acceptContract(); } catch(e){ continue; }
        const idx = acceptedContracts.length - 1;
        if(idx < 0 || !acceptedContracts[idx] || acceptedContracts[idx].key !== key) continue;
        aceitos++; fecharMensagemCliente();
        const completedAntes = completedContracts.length, perdidosAntes = lostContracts.length;
        let teveRisco = false, seguranca = 0;
        try {
          while(acceptedContracts[idx] && seguranca < 300){
            if(acceptedContracts[idx].state === 'EM_RISCO'){
              teveRisco = true;
              const catalog2 = CONTRACTS[acceptedContracts[idx].key];
              const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
              resolverComOpcaoEngenharia(idx, opcoes[0].id);
            } else { avancarContrato(idx); }
            fecharMensagemCliente(); seguranca++;
          }
        } catch(e){ continue; }
        if(completedContracts.length > completedAntes){
          const u = completedContracts[completedContracts.length-1];
          if(!teveRisco){ if(u.noPrazo) semRiscoNoPrazo++; else semRiscoAtrasado++; }
          else { if(u.noPrazo) comRiscoNoPrazo++; else comRiscoAtrasado++; }
        } else if(lostContracts.length > perdidosAntes){ perdidos++; }
      }
      return JSON.stringify({ semRiscoNoPrazo, semRiscoAtrasado, comRiscoNoPrazo, comRiscoAtrasado, perdidos });
    })()
  `);
  console.log(r);
}, 1500);
