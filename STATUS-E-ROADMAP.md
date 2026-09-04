# Império das Máquinas — Status e Roadmap

**Revisão:** 01/09/2026
**Arquivo do jogo:** `01-JOGO/app.html` — esta é a única versão válida.

---

## 1. O que aconteceu (revisão honesta)

O projeto se espalhou. Havia **7 arquivos HTML** diferentes do jogo, cada um apresentado em algum momento como "a versão atual", e **32 documentos** de apoio com conteúdo sobreposto. Isso é a causa real da confusão dos últimos dias: não existia fonte única de verdade, então cada correção era aplicada numa cópia diferente.

Além disso, as funcionalidades de Sedes/Oficinas/Missões foram entregues como **código escrito mas nunca testado em execução**. Elas existiam no arquivo, mas não funcionavam no jogo.

Isso está resolvido agora. Estrutura nova:

```
01-JOGO/     app.html  ← o jogo. Só existe este.
02-DADOS/    JSONs de referência (sedes, oficinas, missões, contratos)
03-PLANO/    este documento + plano da Fase A
_arquivo/    tudo que era histórico (versões antigas, marketing, zips)
```

---

## 2. Por que Sedes e Missões não funcionavam

Rodei o jogo num navegador headless para descobrir, em vez de adivinhar. As causas reais:

| # | Problema | Causa real | Status |
|---|----------|-----------|--------|
| 1 | Sedes sem imagem | `SEDES_DATA.imagem` era uma cor hexadecimal (`#3A2230`), não uma foto. O hero renderizava um degradê escuro — funcionando como programado, mas vazio na prática. | Corrigido |
| 2 | Sem missões | `abrirOficinas()` estava **definida mas nunca chamada por nenhum botão**. Sem acesso às oficinas, `fidelidadeMarcas` ficava vazio para sempre, e a tela mostrava o estado vazio permanentemente. | Corrigido |
| 3 | Tela de Missões pobre | A tela ignorava o array `missoes` (m0–d1) que já existia e já funcionava no Hub. Mostrava apenas fidelidade de marca. | Corrigido |
| 4 | Objetivos sem clareza | Renderizavam, mas só como texto cru, com `R$ R$ 180.000` (o `fmt()` já adiciona "R$" e o template adicionava outro). Sem barra de progresso, não parecia um objetivo. | Corrigido |
| 5 | Oficina não fazia nada | `selecionarOficina()` descontava dinheiro e incrementava fidelidade, mas **não consertava a máquina**. Era dinheiro jogado fora. | Corrigido |

---

## 3. O que foi corrigido

- **Sedes com fotos reais** nos 5 níveis, em vez de cores sólidas. Níveis bloqueados aparecem em preto e branco.
- **Botão "🏭 Fazer em Oficina Parceira"** na tela de manutenção — é o acesso que faltava.
- **Oficina agora executa a manutenção de verdade:** recupera condição proporcional à eficiência da oficina, registra no histórico, conta para a missão "Frota em dia", ativa o bônus da marca e salva o jogo.
- **Tela de Missões reescrita** em dois blocos: objetivos da operação (com botão de resgatar recompensa) e fidelidade com marcas (com instrução de como começar, quando vazia).
- **Objetivos das Sedes** com barra de progresso por requisito e percentual geral.
- **Formatação de moeda** corrigida em toda a tela de Sedes.

**Validação:** 27 testes automatizados rodando o jogo de verdade — carregamento, navegação nas 8 telas, fluxo completo de oficina, desbloqueio de sedes nos níveis 2 e 3. Todos passando, nenhum erro de console.

---

## 4. Onde estamos no roadmap original

O roadmap continua o mesmo. A correção acima **não avança fase** — ela fecha a dívida da Fase D.

| Fase | Descrição | Status |
|------|-----------|--------|
| **A** | Auditoria e fechamento do núcleo | 🔴 **Não executada — bloqueador** |
| **B** | Playtest humano | 🔴 Depende de A |
| **C** | Progressão profunda (máquinas) | 🟡 Envelhecimento existe, mas é cosmético |
| **D** | Ecossistema (Sedes, Oficinas, Missões) | 🟢 **Funcionando + campanhas de sede** |
| **E** | Backend (Firebase) | 🔴 Não iniciado |
| **F** | Monetização | 🟡 Planejada em documento |
| **G** | Lançamento | 🔴 — |

### O ponto importante

A Fase D foi construída antes da Fase A. Isso foi um erro de sequência — construímos o segundo andar antes de auditar a fundação. **A Fase A continua sendo o próximo passo real**, e ela existe justamente para pegar bugs do tipo que acabamos de encontrar (custo que não desconta, tela que não reflete o estado).

O plano detalhado está em `03-PLANO/FASE-A-PLANO-EXECUTAVEL.md`.

---

## 5. Dívidas técnicas conhecidas

**Correção:** a versão anterior deste documento afirmava que o envelhecimento era cosmético. Auditando o código a fundo, isso **não procede** — `idadeDias` define o valor de mercado, `m.health` cai com uso e ociosidade, e a condição média da frota entra no cálculo de risco. A premissa do jogo está sustentada.

Dívidas que de fato permanecem:

1. **Bônus das marcas não afeta nada.** `playerBonusAtivos` é gravado e exibido, mas nenhum cálculo o consome. É a maior — esvazia a promessa das Oficinas Parceiras.
2. **`risco` da sede não é usado.** Cada sede tem multiplicador (1.2 a 0.85) que nenhum cálculo consome.
3. **`maxMaquinas` da sede não limita nada.** Dá para comprar quantas máquinas quiser no Barraço, o que tira parte do sentido de subir de sede.

## 6. Próximo passo

**Antes de qualquer coisa: testar o jogo.** Abra `01-JOGO/app.html` e confirme:

1. Aba **SEDES** → foto no topo, barra de progresso, os 5 níveis com miniatura
2. Aba **MISSÕES** → 5 objetivos da operação com barras de progresso
3. **MANUTENÇÃO** → escolher máquina → botão roxo "🏭 Fazer em Oficina Parceira"
4. Escolher **RoadForce Pneus** → condição da máquina sobe
5. Voltar em **MISSÕES** → aparece "🏆 PNEUS — 1 de 10"

Se os 5 passos funcionarem, a Fase D está fechada e partimos para a Fase A.

Se algum falhar, me diga **qual passo** e o que apareceu na tela — isso é suficiente, não precisa mexer no console.

---

## 7. Decisão pendente para você

Depois do teste, escolha o caminho:

- **A) Fase A (auditoria)** — o passo certo pelo roadmap. Fecha a fundação antes de construir mais.
- **B) Ligar as dívidas técnicas** — fazer bônus, envelhecimento e risco de sede afetarem o jogo de verdade. Mais gratificante de jogar, mas adia a auditoria de novo.

Minha recomendação é **A**. Os bugs desta semana foram exatamente o tipo que a Fase A pega, e adiar de novo tende a repetir o ciclo.
