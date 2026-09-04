# Império das Máquinas — Material para Avaliação Externa

**Objetivo deste documento:** dar a outra IA (ou avaliador humano) contexto suficiente para opinar com profundidade sobre o jogo — especialmente sobre a hipótese levantada pelo criador: *as telas estão estáticas demais e faltam gatilhos visuais que "provoquem" o jogador*.

Este documento descreve o que existe **de verdade no código**, não uma visão idealizada. Onde algo é fraco ou incompleto, está marcado como tal.

---

## 1. O que é o jogo

**Império das Máquinas** é um simulador de gestão de uma empresa de máquinas pesadas (terraplenagem, escavação, transporte), em português do Brasil, feito como PWA (Progressive Web App) — um único arquivo HTML autocontido, sem backend, rodando 100% no navegador do celular.

**Premissa central de design:** *"Risco não é sorte. É gestão."* — decisões do jogador (manutenção em dia, seguro, tipo de máquina, prazo aceito) devem influenciar de verdade a probabilidade de eventos ruins, não só a estética.

**Loop principal:**
1. Aceitar contratos de terraplenagem/escavação/transporte com máquinas da frota
2. Gerenciar risco (seguro, manutenção, prazo) enquanto o contrato roda
3. Faturar, pagar financiamentos, reinvestir em máquinas novas
4. Cumprir missões e acumular reputação + caixa para **comprar** a próxima Sede (sede maior = mais capacidade de frota)
5. Repetir em escala crescente até o nível máximo ("IMPÉRIO")

---

## 2. Sistemas implementados (funcionamento real)

### 2.1 Núcleo financeiro
- Caixa, financiamento de máquinas (entrada + parcelas + juros), impostos sobre contrato, multas por atraso/cancelamento
- Risco de evento ruim por contrato é calculado a partir de: tier de risco do contrato, seguro contratado, **condição média da frota usada** (`avgHealth`) — frota bem cuidada reduz a probabilidade de evento em até 3,5 pontos percentuais
- Auditado com testes automatizados (13 funções que mexem em caixa mapeadas; 15 cenários de dinheiro validados)

### 2.2 Máquinas e frota
- Cada máquina envelhece (`idadeDias`) e perde condição (`health`) com uso e ociosidade sem manutenção
- Idade afeta valor de revenda e (indiretamente, via média da frota) o risco dos contratos
- Manutenção pode ser feita "genérica" (peça avulsa) ou via **Oficina Parceira**

### 2.3 Oficinas Parceiras (6 marcas fictícias)
- Cada marca dá um bônus temporário (30 dias) ao usar a oficina — ex: -30% desgaste de pneus
- Gera "fidelidade" por marca (contador de usos)
- **Dívida técnica conhecida:** o bônus é gravado e aparece na tela (`✨ RoadForce Pneus`), mas **nenhum cálculo de desgaste/risco realmente o consome ainda**. É visual, não funcional. Isso está documentado e pendente.

### 2.4 Sedes — sistema de compra (não é desbloqueio automático)
5 níveis (do "Barraço" ao "IMPÉRIO"). Para comprar o próximo nível, o jogador precisa dos **3 requisitos simultâneos**:
- Completar todas as missões da campanha daquela sede
- Reputação mínima
- Caixa disponível (é debitado na compra)

A tela de Sedes mostra os 3 requisitos com barra de progresso individual e um botão que fica bloqueado/habilitado dinamicamente, explicando exatamente o que falta ("faltam 2 missão(ões) · faltam 5 de reputação · faltam R$120.000").

### 2.5 Campanhas de missão (17 missões, 4 campanhas)
- Cada sede-alvo tem sua própria campanha de 3 a 5 missões (ex: "complete 3 contratos de alto risco", "use uma Oficina Parceira 3 vezes")
- O progresso de cada missão é **derivado do estado real do jogo** (não um contador paralelo que pode dessincronizar)
- Recompensas em dinheiro ou reputação, resgatadas manualmente com um botão

### 2.6 Diário de notícias (sino no Hub)
- Sino com contador de não-lidas, que **balança fisicamente** quando há notícia pendente (animação CSS)
- 4 gatilhos: novo contrato disponível, sede conquistada, nova campanha de missões liberada, missão concluída
- Abrir o diário marca tudo como lido automaticamente

### 2.7 Loja
- 5 máquinas disponíveis para compra (à vista ou financiada, com aprovação por reputação mínima)
- Fotos recentemente trocadas para transmitir "máquina nova à venda" (antes eram fotos de ação em obra suja; uma delas reutilizava, por engano, a mesma imagem de uma máquina já desgastada da própria frota)

### 2.8 Outras telas
Contratos, Manutenção, Finanças — telas de gestão tradicionais com listas, valores e botões de ação.

---

## 3. Monetização — modelo planejado (nada disso está implementado no código ainda)

**Status:** Fase F do roadmap ("Monetização") não foi iniciada. Tudo abaixo é planejamento documentado em sessões anteriores, não código funcionando. Incluído aqui porque influencia diretamente decisões de design de tela (ex: onde entraria um botão de compra, onde apareceria uma marca).

**Restrição de design não-negociável, já fixada antes de qualquer plano de monetização:**
> **Dinheiro real nunca pode reduzir risco dentro do jogo, diretamente.**

Isso significa: nenhuma compra pode dar "menos chance de dar errado" no contrato. Compras podem dar velocidade, estética, conveniência ou conteúdo — nunca vantagem de risco. Qualquer sugestão de monetização do avaliador externo precisa respeitar essa linha.

### 3.1 Três pilares planejados

**Pilar 1 — Compras dentro do app (IAP)**
Conceito ainda não detalhado além do nome das categorias: cosméticos premium, aceleração de tempo (ex: pular tempo de manutenção/obra), e slots extras (mais vagas de contrato ou frota simultânea). Nenhuma mecânica de preço ou gatilho de tela foi desenhada ainda.

**Pilar 2 — Parceria de marcas (o mais desenvolvido dos três)**
Ideia: as 6 Oficinas Parceiras fictícias do jogo (RoadForce Pneus, SynthFlow Óleos, MegaParts Peças, PowerFuel Combustível, TechRep Serviços) seriam substituídas por marcas reais do setor (ex: Michelin, Shell, Caterpillar), cada uma patrocinando sua categoria de manutenção.
- O jogador **escolhe** usar a marca patrocinada em vez da opção genérica, porque ela dá um bônus real de gameplay melhor (menos desgaste, menos tempo parado) — a promessa de design é que "não é anúncio, é benefício que o jogador escolhe usar".
- Modelo de cobrança da marca real ao jogo: CPM (por impressão), CPA (por ação/fidelidade) ou híbrido dos dois.
- Métricas pensadas para reportar à marca: impressões, engajamento, fidelidade (repetição de escolha), impacto econômico gerado no jogo.
- Existe um whitepaper completo com esse plano, incluindo modelo de preço, processo de onboarding de marca e template de pitch comercial (arquivado no projeto, disponível sob pedido).

**Pilar 3 — Conteúdo premium**
Também só o nome das categorias existe: passe de temporada ("Battle Pass"), eventos sazonais, novas regiões/mapas para desbloquear. Sem detalhamento de mecânica.

### 3.2 Por que isso importa para quem for avaliar o dinamismo das telas
Os três pilares, quando implementados, vão precisar de **espaço visual e momentos de tela** que hoje não existem: um lugar para mostrar/vender cosméticos, uma forma de a marca patrocinada aparecer sem parecer anúncio forçado, um lugar para o passe de temporada. Isso é motivo a mais para resolver a "estaticidade" das telas agora — telas mais vivas e com mais linguagem visual tendem a acomodar monetização de forma mais orgânica do que telas puramente feitas de texto e barra de progresso.

---

## 4. Estado da interface — diagnóstico honesto

O criador do jogo relatou a sensação de que **as telas estão estáticas** e "não provocam a visão do jogador". Isso bate com o que o código mostra:

**O que existe de movimento/feedback hoje:**
- Confete e "sparkles" ao comprar uma máquina nova (único momento de celebração visual forte no jogo)
- Barra de progresso com preenchimento animado (transição CSS simples) em Sedes/Missões
- Brilho pulsante dourado ao redor da miniatura da "próxima sede" (sessão mais recente)
- Sino balançando quando há notícia (sessão mais recente)
- Toast (mensagem temporária) para confirmações — usado em 21 pontos do código

**O que não existe:**
- **Nenhum personagem ou voz guiando o jogador.** A tela inicial é só texto estático: título, um parágrafo de narrativa, e o valor do capital. Não há tutorial interativo, nem passo-a-passo, nem qualquer entidade (humana ou IA) "falando" com o jogador.
- Sem som (nem efeito, nem música)
- Sem transições entre telas (troca é instantânea, sem slide/fade)
- Sem micro-animações em números mudando (dinheiro muda de valor sem contagem, sem "pop")
- Sem indicação visual de "novidade" além do sino (ex: máquina recém-comprada não se destaca na lista, contrato novo não pisca antes de virar notícia)
- A grande maioria das telas é **texto + barra de progresso + card retangular** — visualmente repetitivo entre Sedes, Missões e Loja
- Fundo das telas é praticamente sempre a mesma cor escura sólida; as únicas fotos reais aparecem em Sedes, Loja e nos vídeos de obra (Manutenção → Oficina)

**Avaliação-síntese:** o jogo tem profundidade de sistema (economia, risco, progressão) mas quase nenhuma linguagem de jogo — os elementos que fazem um app "parecer jogo" (personagem, som, celebração proporcional ao tamanho da conquista, tensão visual, curiosidade) estão ausentes ou muito tímidos. A percepção de "estático" do criador é tecnicamente correta e verificável no código, não é só impressão.

---

## 5. Ideia em avaliação: um personagem/IA guiando o início

Proposta do criador: ter alguém (uma IA, personagem, mentor) orientando o jogador logo no começo — em vez do parágrafo estático atual na tela inicial.

**Pontos a favor (para o avaliador considerar):**
- Resolve o problema de onboarding zero hoje (o jogador cai direto na escolha de primeira máquina, sem nenhuma orientação sobre risco, financiamento, ou o que fazer primeiro)
- Personagem recorrente pode ser reaproveitado depois como "narrador" de eventos importantes (sede conquistada, missão concluída) — teria função dupla: tutorial + voz do diário de notícias
- Encaixa com a estética do jogo (empresa fictícia, ambientação de obra) — poderia ser um "mentor" ou "sócio" com nome e cara

**Pontos de atenção (para o avaliador considerar):**
- Custo de implementação: precisa de arte (rosto/avatar), texto escrito para múltiplos momentos, e lógica de quando aparecer sem virar irritante
- Risco de virar só "mais um popup" se não for bem escrito — o problema de fundo é falta de dinamismo visual geral, um personagem sozinho não resolve isso
- Precisa decidir: é só na primeira sessão (tutorial) ou reaparece ao longo do jogo?

---

## 6. Perguntas específicas para o avaliador opinar

1. A leitura de que o jogo é "sistema profundo, mas linguagem de jogo pobre" parece correta? O que priorizaria primeiro: som, animação de números, celebrações proporcionais, ou personagem-guia?
2. Vale a pena um personagem-mentor fixo, ou seria melhor investir em fazer os próprios sistemas existentes (sino, barras, sedes) reagirem mais (mais movimento, mais contraste) antes de adicionar um personagem novo?
3. Dado que é PWA leve sem backend, que tipo de dinamismo é viável sem virar peso técnico (ex: CSS puro vs. exigir imagens/vídeos novos)?
4. O jogo tem uma dívida técnica conhecida (bônus de Oficina visual mas não funcional) — isso deveria ser resolvido antes de investir em camada visual, ou pode esperar?
5. Existe algum padrão de jogo mobile (idle games, tycoons) que resolve bem esse problema de "telas de gestão" parecendo vivas, que valeria estudar como referência?
6. Sobre o pilar de parceria de marcas: a mecânica de "marca real dá bônus melhor que a opção genérica" é sustentável do ponto de vista de percepção do jogador, ou tende a parecer pay-to-win disfarçado mesmo respeitando a regra de "nunca reduz risco"? Onde fica a linha?
7. O plano de monetização tem 3 pilares mas só 1 foi de fato detalhado (marcas). Faz sentido priorizar IAP ou conteúdo premium antes, dado que dependem menos de fechar parceria externa e são mais rápidos de testar?
8. Existe tensão entre "resolver a estaticidade das telas" e "preparar espaço para monetização futura"? Ou as duas coisas podem ser resolvidas com o mesmo trabalho de design visual?

---

## 7. Contexto adicional (para não avaliar no vácuo)

- **Projeto tem 12 sessões de desenvolvimento registradas**, com testes automatizados cobrindo o núcleo financeiro, campanhas de sede, e o diário de notícias. Ver `REGISTRO.md` para histórico completo.
- **Roadmap original** era faseado (Auditoria → Playtest → Progressão → Ecossistema → Backend → Monetização → Lançamento). A Fase de auditoria formal está parcialmente feita; playtest humano real ainda não ocorreu.
- **Dívidas técnicas conhecidas** (não escondidas, documentadas): bônus de marca não afeta cálculo, multiplicador de risco por sede não é usado, limite de máquinas por sede não é aplicado.
- Este documento foi gerado a partir de leitura direta do código-fonte atual, não de memória de conversas anteriores.
