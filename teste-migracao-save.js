const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html', 'utf8');
let pass=0, fail=0;
const ok = (l,c,e) => { c?pass++:fail++; console.log((c?'PASSA  ':'FALHA  ')+l+(e!==undefined?'  -> '+e:'')); };

function testarComSave(nome, saved, callback){
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: new VirtualConsole(),
    beforeParse(window){
      window.localStorage.setItem('imperioDasMaquinas_conta', JSON.stringify({companyName:'Teste', ownerName:'F', logo:'🏗️'}));
      window.localStorage.setItem('IMPERIO_GAME_STATE', JSON.stringify(saved));
    }
  });
  setTimeout(() => { console.log('\n=== ' + nome + ' ==='); callback(dom.window); }, 1200);
}

const saveFormatoAntigo = {
  versao: 3, playerCash: 200000,
  maquinas: {
    retro: { health: 82, status: 'green', inContract: false, quebrada: false, apelido: 'Bruta' },
    trator: { health: 100, status: 'green', inContract: false, quebrada: false, apelido: 'Titã' }
  }
};

const saveFormatoNovo = {
  versao: 3, playerCash: 300000,
  maquinas: {
    retro: { health: 60, status: 'amber', inContract: false, quebrada: false, apelido: 'Véia' },
    maquina_comprada_1: {
      name: 'Motoniveladora Comprada', tipoKey: 'motoniveladora', cat: 'Nivelamento',
      specs: 'X', photo: 'foto.jpg', thumb: 'thumb.jpg', health: 95, status: 'green',
      statusLabel: '🟢 OK', hours: '10h', utilizacao: 5, problem: 'Nenhum',
      original: { price: 5000, downtime: '2h', impact: 0, contract: null },
      alt: { price: 3000, downtime: '4h', impact: 0, contract: null },
      inContract: false, task: 'Disponível', location: 'Base',
      apelido: 'Nova', diasNaEmpresa: 3, contratosRealizados: 0, faturamentoGerado: 0, manutencoesFeitas: 0, quebrada: false
    }
  }
};

testarComSave('SAVE FORMATO ANTIGO (o que o usuario esta vivendo agora)', saveFormatoAntigo, (w) => {
  ok('Nome da retro NAO e undefined', w.eval('MACHINES.retro.name') === 'Retroescavadeira NH B110B', w.eval('MACHINES.retro.name'));
  ok('Foto da retro existe', w.eval('MACHINES.retro.thumb').length > 5);
  ok('Preco de manutencao existe (original.price)', w.eval('MACHINES.retro.original.price') > 0);
  ok('Saude salva foi aplicada por cima (82, nao o padrao)', w.eval('MACHINES.retro.health') === 82);
  ok('Apelido salvo foi aplicado por cima (Bruta, nao sorteado de novo)', w.eval('MACHINES.retro.apelido') === 'Bruta');
  ok('Trator tambem restaurado com nome certo', w.eval('MACHINES.trator.name') === 'Trator de Esteira D6T');

  testarComSave('SAVE FORMATO NOVO (com maquina comprada, sessao 34)', saveFormatoNovo, (w2) => {
    ok('Retro original ainda restaura certo (nome do template + saude do save)', 
       w2.eval('MACHINES.retro.name') === 'Retroescavadeira NH B110B' && w2.eval('MACHINES.retro.health') === 60);
    ok('Maquina COMPRADA restaura com nome completo (nao e undefined)', 
       w2.eval('MACHINES.maquina_comprada_1.name') === 'Motoniveladora Comprada');
    ok('Foto da maquina comprada restaurada', w2.eval('MACHINES.maquina_comprada_1.thumb') === 'thumb.jpg');
    ok('Preco de manutencao da maquina comprada restaurado', w2.eval('MACHINES.maquina_comprada_1.original.price') === 5000);
    ok('Total de maquinas e 6 (5 originais so que so 1 no save + 1 comprada = 2 no total esperado)', 
       w2.eval('Object.keys(MACHINES).length') === 2, w2.eval('Object.keys(MACHINES).length'));

    console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
  });
});
