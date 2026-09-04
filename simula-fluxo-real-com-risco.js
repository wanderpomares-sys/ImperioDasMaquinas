const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  w.eval('playerCash = 50000000; reputacao = 150;');

  const resultado = w.eval(`
    (function(){
      let tentativas = 0, aceitos = 0, noPrazo = 0, atrasado = 0, perdidos = 0, erros = 0;
      const maxTentativas = 400;

      while(aceitos < 100 && tentativas < maxTentativas){
        tentativas++;
        Object.values(MACHINES).forEach(m => { if(!m.inContract) m.health = 100; });

        const key = Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine);
        if(!key) { regenerarContrato(Object.keys(CONTRACTS)[tentativas % Object.keys(CONTRACTS).length]); continue; }

        currentContractKey = key;
        selectedSeguro = 'nenhum';
        try { acceptContract(); } catch(e){ erros++; continue; }

        const idx = acceptedContracts.length - 1;
        if(idx < 0 || !acceptedContracts[idx] || acceptedContracts[idx].key !== key){ continue; }
        aceitos++;
        fecharMensagemCliente();

        const completedAntes = completedContracts.length;
        const perdidosAntes = lostContracts.length;

        let seguranca = 0;
        try {
          while(acceptedContracts[idx] && seguranca < 300){
            if(acceptedContracts[idx].state === 'EM_RISCO'){
              const catalog2 = CONTRACTS[acceptedContracts[idx].key];
              const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
              resolverComOpcaoEngenharia(idx, opcoes[0].id); // opcao MAIS CARA de verdade (indice 0)
            } else {
              avancarContrato(idx);
            }
            fecharMensagemCliente();
            seguranca++;
          }
        } catch(e){ erros++; continue; }

        // Verifica com precisao o que realmente aconteceu com ESTA tentativa especifica
        if(completedContracts.length > completedAntes){
          const ultimo = completedContracts[completedContracts.length-1];
          if(ultimo.noPrazo) noPrazo++; else atrasado++;
        } else if(lostContracts.length > perdidosAntes){
          perdidos++;
        }
      }
      return JSON.stringify({ tentativas, aceitos, noPrazo, atrasado, perdidos, erros });
    })()
  `);
  console.log(resultado);
}, 1500);
