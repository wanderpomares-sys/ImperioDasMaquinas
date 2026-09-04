# Fase A — Relatório de Auditoria

**Data:** 01/09/2026 (sessão 5)
**Método:** execução real do jogo em navegador headless (jsdom), não inspeção visual do código. Todo teste que "passou" rodou de verdade; todo achado foi verificado na origem antes de virar conclusão.
**Escopo executado:** A1 (custos operacionais), A2 (entradas e saídas de caixa), A3 (parcial — as 3 dívidas já suspeitas), A6 (bug hunt). **Não executado:** A4 (integração completa), A5 (balanceamento completo, além do achado abaixo), A7 (teste de carreira longa formal), A8 (congelamento). Ver seção 6.

---

## 1. Resultado geral

**32 de 32 verificações passaram** depois de corrigidos 3 erros no próprio teste (detalhados na seção 5, por transparência). Nenhum bug de dinheiro foi encontrado no núcleo do jogo.

| Módulo | Testes | Resultado |
|---|---|---|
| A1 — Custos operacionais | 13 funções que mexem no caixa, auditadas uma a uma | Todas têm histórico + atualização de painel |
| A1/A2 — Cenários de dinheiro | 15 cenários executados | 15/15 |
| A6 — Bug hunt (40 ciclos de contrato) | 17 verificações | 17/17 |

---

## 2. A1 — Auditoria de custos: mapeamento completo

Todo ponto do código que altera `playerCash` foi localizado e sua função-mãe identificada:

| Função | Histórico? | Atualiza painel? | Feedback visual? |
|---|---|---|---|
| `comprarSede` | ✅ | ✅ | ✅ |
| `processarParcelasDoTempo` | ✅ | ✅ | — |
| `realocarMaquina` | ✅ | ✅ | ✅ |
| `venderMaquina` | ✅ | ✅ | ✅ |
| `acceptContract` | ✅ | ✅ | ✅ |
| `resolverComOpcaoEngenharia` | ✅ | ✅ | ✅ |
| `avancarContrato` | ✅ | ✅ | ✅ |
| `scheduleMaint` | ✅ | ✅ | ✅ |
| `confirmarTroca` | ✅ | ✅ | ✅ |
| `buyMachine` | ✅ | ✅ | ✅ |
| `pagarImpostos` | ✅ | ✅ | ✅ |
| `confirmEvento` | ✅ | ✅ | ✅ |
| `selecionarOficina` | ✅ | ✅ | ✅ |

Nenhuma função encontrada que desconta ou credita dinheiro sem deixar rastro no histórico e no painel. Essa era exatamente a classe de bug que a Fase A existia para pegar — não apareceu.

## 3. A2 — Cenários testados (todos executados de verdade, não simulados)

1. Compra de máquina financiada desconta a entrada exata e reflete no painel — ✅
2. Manutenção desconta o preço exato da peça e gera entrada no histórico — ✅
3. Oficina Parceira desconta o valor exato da oficina escolhida (não um valor genérico) — ✅
4. Contrato aceito sem exceção — ✅
5. Venda de máquina credita o caixa — ✅
6. **Navegar entre as 8 telas sem agir não muda o caixa em nenhum centavo** — ✅ (importante: elimina a hipótese de custo "fantasma" disparado por render)
7. Resgatar a mesma recompensa de missão duas vezes só credita uma vez — ✅
8. Comprar sede com caixa insuficiente é recusado mesmo com missões e reputação em dia — ✅

## 4. Achado de balanceamento (não é bug — é decisão de design que merece revisão)

**Nenhuma máquina da loja pode ser comprada à vista com o caixa inicial (R$60.000).** As 5 opções custam de R$150.000 a R$340.000 à vista. Testando o financiamento, **4 das 5 são recusadas por reputação insuficiente** (o jogador começa com 100, e a maioria exige 110–125). Existe exatamente **uma** rota viável no início: financiar a retroescavadeira, que pede R$30.000 de entrada e é a única aprovada.

Isso não é um bug — o jogo funciona como programado. Mas é um funil bem apertado logo na largada: um jogador novo tem uma única jogada possível na Loja até subir de reputação. Vale uma decisão consciente: é a curva pretendida, ou é aperto demais para as primeiras sessões de um playtest?

## 5. Transparência: 3 erros no meu próprio teste, corrigidos antes de virar conclusão

Por respeito ao que já aconteceu neste projeto (afirmar algo sem rodar e descobrir depois que estava errado), registro os erros que cometi na escrita do teste — nenhum deles é bug do jogo:

1. **Testei `buyMachine()` passando argumentos que a função ignora**, e escolhi por acaso a máquina mais cara do catálogo (R$240.000) contra um caixa de R$60.000. A recusa da compra era o comportamento correto; o "bug" era do teste.
2. **Procurei máquinas com `inContract=true` comparando contra um estado chamado `'ANDAMENTO'`.** O nome real no código é `EM_ANDAMENTO`. Corrigido o teste, zero máquinas órfãs encontradas.
3. **`restaurarGameState()` "falhou"** porque o teste rodava em `about:blank`, uma origem sem permissão de `localStorage` por especificação do navegador. Testado isoladamente com uma origem real (`https://example.com/`), salvar e restaurar funcionaram perfeitamente.

Todos os 3 foram verificados na origem antes de entrar neste relatório como "não é bug".

## 6. Dívidas técnicas — agora confirmadas com precisão de linha, não por suspeita

| Dívida | Confirmação |
|---|---|
| Bônus de marca não afeta cálculo nenhum | `playerBonusAtivos` é escrito em 1 lugar (`aplicarBonusOficina`) e lido em exatamente 1 lugar — para montar o texto `✨ RoadForce Pneus` na tela de Máquinas. Nenhuma fórmula de desgaste, custo ou risco o consome. |
| `risco` da sede não é usado | Busca por `.risco` no código inteiro: 0 ocorrências fora da própria definição em `SEDES_DATA`. Propriedade morta. |
| `maxMaquinas` da sede não limita nada | As 3 únicas leituras são para montar texto de exibição ("capacidade agora de 3 máquina(s)"). Nenhuma verificação impede comprar a 4ª máquina no Barraço (limite 1). |

## 7. O que a Fase A ainda não cobriu

Para não repetir o padrão de declarar algo "pronto" sem ter feito:

- **A4 (integração completa):** só foi testado o caminho feliz de contrato + manutenção + oficina + sede em conjunto, não todas as combinações cruzadas (ex.: vender máquina que está no meio de uma realocação, cancelar evento de risco no meio do financiamento).
- **A5 (balanceamento):** só o achado da seção 4 foi levantado. Não foi feita uma passada completa de números (juros, multas, tetos de endividamento) contra o roadmap de progressão.
- **A7 (carreira longa formal):** rodei 40 ciclos de contrato acelerados, não uma simulação de meses de jogo com todos os sistemas interagindo (envelhecimento real, parcelas vencendo, missões de sede se sucedendo).
- **A8 (congelamento):** não se aplica ainda — só faz sentido depois que A4/A5/A7 fecharem.

---

## Próximo passo

Duas frentes possíveis, sem uma ser obviamente certa:

- **Fechar as 3 dívidas técnicas confirmadas** (seção 6) — agora com localização exata, é trabalho direto: ligar o bônus de marca ao cálculo de desgaste, o risco da sede ao cálculo de probabilidade, e o limite de máquinas à compra.
- **Continuar a Fase A** pelos módulos não cobertos (A4, A5, A7) antes de mexer em mais código.

Ambas ficam registradas em `REGISTRO.md` como decisão pendente.
