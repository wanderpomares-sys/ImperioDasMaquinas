# Roadmap de Game Feel — "Ciclo de Tensão e Recompensa"

**Origem:** avaliação externa solicitada pelo criador em cima de `MATERIAL-AVALIACAO-EXTERNA.md`, sessão 14. Este documento traduz aquela avaliação em plano executável, na mesma lógica de fases já usada no projeto (ver `FASE-A-PLANO-EXECUTAVEL.md`).

**Mudança de direção decidida:** o problema do jogo não é falta de conteúdo — é apresentação e ritmo. Não se persegue "vício" por volume de notificação; persegue-se a sensação de "só mais um contrato", que nasce do próprio objetivo do jogo. Isso vira o critério de aceite de qualquer feature nova: **ela aproxima o jogador de "só mais um contrato" ou só adiciona ruído?**

**Ciclo-alvo**, substituindo o ciclo atual (contrato → espera → dinheiro → próximo contrato):

```
Oportunidade → decisão → tensão → acontecimento → consequência → recompensa → nova oportunidade
```

---

## Ordem de execução (a ordem importa, não é wishlist)

### 🔴 Fase 0 — Pré-requisito inegociável: parar de prometer o que o sistema não cumpre

Antes de qualquer camada de evento/animação nova, fechar as 3 dívidas técnicas já documentadas em `AUDITORIA-FASE-A.md` e `REGISTRO.md`:

1. Bônus de Oficina Parceira (`playerBonusAtivos`) passa a afetar de verdade o cálculo de desgaste/risco — hoje só aparece como texto (`✨ RoadForce Pneus`)
2. Multiplicador de risco por sede (`SEDES_DATA[n].risco`, 1.2 → 0.85) passa a entrar no cálculo de probabilidade de evento — hoje existe e nunca é lido
3. Limite de máquinas por sede (`maxMaquinas`) passa a bloquear a compra além da capacidade — hoje é só texto informativo

**Por quê primeiro:** qualquer evento novo ("Oficina RoadForce reduziu seu desgaste") que não bata com o que o sistema realmente faz destrói a confiança do jogador num simulador — que é o produto que se está vendendo. Consertar isso é rápido (já está localizado por linha) e destrava a Fase 1 sem gambiarra.

**Status:** iniciado na sessão 14 (ver REGISTRO.md).

---

### 🔴 Fase 1 — Transformar gestão em jogo

1. **Eventos dinâmicos durante o contrato** — o motor de risco já existe (tier de contrato + seguro + condição da frota); falta *apresentar* o resultado como acontecimento narrado, não só como número final. Eventos positivos, neutros e negativos, com texto e ícone, aparecendo durante o andamento do contrato (hoje o contrato já tem estados `EM_ANDAMENTO`/`EM_RISCO`/`ATRASADO` — a apresentação de "acontecimento" pode se apoiar nisso).
2. **Hub vivo** — substituir o hub informativo por um painel de comando: caixa com variação do dia, status da frota (verde/amarelo/vermelho), obras em andamento por status, alerta em destaque, "próxima conquista" com % e o que falta.
3. **Microanimações** — dinheiro contando (não pulando direto pro valor novo), reputação subindo, item novo entrando na lista com destaque, alerta pulsando.
4. **Feedback proporcional ao tamanho da conquista** — hoje só existe um nível de celebração (confete na compra de máquina). Criar pelo menos 3 níveis: pequena (missão), média (contrato de risco concluído, obra concluída), grande (sede nova — tela cheia, mostra "Barraço → Regional").

### 🟠 Fase 2 — Criar tensão

5. Decisões durante o contrato (ex: cliente pede antecipação — aceitar com bônus e mais risco, recusar, ou reforçar com máquina extra a um custo)
6. Eventos positivos/negativos derivados do estado real da empresa, não de sorteio solto — condição de frota alta + seguro + contrato médio deve fazer evento grave ser raro de verdade; condição baixa + sem seguro + alto risco deve ser visivelmente perigoso
7. Contratos com personalidade: comum, especial (bônus de reputação), tentador (valor alto, risco muito alto, texto que cria expectativa)
8. Consequências visíveis — máquina quebrada de verdade reduz capacidade de operar, não só um número na ficha

### 🟡 Fase 3 — Criar apego

9. Identidade das máquinas — histórico (dias de empresa, contratos realizados, faturamento gerado, manutenções feitas), não só idade/condição
10. Marcos e conquistas da empresa (10 contratos, R$1 milhão faturado, primeira máquina paga, etc.) — não necessariamente como troféus formais; podem desbloquear título, emblema ou opção nova
11. Mentor — aparece em momentos específicos (primeira decisão grande, contrato de risco alto, recusa de contrato), depois some. Função dupla: onboarding + voz do diário de notícias. Não é tutorial passo-a-passo nem popup constante.
12. Diário de notícias mais vivo — a mecânica (sino, contador, 4 gatilhos) já existe desde a sessão 11; falta ele virar central de acontecimento em vez de lista plana

### 🟢 Fase 4 — Polimento

13. Sons (motor, dinheiro, alerta, confirmação, conquista)
14. Transições entre telas (hoje é troca instantânea)
15. Identidade visual — menos "dashboard empresarial", mais central de comando de obra

---

## O que fica explicitamente para depois

Monetização (IAP, marcas, conteúdo premium) continua fora de escopo até este roadmap avançar. Critério de retomada, nas palavras da avaliação: **"depois de jogar 20 minutos, a pessoa quer jogar mais 20?"** — se a resposta ainda for não, monetização não é o próximo passo.

---

## Como isso se encaixa no roadmap original (A–G)

Este roadmap de game feel não substitui as Fases A–G originais — ele se insere **dentro** da Fase C (Progressão) e D (Ecossistema), que já estavam parcialmente feitas mas carentes de apresentação. A Fase A (auditoria formal completa) e o playtest humano real continuam pendentes e podem rodar em paralelo ou depois — não são bloqueadas por isto nem bloqueiam isto.
