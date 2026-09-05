# 🚀 Quick Start - Sistema de Eventos

## ⚡ 5 MINUTOS PARA INTEGRAR

### 1️⃣ Copie os arquivos

```bash
# JavaScript principal
cp imperio-das-maquinas-events-system.js src/js/

# Imagens (17 arquivos JPG)
cp assets/event-*.jpg assets/
cp assets/hub-*.jpg assets/

# Sons (5 arquivos MP3) - OPCIONAL
cp assets/sounds/*.mp3 assets/sounds/
```

### 2️⃣ Importe no HTML

```html
<script src="src/js/imperio-das-maquinas-events-system.js"></script>
```

### 3️⃣ Use no seu código

```javascript
// Instancia UMA ÚNICA VEZ (no init)
const eventos = new ImperioEventsSystem();

// Em qualquer lugar do código, dispara evento:
eventos.triggerWorkEvent(sedeLevel);
```

### 4️⃣ Pronto! 🎉

Os modals funcionam automaticamente com:
- ✅ Imagens
- ✅ Animações
- ✅ Vibração
- ✅ Som
- ✅ Feedback visual

---

## 📝 EXEMPLO COMPLETO

```javascript
// INICIALIZAÇÃO (uma vez)
class Game {
  constructor() {
    // Sistema de eventos
    this.eventos = new ImperioEventsSystem();

    // Estado do jogador
    this.player = {
      caixa: 50000,
      currentSede: 1,
      reputacao: 50
    };
  }

  // DURANTE A OBRA
  executeWork(duration) {
    // ... lógica da obra ...

    // Chance de evento durante o trabalho
    if (Math.random() < 0.1) {
      this.eventos.triggerWorkEvent(this.player.currentSede);
    }
  }

  // FIM DO MÊS
  endOfMonth() {
    // Aplicar custos administrativos
    const cost = this.eventos.applyMonthlyCosts(this.player);
    console.log(`Custo adm: R$ ${cost}`);
  }
}

// USO
const game = new Game();
game.executeWork(100); // Dispara evento aleatoriamente
game.endOfMonth();     // Aplica custos
```

---

## 🎮 FLUXO PADRÃO

```
[Jogador inicia obra]
        ↓
[Sistema: 10% de chance de evento]
        ↓
    [SIM] → eventos.triggerWorkEvent()
        ↓
    [Modal aparece]
    [Mostra impacto]
    [Toca som + vibra]
        ↓
    [Jogador clica OK]
        ↓
    [Modal fecha]
        ↓
[Jogo continua com novo estado]
```

---

## 💰 CUSTOS ADMINISTRATIVOS

Aplica **automaticamente** a cada mês:

```javascript
// Automático no fim do mês
eventos.applyMonthlyCosts(playerData);

// Ou manual
const cost = eventos.getAdministrativeCost(3); // R$ 8.000
playerData.caixa -= cost;
```

**Níveis:**
- Nível 1: R$ 500/mês
- Nível 2: R$ 2.500/mês  
- Nível 3: R$ 8.000/mês
- Nível 4: R$ 18.000/mês
- Nível 5: R$ 45.000/mês

---

## 🎨 SEM CUSTOMIZAÇÃO NECESSÁRIA

O sistema funciona **out-of-the-box** com:

- ✅ Estilos já embutidos no JS
- ✅ Animações automáticas
- ✅ Responsive design
- ✅ Acessibilidade (ESC para fechar)
- ✅ Mobile-friendly

---

## ❓ FAQ RÁPIDO

**P: Sons são obrigatórios?**  
R: Não. Se os arquivos não existirem, o jogo funciona normalmente (sem som).

**P: Posso customizar cores/textos?**  
R: Sim. Modifique `eventConfigs` no arquivo JS.

**P: Funciona offline?**  
R: Sim. Tudo é local (imagens + sons no `assets/`).

**P: Quantos eventos existem?**  
R: 17 eventos únicos, cada um com 50% chance de sucesso/problema.

**P: Posso desativar eventos?**  
R: Sim. Remova do `eventConfigs` ou simplesmente não chame `triggerWorkEvent()`.

---

## 🔧 TROUBLESHOOTING

### Imagens não aparecem
```javascript
// Verifique o caminho
console.log(eventos.assets.images.projectComplete);
// Deve estar correto em assets/event-*.jpg
```

### Sem som
```javascript
// Normal! Sons são opcionais.
// Se quiser debug:
console.log('Som carregado:', new Audio('assets/sounds/success.mp3'));
```

### Modal não fecha com ESC
```javascript
// Está embutido. Verifique se há conflito de listeners.
```

---

## 📱 TESTANDO

### Option 1: Arquivo de demo
```bash
# Abra no navegador
open evento-system-demo.html
```

### Option 2: Console do browser
```javascript
const eventos = new ImperioEventsSystem();
eventos.triggerWorkEvent(3);  // Evento aleatório
```

---

## ✨ PRÓXIMOS PASSOS

1. **Integre o JS** no seu projeto
2. **Copie as imagens** para `assets/`
3. **Chame `triggerWorkEvent()`** quando necessário
4. **Leia README completo** para customizações

---

## 📞 SUPORTE

Documentação completa em: `EVENTO-SYSTEM-README.md`  
Config JSON em: `eventos-config.json`  
Demo interativa em: `evento-system-demo.html`

---

**Pronto? Comece agora!** 🏗️⚙️
