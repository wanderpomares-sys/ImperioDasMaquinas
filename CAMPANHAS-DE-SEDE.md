# Sistema de Campanhas de Sede

**Implementado em:** `01-JOGO/app.html`
**Validado por:** `03-PLANO/teste-campanhas.js` — 44 testes, todos passando

---

## A regra

Sede não é mais desbloqueada sozinha. Ela é **comprada**, e a compra exige **três coisas ao mesmo tempo**:

| Requisito | O que é |
|-----------|---------|
| **Missões** | Todas as missões da campanha daquela sede |
| **Reputação** | Um mínimo de reputação no mercado |
| **Caixa** | Dinheiro em caixa, que é debitado na compra |

Faltando qualquer um dos três, o botão fica bloqueado e **diz exatamente o que falta** — por exemplo: `faltam 2 missão(ões) · faltam 5 de reputação · faltam R$ 120.000`.

---

## As campanhas

### Sede 2 — Garagem com Oficina
**R$ 180.000 · Reputação 105 · 3 missões**
- 📦 Primeiras entregas — 3 contratos no prazo → +R$5.000
- 🔧 Frota em dia — manutenção em 2 máquinas → +5 reputação
- 💰 Primeiro caixa — faturar R$150.000 → +R$8.000

### Sede 3 — Sede Média
**R$ 650.000 · Reputação 115 · 4 missões**
- 🔥 Encara o risco — 1 contrato de alto risco → +R$15.000
- 🏭 Parceria de oficina — usar Oficina Parceira 3× → +6 reputação
- 💰 Faturamento sólido — faturar R$500.000 → +R$20.000
- 📦 Constância — 8 contratos no prazo → +8 reputação

### Sede 4 — Sede Grande
**R$ 1.200.000 · Reputação 128 · 5 missões**
- 🔥 Especialista em risco — 3 contratos de alto risco → +R$40.000
- 🤝 Marca de confiança — 5 manutenções na mesma marca → +10 reputação
- 💰 Operação robusta — faturar R$1.500.000 → +R$50.000
- 📦 Reputação de entrega — 15 contratos no prazo → +10 reputação
- 🚜 Frota respeitável — 3 máquinas na frota → +R$30.000

### Sede 5 — IMPÉRIO
**R$ 4.000.000 · Reputação 142 · 5 missões**
- 🔥 Domínio do risco — 8 contratos de alto risco → +R$100.000
- 🤝 Duas parcerias sólidas — 10 manutenções em 2 marcas → +12 reputação
- 💰 Império financeiro — faturar R$5.000.000 → +R$150.000
- 📦 Nome no mercado — 30 contratos no prazo → +12 reputação
- 🚜 Frota de império — 6 máquinas na frota → +R$80.000

**Total: 17 missões** ao longo da progressão, aparecendo em blocos conforme o jogador avança.

---

## Como aparece para o jogador

**Aba 🎯 MISSÕES** — mostra a campanha atual no topo:

```
CAMPANHA RUMO A
🏢 Garagem com Oficina
[████████░░░░░░░░]  2/3
Faltam 1 missão(ões)

Além das missões, a compra exige reputação 105
(você tem 102) e caixa de R$ 180.000.
```

Abaixo, as missões da campanha com barra de progresso e botão de resgate. Só aparecem as missões da campanha atual — ao comprar a sede, as antigas somem e as novas entram.

**Aba 🏢 SEDES** — os três requisitos lado a lado, cada um com barra própria, e o botão de compra que só habilita quando os três estão verdes.

---

## Detalhe técnico que importa

O progresso de cada missão é **derivado do estado do jogo**, não armazenado num contador paralelo:

```js
{ id:'s2a', meta:3, valor: () => stats.contratosNoPrazo }
```

Isso elimina a classe de bug em que a tela mostra um número e o jogo acredita em outro — a mesma família de problema do `playerPatrimonio` que já nos custou tempo antes. Não existe estado para dessincronizar.

Persistem no save: `stats`, `missoesResgatadas` e o conjunto de máquinas com manutenção feita.

---

## Correção de um erro meu no documento anterior

No STATUS-E-ROADMAP eu listei "envelhecimento é cosmético" como dívida técnica. **Está errado.** Ao auditar o código para esta implementação, verifiquei que:

- `idadeDias` alimenta `fatorIdade`, que define o valor de mercado da máquina
- `m.health` cai com uso em contrato e também com ociosidade sem manutenção
- A condição média da frota entra no cálculo de risco:
  `manutBonus = avgHealth >= 80 ? -0.035 : (avgHealth < 50 ? 0.035 : 0)`

Ou seja: manter a frota em dia **reduz mesmo** a probabilidade de evento ruim. A premissa "Risco não é sorte. É gestão." está sustentada no código. A dívida real que permanece é apenas o **bônus das marcas** (`playerBonusAtivos`), que é gravado e exibido mas nenhum cálculo consome.

---

## Dívidas técnicas atualizadas

| # | Dívida | Gravidade |
|---|--------|-----------|
| 1 | Bônus das marcas não afeta cálculo nenhum | 🔴 Alta — é a promessa das Oficinas Parceiras |
| 2 | `risco` da sede (1.2 → 0.85) não é consumido | 🟡 Média — sede melhor deveria reduzir risco |
| 3 | `maxMaquinas` da sede não limita compras | 🟡 Média — tira o sentido de expandir |
| 4 | ~~Envelhecimento cosmético~~ | ✅ Não procede — funciona |
| 5 | ~~Meta de fidelidade sem recompensa~~ | ✅ Resolvido — virou missão com prêmio |

---

## Teste rápido

1. Aba **MISSÕES** → deve mostrar "Campanha rumo a 🏢 Garagem com Oficina" e "Faltam 3 missão(ões)"
2. Aba **SEDES** → três barras (Missões / Reputação / Caixa) e botão cinza bloqueado dizendo o que falta
3. Conclua contratos no prazo → a barra de "Primeiras entregas" anda sozinha
4. Complete as 3 missões → botão continua bloqueado, mas agora só por reputação/caixa
5. Com os três requisitos verdes → botão fica verde: **🏢 COMPRAR SEDE · R$ 180.000**
6. Comprar → caixa debita, sede sobe, e a campanha da Sede 3 aparece com 4 missões novas
