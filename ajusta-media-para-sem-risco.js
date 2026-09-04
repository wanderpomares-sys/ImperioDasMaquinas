const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  w.eval('playerCash = 50000000; reputacao = 150;');

  // Testa a formula diretamente sobrescrevendo temporariamente dentro do proprio avancarContrato,
  // via um multiplicador global que a formula vai ler -- mais simples: mede o efeito de diferentes
  // "min" mantendo spread 0.08, rodando o fluxo real (com desgaste de verdade, sem forcar risco).
  const candidatos = [0.965, 1.02, 1.06, 1.10, 1.14];
  candidatos.forEach(min => {
    // Reescreve a formula no proprio arquivo em memoria via eval, testando cada candidato
    w.eval(`window.__MIN_TESTE = ${min};`);
    const r = w.eval(`
      (function(){
        let aceitos = 0, noPrazo = 0, atrasado = 0, tentativas = 0;
        while(aceitos < 40 && tentativas < 150){
          tentativas++;
          Object.values(MACHINES).forEach(m => { if(!m.inContract) m.health = 100; });
          const key = Object.keys(CONTRACTS).find(k => CONTRACTS[k].state === 'DISPONIVEL' && CONTRACTS[k].hasMachine);
          if(!key) { regenerarContrato(Object.keys(CONTRACTS)[tentativas % Object.keys(CONTRACTS).length]); continue; }
          currentContractKey = key; selectedSeguro = 'completa';
          try { acceptContract(); } catch(e){ continue; }
          const idx = acceptedContracts.length - 1;
          if(idx < 0 || !acceptedContracts[idx] || acceptedContracts[idx].key !== key) continue;
          aceitos++; fecharMensagemCliente();
          let teveRisco = false, seguranca = 0;
          try {
            while(acceptedContracts[idx] && seguranca < 300){
              const ac = acceptedContracts[idx];
              if(ac.state === 'EM_RISCO'){
                teveRisco = true;
                const catalog2 = CONTRACTS[ac.key];
                const opcoes = OPCOES_ENGENHARIA[catalog2.tipoConsequencia] || OPCOES_ENGENHARIA.ambos;
                resolverComOpcaoEngenharia(idx, opcoes[0].id);
              } else {
                // aplica a formula MANUALMENTE aqui com o candidato, replicando avancarContrato mas
                // com o "min" de teste, pra nao precisar editar o arquivo a cada candidato
                const catalog = CONTRACTS[ac.key];
                const exp2 = calcularExposicao(ac.key, ac.seguro);
                const problema = Math.random() < exp2.prob;
                if(problema){ ac.state='EM_RISCO'; ac.eventoAtivo=catalog.riskDesc; }
                else {
                  const fator = calcularFatorProdutividade(ac, catalog);
                  ac.progress = Math.min(100, ac.progress + (100/catalog.prazoDias) * (window.__MIN_TESTE + Math.random()*0.08) * fator);
                  ac.diasDecorridos += 1;
                  envelhecerFrota(1);
                  if(ac.diasDecorridos > catalog.prazoDias && ac.state !== 'ATRASADO'){ ac.state='ATRASADO'; }
                  if(ac.progress >= 100){
                    completedContracts.push({ name: ac.name, noPrazo: ac.state !== 'ATRASADO' });
                    liberarMaquinas(ac.machineKeys);
                    acceptedContracts.splice(idx,1);
                    regenerarContrato(ac.key);
                  }
                }
              }
              seguranca++;
            }
          } catch(e){ continue; }
          if(!teveRisco){
            const ultimo = completedContracts[completedContracts.length-1];
            if(ultimo){ if(ultimo.noPrazo) noPrazo++; else atrasado++; }
          }
        }
        return JSON.stringify({ noPrazo, atrasado });
      })()
    `);
    console.log('min=' + min.toFixed(3) + ' (media=' + (min+0.04).toFixed(3) + ') -> ' + r);
  });
}, 1500);
