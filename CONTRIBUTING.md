# 🤝 Guia de Contribuição

Agradecemos seu interesse em contribuir para o **Império das Máquinas - Event System**! 

Este documento fornece diretrizes para contribuir ao projeto.

---

## 📋 Código de Conduta

Todos os contribuidores devem manter um ambiente respeitoso e inclusivo. Comportamentos abusivos, discriminatórios ou prejudiciais não serão tolerados.

---

## 🚀 Como Contribuir

### 1. Reporte um Bug 🐛

Se encontrar um bug:

1. **Verifique se já foi reportado** em [Issues](https://github.com/wanderpomares-sys/ImperioDasMaquinas-Events/issues)
2. **Crie uma nova issue** com:
   - Título descritivo
   - Descrição do bug
   - Passos para reproduzir
   - Comportamento esperado
   - Comportamento atual
   - Screenshots (se aplicável)
   - Ambiente (browser, OS, versão)

### 2. Sugira uma Feature ✨

Para sugerir uma nova feature:

1. **Verifique as discussions** existentes
2. **Crie uma nova discussion** ou issue com:
   - Descrição clara da feature
   - Casos de uso
   - Exemplos de como seria usada
   - Impacto esperado

### 3. Faça um Pull Request 📝

#### Setup

```bash
# Fork o repositório
git clone https://github.com/seu-usuario/ImperioDasMaquinas-Events.git
cd ImperioDasMaquinas-Events

# Crie uma branch
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

#### Desenvolvimento

1. **Faça suas mudanças**
2. **Teste tudo**
3. **Mantenha o código limpo**
4. **Atualize a documentação** se necessário
5. **Atualize o CHANGELOG.md**

#### Commit

```bash
# Mensagens de commit seguem este padrão:
git commit -m "feat: Adiciona novo evento de inspeção"
git commit -m "fix: Corrige vibração em dispositivos iOS"
git commit -m "docs: Atualiza README com novo exemplo"
```

**Tipos de commit:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração sem mudança funcional
- `test:` Adição/correção de testes
- `chore:` Tarefas gerais (dependências, build)

#### Push e PR

```bash
git push origin feature/sua-feature
```

Então abra um Pull Request no GitHub com:
- Título descritivo
- Descrição detalhada
- Link para issues relacionadas
- Screenshots (se visual)
- Checklist de testes

---

## ✅ Checklist para PR

Antes de submeter seu PR, verifique:

- [ ] Código segue o style do projeto
- [ ] Documentação foi atualizada
- [ ] CHANGELOG.md foi atualizado
- [ ] Não há console errors
- [ ] Testou em múltiplos browsers
- [ ] Testou em mobile
- [ ] Removeu código comentado desnecessário
- [ ] Mensagens de commit são claras
- [ ] Não há conflitos com main branch

---

## 📊 Padrões de Código

### JavaScript

```javascript
// ✅ Bom
class ImperioEventsSystem {
  constructor() {
    this.events = [];
  }

  triggerEvent(eventKey) {
    const config = this.eventConfigs[eventKey];
    this.showEventModal(config, eventKey);
  }
}

// ❌ Evitar
var sistema = function() {};
sistema.prototype.trigger = function() {};
```

### Comentários

```javascript
// ✅ Bom - explica o "porquê"
const cost = this.getAdministrativeCost(sedeLevel);
playerData.caixa -= cost; // Deduz custo mensal

// ❌ Ruim - explica o "o quê" (óbvio)
// Pega o custo
const cost = this.getAdministrativeCost(sedeLevel);
```

### Nomes

```javascript
// ✅ Bom - claro e descritivo
function calculateMonthlyCost(sedeLevel) { }
const eventImpactData = { };

// ❌ Ruim - ambíguo ou muito curto
function calc(s) { }
const data = { };
```

---

## 📁 Estrutura de Pastas

Siga a estrutura existente:

```
src/
├── js/
│   └── imperio-das-maquinas-events-system.js

assets/
├── event-*.jpg
└── sounds/
    └── *.mp3

docs/
├── QUICK-START.md
├── EVENTO-SYSTEM-README.md
└── ...

config/
└── eventos-config.json

demo/
└── evento-system-demo.html
```

---

## 🧪 Testes

Para testar suas mudanças:

```bash
# Abra a demo
open demo/evento-system-demo.html

# Ou use um servidor local
python -m http.server 8000
# Visite http://localhost:8000/demo/evento-system-demo.html
```

### Testes Manuais

- [ ] Evento dispara corretamente
- [ ] Modal abre/fecha
- [ ] Imagens carregam
- [ ] Som toca (se habilitado)
- [ ] Vibração ocorre (em dispositivos suportados)
- [ ] Responsivo em mobile
- [ ] Sem console errors
- [ ] Acessibilidade (ESC fecha modal)

---

## 📚 Documentação

Se você adicionar uma feature, atualize:

1. **EVENTO-SYSTEM-README.md** - documentação completa
2. **QUICK-START.md** - se aplicável
3. **CHANGELOG.md** - o que foi adicionado
4. **evento-config.json** - se houver nova configuração

---

## 🔄 Processo de Review

Um mantenedor do projeto fará o review seu PR:

1. **Verificará o código**
2. **Pedirá mudanças se necessário**
3. **Aprovará e fará merge**

Não hesite em pedir esclarecimentos ou sugerir melhorias!

---

## 🎯 Prioridades

Estamos particularmente interessados em:

- ✅ **Novos eventos** - adicione com imagens
- ✅ **Correções de bugs** - especialmente em mobile
- ✅ **Melhorias de performance**
- ✅ **Melhorias de documentação**
- ✅ **Testes** - cobertura é bem-vinda
- ✅ **Acessibilidade** - WCAG 2.1 AA

---

## 💬 Dúvidas?

- Abra uma [Discussion](https://github.com/wanderpomares-sys/ImperioDasMaquinas-Events/discussions)
- Crie uma [Issue](https://github.com/wanderpomares-sys/ImperioDasMaquinas-Events/issues) com tag `question`

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.

---

**Obrigado por contribuir!** 🙏

Seus esforços ajudam a tornar Império das Máquinas melhor para todos!
