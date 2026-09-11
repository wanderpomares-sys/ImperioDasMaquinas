const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const dom = new JSDOM(fs.readFileSync('/mnt/user-data/outputs/01-JOGO/app.html','utf8'), { runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:new VirtualConsole() });
setTimeout(() => {
  const w = dom.window;
  const chaves = w.eval('Object.keys(EVENTO_IMG)');
  console.log('Total de chaves:', chaves.length);
  console.log(chaves.join('\n'));

  // Extrai cada imagem base64 de volta pra arquivo, pra eu poder ver visualmente e confirmar
  const fs2 = require('fs');
  chaves.forEach(k => {
    const dataUrl = w.eval(`EVENTO_IMG['${k}']`);
    const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
    fs2.writeFileSync(`/home/claude/verificacao-final/${k}.jpg`, base64Data, 'base64');
  });
  console.log('\nImagens extraidas pra verificacao visual.');
}, 1500);
