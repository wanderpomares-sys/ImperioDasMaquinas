# 🏗️ Império das Máquinas

Jogo de estratégia e gestão de máquinas pesadas, ambientado no setor de terraplenagem/construção brasileiro. PWA (Progressive Web App) de arquivo único, sem backend, sem dependências externas.

**Filosofia central de design:** *"Risco não é sorte. É gestão."* — decisões do jogador (manutenção, seguro, tipo de máquina, prazo aceito) determinam de verdade a probabilidade de eventos ruins, não a estética.

---

## ▶️ Jogar

Acesse pelo [GitHub Pages deste repositório](../../) ou abra `index.html` diretamente em qualquer navegador — funciona offline depois do primeiro carregamento.

---

## 🎮 O que já existe (resumo — histórico completo em `03-PLANO/REGISTRO.md`)

- **Núcleo econômico:** contratos, financiamento de máquinas, seguro, risco calculado a partir de condição real da frota (auditado — ver `03-PLANO/AUDITORIA-FASE-A.md`)
- **Frota:** 5 máquinas iniciais com identidade própria — apelido, histórico de contratos realizados, faturamento gerado, manutenções feitas. Máquinas envelhecem, desgastam e podem quebrar de verdade em serviço (com consequência real na produtividade, não só cosmética)
- **Sedes:** 5 níveis, comprados (não desbloqueados de graça) — exige missões de campanha cumpridas + reputação mínima + caixa, simultaneamente
- **Oficinas Parceiras:** 6 marcas fictícias, cada uma com bônus real (desgaste, intervalo de manutenção, risco, custo) que expira de verdade após 30 dias
- **Contratos com personalidade:** a maioria comum, uma fração especial (bônus de reputação se cumprido no prazo) ou tentador (valor e risco inflados, com texto de expectativa)
- **Eventos dinâmicos durante o contrato:** positivos, neutros e negativos, com probabilidade ligada ao estado real da frota — mais uma decisão real de antecipação de prazo (aceitar com risco, recusar, ou reforçar com máquina extra)
- **Contratante com rosto:** 6 contatos fictícios com foto real, que mandam mensagem no aceite, no risco e na conclusão do contrato — sempre a mesma pessoa do início ao fim
- **Hub vivo:** painel de comando com caixa, frota, obras e próxima conquista sempre atualizados; alertas reais (nunca decorativos)
- **Diário de notícias:** sino que balança quando há novidade — contrato novo, missão concluída, sede conquistada

Este projeto é desenvolvido de forma incremental, sessão a sessão, cada uma documentada e testada antes de avançar para a próxima. **Todo o histórico de decisões — incluindo bugs encontrados, correções, e o porquê de cada escolha de design — está em `03-PLANO/REGISTRO.md`.** Não é changelog decorativo: é a fonte de continuidade do projeto entre sessões de trabalho.

---

## 📁 Estrutura do repositório

```
index.html              ← o jogo (arquivo único, servido pelo GitHub Pages)
app.html                 ← cópia idêntica, nome usado internamente durante o desenvolvimento
manifest.json            ← metadados do PWA (ícone, nome, cor)
sw.js                     ← service worker (cache offline)
icon-*-maskable.png      ← ícones do PWA

foto-sede-nivel-*.jpg    ← referência apenas — as fotos já vêm embutidas em base64 dentro do HTML
video-*.mp4              ← referência apenas — os vídeos já vêm embutidos em base64 dentro do HTML

03-PLANO/
  REGISTRO.md             ← histórico completo de desenvolvimento, sessão a sessão (leia isto primeiro)
  ROADMAP-GAMEFEEL.md      ← plano de trabalho em andamento
  GUIA-PLAYTEST.md         ← roteiro de teste humano (pendente de execução formal)
  teste-*.js               ← testes automatizados (Node + jsdom), um por funcionalidade validada

02-DADOS/
  *.json                   ← dados de referência (sedes, oficinas, missões, contratos)
```

**Nota sobre `foto-sede-nivel-*.jpg` e `video-*.mp4`:** o jogo não lê mais esses arquivos — desde que foram embutidos como base64 diretamente no HTML (decisão tomada depois que hospedagem de arquivo único via download direto no Android quebrava caminhos relativos), o `index.html` funciona sozinho, sem depender de nenhum arquivo de mídia externo. Os arquivos continuam aqui só como referência/backup.

---

## 🛠️ Stack técnica

HTML + CSS + JavaScript puro. Sem framework, sem build step, sem `node_modules`. Todo o estado do jogo persiste em `localStorage` do navegador — não há backend nem banco de dados (Fase E do roadmap original, ainda não iniciada).

---

## 🧪 Desenvolvimento e testes

Os testes em `03-PLANO/teste-*.js` rodam com Node.js + [jsdom](https://github.com/jsdom/jsdom), simulando o jogo num navegador headless — não são testes de unidade isolados, são simulações do fluxo real de jogo (aceitar contrato, avançar dias, resolver risco, comprar sede) usadas pra validar cada funcionalidade antes dela ser considerada pronta.

```bash
npm install jsdom
node 03-PLANO/teste-fumaca-final.js
```

---

## 📌 Status atual e próximos passos

Ver seção 3 (`PRÓXIMO PASSO`) de `03-PLANO/REGISTRO.md` — é sempre reescrita para refletir a decisão pendente do momento, não fica desatualizada.
