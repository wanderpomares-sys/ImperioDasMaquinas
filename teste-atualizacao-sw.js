const { chromium } = require('playwright');
const { spawn } = require('child_process');

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

(async () => {
  let pass = 0, fail = 0;
  const ok = (l, c, e) => { c ? pass++ : fail++; console.log((c ? 'PASSA  ' : 'FALHA  ') + l + (e !== undefined ? '  -> ' + e : '')); };

  // Sobe o servidor servindo a v1 (marcada com titulo distinto)
  const servidor = spawn('node', ['/home/claude/servidor-cache-teste.js', '/home/claude/servidor-teste']);
  servidor.stdout.on('data', d => console.log('[srv]', d.toString().trim()));
  await wait(800);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('=== PASSO 1: carrega a v1 pela primeira vez, service worker registra ===');
  await page.goto('http://localhost:8934/', { waitUntil: 'load' });
  await wait(1500); // da tempo do SW registrar e instalar
  const tituloV1 = await page.title();
  ok('Titulo mostra a versao 1 (marcador de teste)', tituloV1.includes('VERSAO-ANTIGA-1'), tituloV1);

  const swAtivo1 = await page.evaluate(() => navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null);
  ok('Service worker esta registrado e controlando a pagina', !!swAtivo1, swAtivo1);

  console.log('\n=== PASSO 2: troca o servidor pra v2, SEM reiniciar o navegador, SEM limpar nada manualmente ===');
  await fetch('http://localhost:8934/__trocar-versao__');
  await wait(500);

  console.log('\n=== PASSO 3: simula o app voltando ao primeiro plano (visibilitychange) — e o codigo deve pedir atualizacao sozinho ===');
  try {
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  } catch(e){
    console.log('  (pagina ja estava recarregando sozinha nesse instante — isso e um bom sinal, nao um erro)');
  }

  console.log('\n=== PASSO 4: espera o ciclo de atualizacao do service worker rodar (instalar -> ativar -> recarregar sozinho) ===');
  // espera a pagina recarregar sozinha (o listener de controllerchange chama location.reload())
  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  await wait(2000);

  const tituloFinal = await page.title().catch(() => '(erro ao ler titulo)');
  ok('Depois de esperar, o titulo MUDOU pra versao nova, SEM eu limpar cache manualmente', 
     tituloFinal === 'Império das Máquinas — App', tituloFinal);

  const swAtivo2 = await page.evaluate(() => navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null).catch(() => '(erro ao ler)');
  console.log('  service worker controlando agora:', swAtivo2);

  await browser.close();
  servidor.kill();

  console.log('\n=== RESULTADO: ' + pass + ' passaram, ' + fail + ' falharam ===');
  process.exit(fail > 0 ? 1 : 0);
})();
