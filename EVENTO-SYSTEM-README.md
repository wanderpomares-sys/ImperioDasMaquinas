# 🎮 Império das Máquinas - Sistema de Eventos v2.1+

## 📋 Visão Geral

Sistema completo de **17 eventos dinâmicos** com:
- ✅ 50/50 sucesso vs problema
- ✅ 4 níveis de gravidade (leve → crítico)
- ✅ Custos administrativos escalonados por sede
- ✅ Modais com imagens JPG realistas
- ✅ Animações Framer/Linear/Stripe style
- ✅ Vibração + som imersivo
- ✅ Design minimalista elegante

---

## 🎯 17 EVENTOS MAPEADOS

### ✅ SUCESSOS (20%)

| # | Evento | Impacto | Imagem | Reputação |
|---|--------|--------|--------|-----------|
| 1 | **Projeto Completo** | +15% lucro | `event-project-complete.jpg` | +5 |
| 2 | **Time Feliz** | +10% lucro | `event-team-success.jpg` | +3 |
| 3 | **Mega Contrato** | +30% + R$ 50k | `event-mega-contract.jpg` | +15 |
| 4 | **Lucro Alto** | +35% + R$ 120k | `event-big-profit.jpg` | +12 |
| 5 | **Máquina Nova** | +8% - R$ 150k | `event-new-machinery.jpg` | +5 |
| 6 | **Worker Saindo** | -5% - 5 reputação | `event-worker-leaving.jpg` | -5 |
| 7 | **Novo Escritório** | +5% - R$ 200k | `hub-office-modern-success.jpg` | +8 |

### ⚠️ PROBLEMAS LEVES (15%)

| # | Evento | Impacto | Dias | Imagem |
|---|--------|--------|------|--------|
| 8 | **Ferramenta Quebrada** | -25% lucro | 5 dias | `event-minor-problem.jpg` |

### 🔴 PROBLEMAS GRAVES (15%)

| # | Evento | Impacto | Dias | Imagem |
|---|--------|--------|------|--------|
| 9 | **Falha Hidráulica** | -50% + R$ 5k + R$ 8k | 15 dias | `event-inspection-audit.jpg` |
| 10 | **Chuva Pesada** | -40% | 10 dias | `event-heavy-rain-halt.jpg` |
| 11 | **Inspeção** | -10% - R$ 2k | 0 dias | `event-inspector-findings.jpg` |

### 💥 CRÍTICOS (10%)

| # | Evento | Impacto | Dias | Imagem |
|---|--------|--------|------|--------|
| 12 | **Acidente!** | -60% - R$ 15k - R$ 12k | 30 dias | `event-worker-injured.jpg` |
| 13 | **Dano Cliente** | -70% - R$ 20k - R$ 10k | 20 dias | `event-machinery-missing-alert.jpg` |
| 14 | **Máquina Roubada** | -80% - R$ 150k | 0 dias | `event-machinery-stolen-night.jpg` |
| 15 | **Contrato Cancelado** | -100% - R$ 80k | 0 dias | `event-contract-cancelled.jpg` |
| 16 | **Escritório Fechado** | -50% - R$ 500k | Game Over | `event-office-closed.jpg` |
| 17 | **Falência** | -100% | Game Over | (N/A) |

---

## 🔧 INSTALAÇÃO

### 1. Copiar imagens para `assets/`

```bash
assets/
├── event-project-complete.jpg
├── event-minor-problem.jpg
├── event-inspection-audit.jpg
├── event-new-machinery.jpg
├── event-team-success.jpg
├── event-worker-leaving.jpg
├── event-company-bankruptcy.jpg
├── event-machinery-stolen-night.jpg
├── event-machinery-missing-alert.jpg
├── event-inspector-findings.jpg
├── event-worker-injured.jpg
├── event-mega-contract.jpg
├── event-contract-cancelled.jpg
├── hub-office-modern-success.jpg
├── event-big-profit.jpg
├── event-office-closed.jpg
├── event-heavy-rain-halt.jpg
└── sounds/
    ├── crash.mp3
    ├── money-loss.mp3
    ├── success.mp3
    ├── warning.mp3
    └── alert.mp3
```

### 2. Importar script no HTML

```html
<script src="imperio-das-maquinas-events-system.js"></script>
```

---

## 💻 USO

### Instanciar o sistema

```javascript
const eventos = new ImperioEventsSystem();
```

### Disparar evento aleatório durante obra

```javascript
// Simples: 50/50 sucesso vs problema
eventos.triggerWorkEvent(sedeLevel);

// Exemplo com dados do jogador
eventos.triggerWorkEvent(playerData.currentSede);
```

### Aplicar custos administrativos mensais

```javascript
const custoMensal = eventos.applyMonthlyCosts(playerData);
console.log(`Custo administrativo: R$ ${custoMensal}`);
```

### Obter custo de uma sede específica

```javascript
const custo = eventos.getAdministrativeCost(3); // Sede Média = R$ 8.000
```

---

## 📊 CUSTOS ADMINISTRATIVOS POR SEDE

| Nível | Nome | Custo Mensal |
|-------|------|-------------|
| 1 | O Barraço | R$ 500 |
| 2 | Garagem Oficina | R$ 2.500 |
| 3 | Sede Média | R$ 8.000 |
| 4 | Sede Grande | R$ 18.000 |
| 5 | IMPÉRIO | R$ 45.000 |

---

## 🎨 ESTRUTURA DE DADOS DO JOGADOR

```javascript
const playerData = {
  caixa: 50000,              // Saldo em reais
  currentSede: 1,            // Nível da sede (1-5)
  gastoAdministrativo: 0,    // Acumulado mensal
  reputacao: 50,             // 0-100
  maquinas: [],              // Array de máquinas
  contratos: [],             // Array de contratos ativos
  gameover: false            // Game over flag
};
```

---

## 🎬 INTEGRAÇÃO COM LOOP DO JOGO

```javascript
class GameEngine {
  constructor() {
    this.eventos = new ImperioEventsSystem();
    this.playerData = { /* ... */ };
    this.monthCounter = 0;
  }

  // Chamado a cada frame/turn
  update() {
    // ... resto da lógica do jogo

    // Aplicar custos administrativos mensalmente
    if (this.monthCounter % 30 === 0) {
      this.eventos.applyMonthlyCosts(this.playerData);
    }

    // Disparar evento durante obra (chance: 10% por turn)
    if (Math.random() < 0.1) {
      this.eventos.triggerWorkEvent(this.playerData.currentSede);
    }

    this.monthCounter++;
  }

  // Ao completar uma obra
  completeWork() {
    this.eventos.triggerWorkEvent(this.playerData.currentSede);
  }
}
```

---

## 🎨 DESIGN DECISIONS

### Visual System
- **Tipografia**: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)
- **Paleta**: Cores por evento (vermelho=crítico, verde=sucesso, azul=info)
- **Espaçamento**: 16px/24px/32px (múltiplos de 8)
- **Border Radius**: 12px-16px para suavidade
- **Sombra**: `0 20px 60px rgba(0, 0, 0, 0.2)` - elegante e sutil

### Animações
- **Entrada**: 300-400ms (slideUp + fadeIn)
- **Números**: PopIn com timing escalonado
- **Backdrop**: Blur filter para não-distração
- **Easing**: cubic-bezier(0.34, 1.56, 0.64, 1) - overshoot intencional

### Imersão
- **Vibração**: Padrões de 100-500ms por severidade
- **Som**: Volume 0.3 (não invasivo)
- **Feedback**: Múltiplos sentidos (visual + háptico + áudio)

---

## 🔊 CONFIGURAÇÃO DE SONS

Os sons são **opcionais**. Se não existirem em `assets/sounds/`, o sistema funciona normalmente.

Para adicionar sons customizados:

```javascript
const eventos = new ImperioEventsSystem();

// Customizar caminho dos sons
eventos.assets.sounds.success = 'path/to/custom-success.mp3';
```

---

## 📱 RESPONSIVIDADE

O sistema é **totalmente responsivo**:
- Modal ajusta tamanho em telas pequenas (`width: 90%`)
- Grid de impactos usa `auto-fit` e `minmax`
- Fonts escaláveis (`font-size: clamp()` possível)

---

## 🎮 EXEMPLOS DE FLUXO

### Obra que vai bem
```
[Obra iniciada]
  ↓
[Evento aleatório triggered]
  ↓
[50% → Projeto Completo! +15% lucro]
  ↓
[Modal aparece com imagem + celebração]
  ↓
[Efeito vibração + som de sucesso]
  ↓
[Jogador clica "Continuar"]
  ↓
[Modal fecha com animação suave]
```

### Obra com acidente
```
[Obra em andamento]
  ↓
[Evento crítico triggered]
  ↓
[50% → ACIDENTE! -60% lucro - R$ 15k - R$ 12k]
  ↓
[Modal com imagem de acidente]
  ↓
[Vibração intensa + som de alerta]
  ↓
[Números em destaque: -60%, -R$15k, -R$12k, -25 rep]
  ↓
[Jogador absorve impacto]
```

---

## 🛠️ DEBUGGING

### Ver evento no console
```javascript
const eventos = new ImperioEventsSystem();
const event = eventos.triggerWorkEvent(1);
console.log('Evento disparado:', event.key);
console.log('Config:', event.config);
```

### Testar som manualmente
```javascript
const audio = new Audio('assets/sounds/success.mp3');
audio.play();
```

### Testar vibração
```javascript
navigator.vibrate([100, 50, 100]);  // On, Off, On
```

---

## 🚀 ROADMAP

- [ ] Adicionar efeitos de partículas nas animações
- [ ] Sistema de combo (múltiplos sucessos = bônus)
- [ ] Modales contextualmente adaptados por evento
- [ ] Histórico de eventos (replay)
- [ ] Notificações toast pré-modal
- [ ] Temas light/dark automáticos

---

## 📝 LICENÇA & CRÉDITOS

**Desenvolvido para**: Império das Máquinas PWA  
**Autor**: Wanderson  
**Versão**: 2.1.0  
**Data**: 2026-09-05  

---

## 💬 SUPORTE

Para questões ou sugestões de melhoria, abra uma issue no repositório.

**Obrigado por jogar Império das Máquinas!** 🏗️⚙️
