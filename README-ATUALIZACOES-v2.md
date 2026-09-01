# 📦 IMPÉRIO DAS MÁQUINAS v2.0+ ATUALIZADO
## Incluindo: Sedes + Oficinas Parceiras + Missões + Contratos Tier 2/3 + Monetização

**Data:** 01 de Setembro, 2026  
**Status:** ✅ Pronto para implementação  
**Tamanho:** 1.6 MB

---

## 🆕 O QUE FOI ADICIONADO NESTA VERSÃO

### 🏗️ SISTEMA DE SEDES (5 Níveis)

**Arquivo:** `sedes_v1.json`

Implementa progressão visual com 5 níveis de Sede:

```
Nível 1: O Barraço (início)
  ├─ 1 máquina
  ├─ Tier 1 (contratos básicos)
  └─ Custos operacionais +20%

Nível 2: Garagem com Oficina (desbloqueável)
  ├─ 3 máquinas
  ├─ Tier 1 Premium
  ├─ Acesso a Oficina Parceira
  └─ Custos normais

Nível 3: Sede Média (intermediária)
  ├─ 4 máquinas
  ├─ Tier 2 + Tier 3 (após cadeias)
  ├─ Cadeia Logística + Cadeia Técnica
  └─ Eficiência +5%

Nível 4: Sede Grande (escala)
  ├─ 8 máquinas
  ├─ 2 filiais simultâneas
  ├─ Painéis solares (-10% admin)
  └─ Workshop avançado

Nível 5: IMPÉRIO (endgame)
  ├─ 20 máquinas
  ├─ 9999 filiais
  ├─ Oficina própria de fabricação
  └─ Modo livre total
```

**Mecânica:**
- Cada nível desbloqueia recursos, não compra
- Objetivos em cadeia (fazer 10 contratos → desbloqueia Nível 2)
- Cadeias Logística + Técnica para Nível 3
- Filiais para escalabilidade

---

### 🏢 SISTEMA DE OFICINAS PARCEIRAS

**Arquivo:** `oficinas_parceiras_v1.json`

Integração de marcas reais no gameplay de manutenção:

```
OPÇÃO 1: Oficina Genérica
├─ Custo: R$5.000
├─ Tempo: 5 dias
├─ Qualidade: 80%
└─ Sem marca

OPÇÃO 2: Oficina Parceira Real 🎯
├─ Custo: R$8.000
├─ Tempo: 2 dias
├─ Qualidade: 100% + 10% bônus por 30 dias
├─ Logo + vídeo 5s + catálogo
└─ Marca registrada em analytics

OPÇÃO 3: Oficina Própria (Nível 3+)
├─ Custo inicial: R$500.000
├─ Tempo: 1 dia
├─ Qualidade: 100%
└─ Custo recorrente: 40% mais barato
```

**5 Marcas Fictícias (para substituição):**

1. **RoadForce Pneus** → Pirelli / Michelin / Goodyear
   - Bônus: Desgaste pneu -30% por 60 dias
   - Frequência: ~8x/ano

2. **SynthFlow Óleos** → Mobil / Shell / Castrol
   - Bônus: Intervalo manutenção -20% (permanente)
   - Frequência: ~4x/ano

3. **MegaParts Peças** → CAT / Komatsu / JCB
   - Bônus: Confiabilidade +95% (permanente)
   - Frequência: ~6x/ano

4. **PowerFuel Combustíveis** → Petrobras / Shell / Esso
   - Bônus: Consumo -15% (permanente)
   - Frequência: ~50x/carreira (alta!)

5. **TechRep Serviços** → Rede autorizada
   - Bônus: Diagnóstico gratuito vitalício
   - Frequência: ~5x/carreira

---

### 🎯 SISTEMA DE MISSÕES DE FIDELIDADE

**Arquivo:** `missoes_fidelidade_v1.json`

Objetivos secundários que recompensam fidelidade com marcas:

```
EXEMPLO: "Mecânico Especial RoadForce"
├─ Objetivo: 10 manutenções na RoadForce
├─ Recompensa: Pneu Premium RoadForce
├─ Efeito: -30% desgaste por 60 dias
├─ Bônus: +R$5k, +10 reputação
└─ Resetável: Sim (repete a cada mês)

EXEMPLO: "Desafio SynthFlow"
├─ Objetivo: 8 trocas de óleo em 30 dias
├─ Recompensa: -10% intervalo manutenção por 30 dias
├─ Bônus: +R$10k, +25 reputação
└─ Resetável: Sim (a cada 30 dias)

EXEMPLO: "Frota Zero Incidentes"
├─ Objetivo: 90 dias sem quebra em nenhuma máquina
├─ Recompensa: Bônus de Confiabilidade +10%
├─ Bônus: +R$25k, +50 reputação
└─ Resetável: Não (uma vez na carreira)
```

**Tipo de Missões:**
- Fidelidade com marca (X manutenções = recompensa)
- Desafios temporais (Y dias pra fazer Z ações)
- Sedes (objectives específicos por nível)
- Badges e cumulativas

---

### 📋 CONTRATOS TIER 2 E TIER 3

**Arquivo:** `contratos_tier2_tier3_v1.json`

Novos contratos com integração de marcas:

```
TIER 2 (Intermediário)
├─ Valor: R$45k-89k
├─ Duração: 14-25 dias
├─ Máquinas: 2-3
├─ Campo: marca_preferida (null ou ID)
├─ Bônus se usar marca: +5% do valor
└─ Exemplos:
   • Fundação Comercial Centro
   • Reforma Via Expressa
   • Pátio Logístico Industrial

TIER 3 (Avançado)
├─ Valor: R$90k-155k
├─ Duração: 30-50 dias
├─ Máquinas: 3-4
├─ Campo: marca_preferida (null ou ID)
├─ Bônus se usar marca: +5% do valor
└─ Exemplos:
   • Mega Terraplanagem - Porto (125k)
   • Infraestrutura Rodovia Federal (145k)
   • Complexo Aeroportuário (150k)
   • Mina - Operação (155k)
```

**Mecânica:**
- Alguns contratos preferem marcas (campo `marca_preferida`)
- Se usar marca preferida: +5% bônus automático
- Regeneração com marcas variadas
- Recompensas para fidelidade com mesma marca

---

### 💰 WHITEPAPER DE MONETIZAÇÃO

**Arquivo:** `MONETIZACAO_MARCAS_WHITEPAPER.md`

Documento executivo completo para pitchar marcas reais:

```
SEÇÕES:

1. Sumário Executivo
   └─ O jogo em 2 minutos

2. Como Marcas Integram
   └─ Exemplo: manutenção genérica vs com marca

3. Por que Jogadores Escolhem Marca
   └─ Análise de trade-off (custo vs tempo vs qualidade)

4. 5 Categorias de Marca
   ├─ Pneus (RoadForce → Pirelli)
   ├─ Óleos (SynthFlow → Shell)
   ├─ Peças (MegaParts → CAT)
   ├─ Combustível (PowerFuel → Petrobras)
   └─ Serviços (TechRep → Rede Autorizada)

5. Métricas Chave
   ├─ Impressões Qualificadas
   ├─ Engajamento (cliques, tempo, conversão)
   ├─ Fidelidade (repeats, lifetime value)
   ├─ Lifecycle (retenção em 1/5/10 anos)
   └─ Impacto Econômico (bônus, economia facilitada)

6. Modelos de Preço
   ├─ CPM (R$15-20 por 1000 impressões)
   ├─ CPA (R$50-100 por ação)
   └─ HÍBRIDO (CPM base + CPA bônus) ⭐ Recomendado

7. Processo de Onboarding
   ├─ Fase 1: Acordo (2-4 semanas)
   ├─ Fase 2: Implementação (1-2 semanas)
   ├─ Fase 3: Lançamento (2-4 semanas)
   └─ Fase 4: Otimização (contínua)

8. Template de Pitch
   └─ Email/apresentação pronto para enviar

9. Riscos e Mitigação
   └─ 4 cenários + soluções

10. FAQ
    └─ Respostas às perguntas mais comuns
```

---

## 📁 ESTRUTURA DO PACOTE

```
ImperioDasMaquinas-ATUALIZADO-COMPLETO.zip (1.6 MB)
│
├── 📚 DOCUMENTAÇÃO
│   ├── 00-INDICE-COMPLETO.md (Roadmap)
│   ├── 01-GUIA-PASSO-A-PASSO.md (Auditoria Fase A)
│   ├── 02-manifest-COMENTADO.md (PWA)
│   ├── 03-SUGESTOES-E-ROADMAP.md (Futuro)
│   ├── 04-app-COMENTADO.html (Código)
│   ├── ANALISE-CRUZADA-ROADMAP.md (Análise)
│   ├── FASE-A-PLANO-EXECUTAVEL.md (Auditoria detalhada)
│   ├── RELATORIO-SIMPLES.md
│   ├── RELATORIO-IMPLEMENTACOES.pdf
│   ├── CORRECOES_IMPLEMENTADAS.md
│   ├── INSTRUCOES-ZIP.txt
│   └── RESUMO-FINAL.txt
│
├── 🎨 PWA
│   ├── manifest.json (atualizado)
│   ├── icon-192-maskable.png
│   └── icon-512-maskable.png
│
├── 🏗️ NOVO: SEDES + OFICINAS + MISSÕES + CONTRATOS
│   ├── sedes_v1.json (5 níveis)
│   ├── oficinas_parceiras_v1.json (3 tipos + 5 marcas)
│   ├── missoes_fidelidade_v1.json (fidelidade + desafios)
│   ├── contratos_tier2_tier3_v1.json (novos contratos + marcas)
│   └── MONETIZACAO_MARCAS_WHITEPAPER.md (pitch executivo)
│
└── 📦 ANEXOS
    └── ImperioDasMaquinas-ATUALIZADO.zip (projeto anterior)
```

---

## 🚀 PRÓXIMOS PASSOS

### Para Implementar Agora

```
1. Revisar sedes_v1.json
   └─ Verificar progression, custos, objetivos

2. Integrar oficinas_parceiras_v1.json
   └─ Adicionar ao modal de manutenção
   └─ Testar video + catálogo

3. Conectar missoes_fidelidade_v1.json
   └─ Criar Menu de Missões
   └─ Rastrear progresso por marca

4. Adicionar contratos_tier2_tier3_v1.json
   └─ Tier 2 após Nível 2
   └─ Tier 3 após Cadeias (Nível 3)
   └─ Bônus se usar marca_preferida

5. Testar integração completa
   └─ Jogar carreira de 1 ano
   └─ Validar economia com novos sistemas
```

### Para Pitchar a Marcas Reais

```
1. Ler MONETIZACAO_MARCAS_WHITEPAPER.md
2. Preparar apresentação em PDF
3. Listar potenciais parceiros por categoria
4. Usar template de email (Seção 8 do Whitepaper)
5. Agendar calls de descoberta
```

### Para Auditoria (Fase A)

```
1. Jogar com cada sede/oficina/missão nova
2. Validar que economia não quebrou
3. Testar A1-A8 do FASE-A-PLANO-EXECUTAVEL.md
4. Documentar bugs
5. Fazer adjustments de balanceamento
```

---

## 📊 RESUMO DE ADIÇÕES

| Item | Antes | Depois | Impacto |
|------|-------|--------|--------|
| Níveis de Sede | 1 (genérico) | 5 (progression) | 🔥 ALTO |
| Oficinas | Genérica | 3 tipos + 5 marcas | 🔥 ALTO |
| Missões | Nenhuma | 15+ missões | 🟡 MÉDIO |
| Contratos | Tier 1 | Tier 1/2/3 | 🔥 ALTO |
| Monetização | Planejada | **Documentada + Pronta** | 🟡 MÉDIO |
| Documentação | 8 docs | 13 docs | ✅ OK |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Antes de colocar em produção:

- [ ] Ler ANALISE-CRUZADA-ROADMAP.md (entender status)
- [ ] Seguir FASE-A-PLANO-EXECUTAVEL.md (auditoria)
- [ ] Integrar sedes_v1.json
- [ ] Integrar oficinas_parceiras_v1.json
- [ ] Integrar missoes_fidelidade_v1.json
- [ ] Integrar contratos_tier2_tier3_v1.json
- [ ] Testar fluxo completo (manutenção → marca → missão → recompensa)
- [ ] Validar economia não quebrou (Fase A)
- [ ] Jogar carreira de 1 ano (Fase A7)
- [ ] Fazer playtest com humano (Fase B)
- [ ] Preparar whitepaper pra pitch de marcas
- [ ] Fazer push pra repo + criar release

---

## 💡 NOTAS IMPORTANTES

### Sobre as Marcas Fictícias

✅ Todos os JSONs têm marcas fictícias **prontas pra substituição**

Quando uma marca real assinar:
1. Substitua `marca_01_pneus` pelo ID/nome real
2. Atualize logo, website, contato
3. Ajuste bônus se necessário
4. Deploy em produção
5. Notifique todos os jogadores ("Novo parceiro desbloqueado!")

### Sobre a Economia

⚠️ Estes novos sistemas **aumentam complexidade**

Antes de lançar em produção:
- Executar FASE-A-PLANO-EXECUTAVEL.md completo
- Validar que custos operacionais estão corretos
- Testar: Jogador novo consegue chegar ao Nível 2?
- Testar: Oficina parceira compensa economicamente?

### Sobre o Roadmap

🎯 Este pacote **combina**:
- Correções PWA (v2.0)
- Sistema de Sedes (FASE C)
- Sistema de Oficinas (FASE D)
- Sistema de Missões (FASE D)
- Plano de Monetização (FASE F)

**Importante:** Auditoria (FASE A) e Playtest (FASE B) ainda são críticos!

---

## 📞 SUPORTE

### Dúvidas sobre implementação?

1. Comece pelo INDICE-COMPLETO.md
2. Leia ANALISE-CRUZADA-ROADMAP.md
3. Siga FASE-A-PLANO-EXECUTAVEL.md passo a passo
4. Consulte JSON específico conforme necessário

### Dúvidas sobre monetização?

1. Leia MONETIZACAO_MARCAS_WHITEPAPER.md
2. Customize template de pitch (Seção 8)
3. Agende calls com potenciais parceiros

---

**Versão:** 2.0+ com Sedes + Oficinas + Monetização  
**Status:** ✅ Pronto para implementação  
**Data:** 01 de Setembro, 2026  
**Tamanho:** 1.6 MB (inclui tudo)

🚀 **Vamos lançar!**
