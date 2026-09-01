# 🔧 FASE A — PLANO EXECUTÁVEL
## Auditoria e Fechamento do Núcleo
### Império das Máquinas

---

## 📋 ANTES DE COMEÇAR

**Preparação necessária:**
- [ ] Backup completo do projeto
- [ ] Branch git: `git checkout -b audit/fase-a`
- [ ] Documentação do código atual à mão
- [ ] Acesso ao arquivo app.html principal

**Duração estimada:** 5-10 dias de trabalho intenso

---

## A1: AUDITAR CUSTOS OPERACIONAIS

### Objetivo
Verificar que cada custo mostrado na interface está sendo descontado corretamente do caixa.

### Passos

#### 1.1 — Mapear todos os custos
Procure no código cada lugar onde dinheiro é descontado:

```bash
# Procurar por linhas que mudam playerCash
grep -n "playerCash -=" app.html | head -20
```

**Documente cada ocorrência:**

| Custo | Linha | Valor | Interface? | Descontado? | Status |
|-------|-------|-------|-----------|------------|--------|
| Manutenção | X | `custoManutencao` | ✅ Sim | ❓ ? | ❌ VERIFICAR |
| Seguro | Y | `custoSeguro` | ✅ Sim | ❓ ? | ❌ VERIFICAR |
| | | | | | |

#### 1.2 — Verificar cada custo em detalhe

**Para cada custo encontrado, responda:**

1. **Está sendo descontado?**
   ```javascript
   // Procure por playerCash -= valor
   // Se não encontrar, é um BUG
   ```

2. **Quando é descontado?**
   - Na aprovação? 
   - Imediatamente?
   - No final do mês simulado?
   - Verificar consistência

3. **Aparece no histórico?**
   ```javascript
   // Procure por registrarHistorico()
   // Se não encontrar, usuário não vê o custo
   ```

4. **Aparece no painel financeiro?**
   - Ele vê o dinheiro sair?
   - A diferença bate?

#### 1.3 — Criar checklist de validação

```javascript
// TEMPLATE para cada custo:

🔍 MANUTENÇÃO
├─ Código calcula corretamente? (custoManutencao)
├─ É descontado de playerCash? (grep playerCash)
├─ Aparece em histórico? (registrarHistorico)
├─ Aparece no painel? (updateFinanceDisplays)
├─ Interface bate com lógica?
└─ ✅ VALIDADO

🔍 SEGURO
├─ Código calcula corretamente? (custoSeguro)
├─ É descontado de playerCash?
├─ Aparece em histórico?
├─ Aparece no painel?
├─ Interface bate com lógica?
└─ ✅ VALIDADO

🔍 FINANCIAMENTO
└─ [mesmo processo]

🔍 IMPOSTOS
└─ [mesmo processo]

🔍 ADMINISTRATIVO
└─ [mesmo processo]
```

#### 1.4 — Testar manualmente cada custo

**Scenario 1: Manutenção**
```
Inicial: R$ 100.000
├─ Comprar máquina: -R$ 50.000 → Saldo: R$ 50.000
├─ Fazer manutenção básica: -R$ 500 
├─ Verificar saldo: Deve ser R$ 49.500
├─ Verificar histórico: Deve aparecer -R$ 500
├─ Verificar painel: Deve mostrar R$ 49.500
└─ ✅ Se tudo bate: OK. Se não: BUG
```

**Scenario 2: Seguro**
```
Inicial: R$ 100.000
├─ Contratar seguro: -R$ 1.500
├─ Verificar saldo: Deve ser R$ 98.500
├─ Verificar que não aparece 2x (bug comum)
└─ ✅ Validado
```

**Cenário 3: Financiamento**
```
Inicial: R$ 50.000
├─ Comprar máquina a crédito (R$ 50.000, parcelado)
├─ Verificar entrada inicial (entrada de X%)
├─ Verificar desconto de juros todo mês
├─ Verificar se bloqueia quando saldo < parcela
└─ ✅ Validado
```

#### 1.5 — Registrar bugs encontrados

**Formato:**
```
🔴 BUG #001 — Manutenção descontada 2x
├─ Severidade: CRÍTICO
├─ Reprodução: Fazer manutenção em qualquer máquina
├─ Esperado: -R$ 500
├─ Obtido: -R$ 1.000
├─ Causa: playerCash -= custo (chamado 2x)
└─ Correção necessária: Linha X
```

---

## A2: AUDITAR ENTRADAS E SAÍDAS DE DINHEIRO

### Objetivo
Mapear o fluxo completo de caixa.

### Passos

#### 2.1 — Criar mapa de fluxo

**Entradas:**
```
[✅ RECEITA DE CONTRATO]
├─ Onde entra? (função X)
├─ Quando entra? (imediato? fim do mês?)
├─ Valor correto? (verificar cálculo)
├─ Aparece no histórico?
└─ Status: ❌ VERIFICAR

[❌ OUTROS?]
└─ Você identificou outras entradas?
```

**Saídas:**
```
[✅ MANUTENÇÃO]
[✅ SEGURO]
[✅ FINANCIAMENTO (juros)]
[✅ IMPOSTOS]
[✅ ADMINISTRATIVO]
[❌ OUTRAS?]
```

#### 2.2 — Testar fluxo completo de uma carreira 1 ano

**Começar com:**
- Saldo inicial: R$ 100.000
- 1 máquina (R$ 50.000)
- 1 contrato/mês

**Anotar:**
```
MÊS 1:
├─ Saldo inicial: R$ 100.000
├─ Compra máquina: -R$ 50.000 → R$ 50.000
├─ Manutenção: -R$ 500 → R$ 49.500
├─ Seguro: -R$ 1.500 → R$ 48.000
├─ Contrato finalizado: +R$ 10.000 → R$ 58.000
├─ Imposto provisionado: -R$ 1.000 (provisão, não desconta ainda)
├─ Saldo final: R$ 58.000
└─ ✅ Bate? Registre aqui

MÊS 2:
└─ [repetir]

[...]

ANO 1 — RESUMO:
├─ Entradas totais: R$ XXX.XXX
├─ Saídas totais: R$ XXX.XXX
├─ Saldo inicial: R$ 100.000
├─ Saldo final: R$ ???
├─ Cálculo esperado: 100k + entradas - saídas = ?
└─ Bate com interface? ✅ Sim / ❌ Não
```

#### 2.3 — Testar cenários extremos

**Cenário A: Máximo lucro**
```
├─ Máquina muito cara
├─ Contrato muito bom
├─ Sem eventos negativos
├─ Resultado: Jugador fica rico?
└─ ✅ Esperado
```

**Cenário B: Perda total**
```
├─ Evento ruim (máquina quebra)
├─ Sem seguro
├─ Sem manutenção
├─ Resultado: Jogador perde tudo?
└─ ✅ Esperado (sem perda, jogo bloqueia?)
```

**Cenário C: Falência**
```
├─ Saldo vai para negativo?
├─ Jogo bloqueia operações?
├─ Mensagem clara de erro?
└─ ✅ Como o jogo trata insolvência?
```

---

## A3: AUDITAR CADA SISTEMA EM ISOLAMENTO

### A3.1 — Sistema de Risco

**Questões a responder:**

1. **Risco sobe com manutenção ruim?**
   ```
   Sem manutenção: risco = X%
   Com manutenção básica: risco = Y% (deve ser < X)
   Com manutenção completa: risco = Z% (deve ser < Y)
   ```

2. **Seguro reduz impacto?**
   ```
   Sem seguro + evento: perda = 100%
   Com seguro básico + evento: perda = 70%?
   Com seguro completo + evento: perda = 30%?
   ```

3. **Evento escalando é correto?**
   ```
   Evento inicial: -R$ 5.000
   Sem ação: escalada → -R$ 15.000?
   Com ação: escalada bloqueada?
   ```

📋 **Resultado esperado:** Documento com `RISCO_TIERS` validado

---

### A3.2 — Sistema de Seguro

**Questões:**

1. **Os 3 níveis funcionam?**
   - Sem seguro
   - Básico
   - Completo

2. **Preço é justo?**
   ```
   Sem seguro: -R$ 0 (mas risco = 100%)
   Básico: -R$ 1.500 (risco = 70%?)
   Completo: -R$ 2.500 (risco = 30%?)
   ```

3. **O jogador entende?**
   - Qual escolher?
   - Por quê?

📋 **Resultado esperado:** Tabela de custo-benefício de cada nível

---

### A3.3 — Sistema de Manutenção

**Questões:**

1. **Impacta risco?**
   ```
   Manutenção 0%: risco = ?
   Manutenção 50%: risco = ?
   Manutenção 100%: risco = ?
   ```

2. **Cada peça funciona?**
   - Original (caro, confiável)
   - Alternativa (barato, menos confiável)

3. **Impacta contratos?**
   - Máquina quebrada cancela contrato?
   - Sem manutenção perde contratos?

📋 **Resultado esperado:** Matriz: manutenção → risco → impacto

---

### A3.4 — Sistema de Eventos

**Questões:**

1. **Cada evento oferece escolhas reais?**
   - Pagar equipe extra (custo vs prazo)
   - Aceitar atraso (prazo vs reputação)
   - Realocar máquina (risco vs solução)

2. **Impacto é consistente?**
   ```
   Opção A: -R$ 8.000, +2 dias, +2 reputação
   Opção B: -R$ 24.000, 0 dias, -3 reputação
   Opção C: -R$ 5.000, +3 dias, -1 reputação
   (As diferenças fazem sentido?)
   ```

📋 **Resultado esperado:** Cada evento validado (custo-benefício)

---

### A3.5 — Sistema de Reputação

**Questões:**

1. **Os 4 níveis funcionam?**
   - Iniciante
   - Confiável
   - Referência regional
   - Referência no mercado

2. **Afeta contratos?**
   ```
   Reputação baixa → Contratos piores?
   Reputação alta → Contratos melhores?
   ```

3. **Afeta financiamento?**
   ```
   Reputação baixa → Empréstimo bloqueado ou cara?
   Reputação alta → Crédito melhorado?
   ```

4. **Afeta outras coisas?**
   - Seguro?
   - Fornecedores?
   - Velocidade de contrato?

📋 **Resultado esperado:** Matriz: reputação → consequências

---

### A3.6 — Sistema de Financiamento

**Questões:**

1. **Aprovação é baseada em reputação?**
   ```
   Reputação baixa → Empréstimo bloqueado?
   Reputação alta → Aprovação garantida?
   ```

2. **Juros são calculados certo?**
   ```
   Esperado: 12% ao ano
   Obtido: ???
   ```

3. **Parcelas são descontadas?**
   ```
   Contratou: -R$ 50.000 no crédito
   Todo mês desconta: -R$ (50k / 12) + juros?
   ```

4. **Limite de endividamento?**
   ```
   Máx: 3x patrimônio?
   5x patrimônio?
   Sem limite?
   ```

📋 **Resultado esperado:** Validar cada parâmetro de financiamento

---

### A3.7 — Sistema de Impostos

**Questões:**

1. **Alíquota sobe com faturamento?**
   ```
   Faturamento até R$ 1M: 10%?
   Faturamento R$ 1M-R$ 5M: 15%?
   Faturamento acima R$ 5M: 20%?
   ```

2. **É sobre lucro ou faturamento?**
   ```
   Faturamento: R$ 100k
   Custos: R$ 80k
   Lucro: R$ 20k
   
   Imposto em faturamento: 100k * taxa = ?
   Imposto em lucro: 20k * taxa = ?
   (Qual é o modelo?)
   ```

3. **Provisão funciona?**
   ```
   Lucro: R$ 20k
   Imposto provisionado: -R$ 3k (provisão)
   Saldo fica: R$ 17k
   Depois paga e limpa?
   ```

📋 **Resultado esperado:** Documento explicando sistema tributário

---

### A3.8 — Sistema de Contratos

**Questões:**

1. **Regeneração funciona?**
   ```
   Aceitou contrato A
   Terminou contrato A
   Contrato A some e novo contrato B aparece?
   ```

2. **Variação existe?**
   ```
   Cliente varia?
   Cidade varia?
   Valor varia?
   Máquina requerida varia?
   ```

3. **Atraso impacta?**
   ```
   Aceitou prazo 10 dias
   Entregou em 15 dias
   Multa?: -R$ X
   Reputação?: -Y
   ```

📋 **Resultado esperado:** Matriz de cenários de contrato

---

## A4: TESTES DE INTEGRAÇÃO

### Objetivo
Verificar se mudar um sistema quebra outro.

### Passos

#### 4.1 — Teste: Manutenção reduz risco?

```
TESTE: Se elevar manutenção, risco deve cair

Setup:
├─ Máquina novo
├─ Manutenção = 0%
├─ Calcular risco = X%

Ação:
└─ Elevar manutenção para 100%

Esperado:
├─ Risco deve cair para Y% (Y < X)
└─ ✅ PASSA se Y < X

Obtido:
├─ Risco = ???
└─ ✅ PASSA / ❌ FALHA
```

#### 4.2 — Teste: Reputação baixa bloqueia empréstimo?

```
TESTE: Se reputação < threshold, não aprova crédito

Setup:
├─ Reputação = 20 (baixa)
├─ Pedir empréstimo

Esperado:
├─ Mensagem: "Limite de crédito não aprovado"
└─ Operação bloqueada

Obtido:
├─ Aprovou?
├─ Bloqueou?
└─ ✅ PASSA / ❌ FALHA
```

#### 4.3 — Teste: Imposto provisiona corretamente?

```
TESTE: Lucro gera imposto provisão correto

Setup:
├─ Contrato de R$ 100k
├─ Custos de R$ 80k
├─ Lucro = R$ 20k

Ação:
└─ Pagar imposto sobre lucro

Esperado:
├─ Imposto = R$ 3k (assumindo 15%)
├─ Saldo cai de 20k para 17k
└─ Histórico mostra "Imposto: -R$ 3k"

Obtido:
├─ Saldo final = ???
└─ ✅ BATE / ❌ NÃO BATE
```

#### 4.4 — Crie matriz de testes

```
               Risco ↓  Seguro ↓  Manu ↓  Repu ↓  Fin ↓   Imp ↓   Contr ↓
Risco           -       ✅        ✅      ❓      ❓      ❓      ❓
Seguro          ✅       -       ✅      ❓      ❓      ❓      ❓
Manutenção      ✅      ✅        -      ❓      ❓      ❓      ❓
Reputação       ❓      ❓       ❓       -      ✅      ❓      ✅
Financiamento   ❓      ❓       ❓      ✅      -      ❓      ❓
Impostos        ❓      ❓       ❓      ❓      ❓      -      ❓
Contratos       ❓      ❓       ❓      ✅      ❓      ❓      -

Legenda:
✅ = Testado e OK
❌ = Testado e FALHA
❓ = Ainda não testado
```

---

## A5: BALANCEAMENTO DA ECONOMIA

### Objetivo
Validar se o jogo é **justo** e **divertido**.

### Passos

#### 5.1 — Teste: Jogador novo consegue lucrar?

```
CARREIRA TESTE 1: Ano 1 com cautela

Setup:
├─ Saldo inicial: R$ 100.000
├─ Compra 1 máquina (R$ 50.000)
├─ Manutenção básica
├─ Seguro básico
├─ Aceita todos contratos disponíveis

Questões:
├─ Consegue fazer 12 contratos/ano?
├─ Saldo fica positivo?
├─ Consegue pagar custos?
└─ ✅ SIM / ❌ NÃO

Se ❌: Rebalancear (custos altos demais? Contratos baixos demais?)
```

#### 5.2 — Teste: Jogador cuidadoso ganha mais que agressivo?

```
CARREIRA TESTE 2A: Cuidadoso (5 anos)
├─ Manutenção: 100%
├─ Seguro: Completo
├─ Saldo final: R$ ???

CARREIRA TESTE 2B: Agressivo (5 anos)
├─ Manutenção: 0%
├─ Seguro: Nenhum
├─ Saldo final: R$ ???

Esperado:
└─ Cuidadoso > Agressivo (filosofia do jogo)

Se Agressivo > Cuidadoso: ❌ REBALANCEAR
```

#### 5.3 — Teste: Seguro completo é sempre ruim?

```
ANÁLISE: Quando seguro completo faz sentido?

Cenário A:
├─ Manutenção: 100% (excelente)
├─ Seguro completo: Muito caro para pouco risco
└─ Conclusão: Não vale a pena

Cenário B:
├─ Manutenção: 50% (média)
├─ Seguro completo: Pode valer a pena
└─ Conclusão: Flexibilidade de escolha

Esperado:
└─ Nem "sempre escolha A", nem "sempre A é melhor"
└─ Deve haver trade-offs reais
```

#### 5.4 — Teste: Carreira de 10 anos é divertida?

```
CARREIRA TESTE 3: 10 anos

Observar:
├─ Mês 1-12: Crescimento inicial?
├─ Mês 13-60: Mantém interesse?
├─ Mês 61-120: Fica chato ou evolui?
└─ Pergunta: "Quer continuar ou desistir?"

Se desiste antes de 10 anos:
├─ Por quê? (fica repetitivo? Muito caro? Não entende?)
└─ Isso vai pra Fase B (playtest humano)
```

📋 **Resultado esperado:** Documento de balanceamento com recomendações

---

## A6: BUG HUNT COMPLETO

### Objetivo
Encontrar e catalogar todos os bugs operacionais.

### Passos

#### 6.1 — Metodologia

```
1. Jogar 3 carreiras
   ├─ Uma carreira: foco em risco/eventos
   ├─ Uma carreira: foco em finanças
   └─ Uma carreira: foco em reputação

2. Anotar TUDO que parece estranho
   ├─ Número que não bate
   ├─ Mensagem confusa
   ├─ Ação sem efeito
   ├─ Decisão sem conseqüência
   └─ Tela que não atualiza

3. Classificar severidade
   🔴 CRÍTICO (quebra jogo)
   🟠 SÉRIO (quebra feature)
   🟡 LEVE (cosmético)
```

#### 6.2 — Formato de bug

```
🔴 BUG #XXX — [título do bug]

Severidade: CRÍTICO / SÉRIO / LEVE

Reprodução:
├─ Passo 1: ...
├─ Passo 2: ...
└─ Passo 3: ...

Esperado:
└─ Saldo deve ser R$ X.XXX

Obtido:
└─ Saldo é R$ Y.YYY

Impacto:
└─ Jogador não consegue continuar / Economia quebrada / Cosmético

Linha de código:
└─ Procurar em: app.html linha ???
```

#### 6.3 — Bugs comuns em jogos financeiros

Procure especificamente por:

```
❌ Número descontado 2x
❌ Número descontado 0x
❌ Número não aparece em histórico
❌ Saldo negativo permitido (sem aviso)
❌ Limite de crédito ultrapassado
❌ Decisão sem efeito (clica mas nada acontece)
❌ Tela não atualiza (valores antigos)
❌ Histórico vazio quando não deveria ser
❌ Tooltip mostra número errado
❌ Ação desativada quando deveria estar ativa
```

---

## A7: TESTE DE CARREIRA LONGA

### Objetivo
Simular 1 carreira completa do início ao fim.

### Plano

```
CARREIRA TESTE COMPLETA

Estilo: BALANCEADO (seguindo recomendações de bom play)

MÊS 1-12: Ano 1 — Alicerce
├─ Compra máquina 1
├─ Manutenção básica
├─ Seguro básico
├─ Faz 12 contratos
├─ Final: Saldo R$ ???
└─ Reputação: ???

ANO 2-5: Crescimento
├─ Compra máquina 2 e 3
├─ Manutenção mantida
├─ Seguro mantido
├─ Faz ~36 contratos/ano (múltiplas máquinas)
├─ Saldo cresce para R$ ???
└─ Reputação sobe para: Confiável / Referência Regional?

ANO 6-10: Maturidade
├─ Frota estável (3-4 máquinas)
├─ Renda estável (12+ contratos/mês)
├─ Financiamento pago
├─ Foco em otimização
└─ Saldo: R$ ???, Reputação: Referência no Mercado?

ANO 11-20: Estabilidade
├─ Manutenção foco preventivo
├─ Renda previsível
├─ Decisões mais estratégicas
├─ Quer continuar ou fica chato?
└─ Final: Saldo R$ ???
```

### Anotar em detalhe:

```
Coluna A: Mês
Coluna B: Saldo inicial
Coluna C: Operações (contratos, custos)
Coluna D: Saldo final
Coluna E: Reputação
Coluna F: Problemas encontrados
Coluna G: Diversão (1-10)
```

📋 **Resultado esperado:** Planilha com 240 linhas (20 anos × 12 meses) + relatório

---

## A8: CONGELAMENTO DA ECONOMIA

### Objetivo
Validar que economia funciona identicamente em 1, 5, 10 e 20 anos.

### Teste

```
TESTE 4x: Simular 4 carreiras

Carreira 1 ano:
├─ Padrão balanceado por 12 meses
├─ Saldo final: R$ A

Carreira 5 anos:
├─ Mesma estratégia por 60 meses
├─ Saldo final: R$ B
├─ Crescimento esperado: ~5x

Carreira 10 anos:
├─ Mesma estratégia por 120 meses
├─ Saldo final: R$ C
├─ Crescimento esperado: ~10x

Carreira 20 anos:
├─ Mesma estratégia por 240 meses
├─ Saldo final: R$ D
├─ Crescimento esperado: ~20x

VALIDAÇÃO:
└─ Se crescimento é linear = ✅ OK
└─ Se crescimento exponencial = ❌ BUG (economia amplifica)
└─ Se crescimento desacelera = ❓ INVESTIGAR
```

### Congelamento bem-sucedido quando:

```
✅ Economia funciona igualmente em qualquer escala
✅ Estratégia "boa" continua boa no ano 20
✅ Sem exploits (forma de ganhar infinito)
✅ Sem ruínas (forma de perder tudo rapidamente)
✅ Sem mudanças abruptas de dificuldade
```

---

## 📋 CHECKLIST DE CONCLUSÃO DE FASE A

Antes de passar para Fase B, verifique:

- [ ] A1: Cada custo foi validado (interface = lógica)
- [ ] A2: Fluxo de caixa foi mapeado e testado
- [ ] A3: Cada sistema foi auditado em isolamento
- [ ] A4: Testes de integração passaram
- [ ] A5: Balanceamento foi validado (justo + divertido)
- [ ] A6: Todos os bugs foram catalogados
- [ ] A7: 1 carreira completa foi jogada e documentada
- [ ] A8: Economia foi congelada (validada em 1/5/10/20 anos)

- [ ] Documentação técnica atualizada
- [ ] Todos os bugs CRÍTICOS corrigidos
- [ ] Todos os bugs SÉRIOS mapeados (priorizar correção)
- [ ] Todos os bugs LEVES documentados

- [ ] Relatório final de Fase A pronto
- [ ] Código commitado em branch `audit/fase-a`
- [ ] Pronto para: Fase B (Playtest humano)

---

## 🎯 PRÓXIMO PASSO

Quando Fase A estiver completa:

```
Executar Fase B → Trazer jogador humano externo
└─ Entende risco? Entende seguro? Quer continuar?
```

**Tempo estimado para Fase A completa:** 1-2 semanas

**Não passe para Fase B enquanto Fase A não estiver 100% verde.**

---

Versão: 1.0  
Data: 31.08.2026  
Status: 🔴 NÃO INICIADO — Aguardando execução
