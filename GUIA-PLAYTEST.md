# Guia de Playtest — Império das Máquinas

**Por que este documento existe:** a Fase B do roadmap original ("Playtest humano") nunca foi executada. Cinco sessões seguidas (15 a 19) adicionaram bastante coisa nova — eventos de contrato, mensagem de contratante com foto, Hub vivo, celebrações proporcionais — e nenhuma delas foi tocada por um jogador de verdade ainda. Tudo que existe hoje foi validado por teste automatizado (que prova que o código funciona como programado), não por teste humano (que prova se o resultado é *bom*). São coisas diferentes, e só a segunda responde a pergunta que importa.

**Duração sugerida:** 30 a 45 minutos, sessão única, sem pausa longa no meio (o objetivo é sentir o ritmo do jogo, uma pausa quebra isso).

**Como usar:** jogue seguindo o roteiro abaixo, anote reações no momento (não confie na memória pro final), e devolva as respostas junto com o arquivo `01-JOGO/app.html` — elas viram uma entrada no `REGISTRO.md` do jeito que todo o resto do projeto é documentado.

---

## Antes de começar

Abra `01-JOGO/app.html` num navegador de celular de verdade (não em desktop redimensionado — a experiência é desenhada pra tela pequena). Crie uma conta nova, não reaproveite uma sessão salva antiga.

---

## Roteiro (siga nessa ordem, é proposital)

### 1. Primeiros 5 minutos — primeiro contato
- Escolha sua primeira máquina e comece a operar
- Aceite o primeiro contrato disponível

**Pergunta:** Sem ninguém explicando nada, você entendeu o que precisava fazer? Em que momento (se algum) você ficou em dúvida sobre o que fazer a seguir?

### 2. Aceitar um contrato — a mensagem do contratante
Ao aceitar, aparece uma mensagem de uma pessoa (foto, nome, cargo).

**Perguntas:**
- Isso passou despercebido ou você realmente olhou pra foto/nome?
- Pareceu uma pessoa de verdade ou só decoração?
- Você fecharia essa mensagem mais rápido se pudesse, ou o ritmo tá bom?

### 3. Deixe pelo menos 1 contrato avançar até o fim
Acompanhe pelo painel "Em andamento" — repare no indicador de ritmo (🟢/🟡/🔴) que compara seu progresso real com o que era esperado até aquele dia.

**Perguntas:**
- Algum evento apareceu no meio do caminho (positivo, neutro ou de risco)? O que você sentiu quando apareceu?
- Se apareceu situação de risco: a decisão que você tomou pareceu ter peso de verdade, ou pareceu só um obstáculo artificial?
- O indicador de ritmo te avisou com antecedência se você ia terminar atrasado, ou a surpresa ainda apareceu só no final?
- Na conclusão: a mensagem de agradecimento + resumo financeiro fizeram sentido nessa ordem, ou você preferia só o resumo direto?
- Se o contrato atrasou: a multa cobrada e o motivo ficaram claros, ou pareceu confuso/injusto?

### 4. Abra o Hub depois de ter mexido em outras telas
Saia do Hub, mexa em Contratos/Manutenção por um tempo, volte pro Hub.

**Perguntas:**
- O painel de comando (caixa, frota, obras, próxima conquista) te disse algo útil de relance, ou você ignorou e foi direto pro que queria fazer?
- A variação de caixa ("desde sua última visita") fez sentido, ou confundiu?
- Teve algum alerta na fileira de alertas? Ele te fez ir resolver o problema, ou você ignorou?

### 5. Tente progredir rumo à próxima Sede
Veja a aba Missões e a aba Sedes.

**Perguntas:**
- Ficou claro o que falta pra comprar a próxima sede (missões + reputação + caixa)? Alguma das três parecia mais distante que as outras de um jeito frustrante?
- Se você chegou a comprar uma sede nesta sessão: a tela de evolução (foto antes/depois, confete) valeu o esforço de chegar lá, ou foi exagerada/insuficiente?

### 6. A pergunta mais importante de todas
**Depois desses 30-45 minutos, você genuinamente quer jogar mais 20 minutos agora, ou sente que já viu o suficiente?**

Não existe resposta certa aqui — é literalmente o critério que vai decidir se faz sentido continuar adicionando fase de game feel (Fase 2: tensão, contratos com personalidade) ou se o problema é outro, mais estrutural.

---

## Perguntas sobre um ponto específico já identificado

O jogo começa com R$60.000 de caixa. Nenhuma máquina da Loja é comprável à vista com esse valor — existe exatamente 1 caminho no início (financiar a retroescavadeira).

**Pergunta:** Você sentiu esse aperto como parte do desafio, ou como uma trava chata logo de cara? Chegou a tentar comprar outra coisa na Loja e ser recusado?

Separado disso: se você aceitou um contrato que precisava de um tipo de máquina que você não tinha na frota, o jogo deixou isso claro antes de você aceitar, ou só percebeu depois que a obra andava devagar demais?

---

## Bugs e estranhezas

Qualquer coisa que travou, pareceu errada, ou simplesmente não fez sentido — anote aqui, mesmo que pareça bobo. Formato livre:

```
O que aconteceu:
Em qual tela:
O que você esperava que acontecesse:
```

**Não precisa reportar** (já são limitações conhecidas, documentadas):
- Card de "Reputação" no painel de comando do Hub não anima como os outros números (cosmético, sem prioridade)
- Qualquer coisa relacionada a salvar o jogo funcionando estranho *especificamente* se você abrir o arquivo de um jeito incomum (ex: anexo de e-mail) — nesse caso, funcione normalmente pelo navegador do celular

---

## Depois do playtest

Junte as respostas das 6 seções + a nota sobre a Loja + a lista de bugs, e traga de volta. Isso vira a próxima entrada do `REGISTRO.md`, e a resposta da pergunta 6 decide o que vem depois: Fase 2 do roadmap de game feel, ajuste de balanceamento, ou outra coisa que só aparece jogando de verdade.
