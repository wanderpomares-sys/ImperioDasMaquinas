const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

// Simula um jogador que ja tem save (localStorage com IMPERIO_GAME_STATE e a conta)
const dom = new JSDOM('<!DOCTYPE html><html></html>', { url: 'https://example.com/', runScripts: 'outside-only' });
dom.window.localStorage.setItem('imperioDasMaquinas_conta', JSON.stringify({companyName:'Teste', ownerName:'Fulano', logo:'🏗️'}));
dom.window.localStorage.setItem('IMPERIO_GAME_STATE', JSON.stringify({versao:3, playerCash:99999, acceptedContracts:[{key:'aterro',name:'teste'}]}));

const html = fs.readFileSync('/mnt/user-data/outputs/_PACOTE-GITHUB/index.html', 'utf8');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push(e.message));

const dom2 = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', virtualConsole: vc,
  beforeParse(window){
    window.localStorage.setItem('imperioDasMaquinas_conta', JSON.stringify({companyName:'Teste', ownerName:'Fulano', logo:'🏗️'}));
    window.localStorage.setItem('IMPERIO_GAME_STATE', JSON.stringify({versao:3, playerCash:99999, acceptedContracts:[{key:'aterro',name:'teste'}]}));
  }
});

setTimeout(() => {
  console.log('=== ERROS DE CARREGAMENTO (deve ter erro de TDZ se meu medo estiver certo) ===');
  console.log(errs.length ? errs.join('\n---\n') : '(nenhum erro)');
  console.log('\nplayerCash apos restaurar:', dom2.window.eval('typeof playerCash !== "undefined" ? playerCash : "SCRIPT MORREU"'));
}, 1500);
