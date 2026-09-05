/**
 * IMPÉRIO DAS MÁQUINAS - Event System v2.1+
 * Sistema de eventos 50/50 com 4 níveis de gravidade
 * + Custos administrativos escalonados por sede
 * 
 * @author Wanderson
 * @version 2.1.0
 * @date 2026-09-05
 */

class ImperioEventsSystem {
  constructor() {
    this.eventQueue = [];
    this.modalsActive = 0;
    this.assets = {
      images: {
        projectComplete: 'assets/event-project-complete.jpg',
        minorProblem: 'assets/event-minor-problem.jpg',
        inspection: 'assets/event-inspection-audit.jpg',
        newMachinery: 'assets/event-new-machinery.jpg',
        teamSuccess: 'assets/event-team-success.jpg',
        workerLeaving: 'assets/event-worker-leaving.jpg',
        bankruptcy: 'assets/event-company-bankruptcy.jpg',
        stolenNight: 'assets/event-machinery-stolen-night.jpg',
        missingAlert: 'assets/event-machinery-missing-alert.jpg',
        inspectorFindings: 'assets/event-inspector-findings.jpg',
        workerInjured: 'assets/event-worker-injured.jpg',
        megaContract: 'assets/event-mega-contract.jpg',
        contractCancelled: 'assets/event-contract-cancelled.jpg',
        hubOfficeSuccess: 'assets/hub-office-modern-success.jpg',
        bigProfit: 'assets/event-big-profit.jpg',
        officeClosed: 'assets/event-office-closed.jpg',
        heavyRain: 'assets/event-heavy-rain-halt.jpg'
      },
      sounds: {
        crash: 'assets/sounds/crash.mp3',
        moneyLoss: 'assets/sounds/money-loss.mp3',
        success: 'assets/sounds/success.mp3',
        warning: 'assets/sounds/warning.mp3',
        alert: 'assets/sounds/alert.mp3'
      }
    };

    // Custos administrativos escalonados por sede
    this.administrativeCosts = {
      1: 500,      // O Barraço
      2: 2500,     // Garagem Oficina
      3: 8000,     // Sede Média
      4: 18000,    // Sede Grande
      5: 45000     // IMPÉRIO
    };

    // Configuração de eventos
    this.eventConfigs = this.initializeEventConfigs();
  }

  /**
   * Inicializa configuração de todos os 17 eventos
   */
  initializeEventConfigs() {
    return {
      // SUCESSO (50%)
      projectComplete: {
        type: 'success',
        chance: 5,
        title: 'OBRA COMPLETA!',
        subtitle: 'Projeto finalizado com sucesso',
        image: this.assets.images.projectComplete,
        impacts: ['+15%', '-0', '+10', '+5 reputação'],
        color: '#10b981',
        icon: '✓',
        sound: this.assets.sounds.success,
        vibration: [100, 50, 100]
      },
      teamSuccess: {
        type: 'success',
        chance: 5,
        title: 'TIME FELIZ',
        subtitle: 'Equipe celebrando bom desempenho',
        image: this.assets.images.teamSuccess,
        impacts: ['+10%', '-0', '+8', '+3 reputação'],
        color: '#3b82f6',
        icon: '🎉',
        sound: this.assets.sounds.success,
        vibration: [100, 50, 100]
      },
      megaContract: {
        type: 'success',
        chance: 5,
        title: 'MEGA CONTRATO!',
        subtitle: 'Assinado novo contrato de alto valor',
        image: this.assets.images.megaContract,
        impacts: ['+30%', '-0', '+R$ 50.000', '+15 reputação'],
        color: '#8b5cf6',
        icon: '💼',
        sound: this.assets.sounds.success,
        vibration: [200, 100, 200, 100, 200]
      },
      bigProfit: {
        type: 'success',
        chance: 5,
        title: 'LUCRO ALTO!',
        subtitle: 'Projeto finalizado com ótimo retorno',
        image: this.assets.images.bigProfit,
        impacts: ['+35%', '-0', '+R$ 120.000', '+12 reputação'],
        color: '#f59e0b',
        icon: '💰',
        sound: this.assets.sounds.success,
        vibration: [200, 100, 200, 100, 200]
      },
      workerLeaving: {
        type: 'info',
        chance: 2,
        title: 'ADEUS',
        subtitle: 'Operário experiente saiu da empresa',
        image: this.assets.images.workerLeaving,
        impacts: ['-5%', '-0', '-0', '-5 reputação'],
        color: '#ef4444',
        icon: '👋',
        sound: this.assets.sounds.warning,
        vibration: [150, 75, 150]
      },
      newMachinery: {
        type: 'success',
        chance: 3,
        title: 'MÁQUINA NOVA!',
        subtitle: 'Novo equipamento chegou em bom estado',
        image: this.assets.images.newMachinery,
        impacts: ['+8%', '-R$ 150.000', '+12', '+5 reputação'],
        color: '#06b6d4',
        icon: '⭐',
        sound: this.assets.sounds.success,
        vibration: [100, 50, 100]
      },

      // PROBLEMAS LEVES (15%)
      minorProblem: {
        type: 'problem-light',
        chance: 15,
        title: 'Ferramenta quebrada',
        subtitle: 'Pequeno problema no canteiro',
        image: this.assets.images.minorProblem,
        impacts: ['-25%', '-0', '-0', '-5 reputação'],
        impactDays: 5,
        color: '#f59e0b',
        icon: '⚠️',
        sound: this.assets.sounds.warning,
        vibration: [100]
      },

      // PROBLEMAS GRAVES (15%)
      graveProblem: {
        type: 'problem-severe',
        chance: 15,
        title: 'FALHA HIDRÁULICA!',
        subtitle: 'Problema grave com equipamento',
        image: this.assets.images.inspection,
        impacts: ['-50%', '-R$ 5.000', '-R$ 8.000', '-15 reputação'],
        impactDays: 15,
        color: '#ef4444',
        icon: '🚨',
        sound: this.assets.sounds.alert,
        vibration: [150, 100, 150]
      },

      // ACIDENTES GRAVÍSSIMOS (10%)
      accident: {
        type: 'problem-critical',
        chance: 10,
        title: 'ACIDENTE!',
        subtitle: 'Alguém se machucou no canteiro',
        image: this.assets.images.workerInjured,
        impacts: ['-60%', '-R$ 15.000', '-R$ 12.000', '-25 reputação'],
        impactDays: 30,
        color: '#dc2626',
        icon: '🆘',
        sound: this.assets.sounds.crash,
        vibration: [200, 100, 200]
      },

      // DANO AO CLIENTE (10%)
      clientDamage: {
        type: 'problem-critical',
        chance: 10,
        title: 'PERDEU',
        subtitle: 'Danificou propriedade do cliente',
        image: this.assets.images.missingAlert,
        impacts: ['-70%', '-R$ 20.000', '-R$ 10.000', '-30 reputação'],
        impactDays: 20,
        color: '#7c2d12',
        icon: '💥',
        sound: this.assets.sounds.moneyLoss,
        vibration: [300, 150, 300, 150]
      },

      // CENÁRIOS EXTRAS
      stolenMachinery: {
        type: 'problem-critical',
        chance: 8,
        title: 'MÁQUINA ROUBADA!',
        subtitle: 'Equipamento sumiu do canteiro',
        image: this.assets.images.stolenNight,
        impacts: ['-80%', '-R$ 150.000', '-0', '-40 reputação'],
        impactDays: 0,
        color: '#1f2937',
        icon: '🔓',
        sound: this.assets.sounds.alert,
        vibration: [300, 150, 300, 150, 300]
      },

      contractCancelled: {
        type: 'problem-critical',
        chance: 5,
        title: 'CONTRATO CANCELADO!',
        subtitle: 'Cliente rescindiu o acordo',
        image: this.assets.images.contractCancelled,
        impacts: ['-100%', '-R$ 80.000', '-0', '-35 reputação'],
        impactDays: 0,
        color: '#991b1b',
        icon: '✗',
        sound: this.assets.sounds.moneyLoss,
        vibration: [300, 150, 300]
      },

      bankruptcy: {
        type: 'problem-critical',
        chance: 2,
        title: 'FALÊNCIA!',
        subtitle: 'Empresa encerrou operações',
        image: this.assets.images.bankruptcy,
        impacts: ['GAME OVER', '-100%', '-0', '-100 reputação'],
        color: '#000000',
        icon: '💀',
        sound: this.assets.sounds.crash,
        vibration: [500, 200, 500]
      },

      heavyRain: {
        type: 'problem-severe',
        chance: 12,
        title: 'CHUVA!',
        subtitle: 'Obra suspensa por intempérie',
        image: this.assets.images.heavyRain,
        impacts: ['-40%', '-0', '-0', '-8 reputação'],
        impactDays: 10,
        color: '#06b6d4',
        icon: '🌧️',
        sound: this.assets.sounds.warning,
        vibration: [100, 50, 100, 50, 100]
      },

      inspection: {
        type: 'info',
        chance: 8,
        title: 'INSPEÇÃO!',
        subtitle: 'Fiscalização no canteiro',
        image: this.assets.images.inspectorFindings,
        impacts: ['-10%', '-R$ 2.000', '-0', '-2 reputação'],
        impactDays: 0,
        color: '#3b82f6',
        icon: '📋',
        sound: this.assets.sounds.warning,
        vibration: [75, 50, 75]
      },

      hubOfficeSuccess: {
        type: 'info',
        chance: 3,
        title: 'NOVO ESCRITÓRIO!',
        subtitle: 'Inauguração de nova sede',
        image: this.assets.images.hubOfficeSuccess,
        impacts: ['+5%', '-R$ 200.000', '+20', '+8 reputação'],
        color: '#10b981',
        icon: '🏢',
        sound: this.assets.sounds.success,
        vibration: [150, 100, 150]
      },

      officeClosed: {
        type: 'problem-critical',
        chance: 2,
        title: 'ENCERRADO',
        subtitle: 'Sede encerrada por insolvência',
        image: this.assets.images.officeClosed,
        impacts: ['-50%', '-100%', '-R$ 500.000', '-60 reputação'],
        color: '#1f2937',
        icon: '🔒',
        sound: this.assets.sounds.crash,
        vibration: [400, 200, 400]
      }
    };
  }

  /**
   * Trigger evento durante obra
   * 50% chance de sucesso, 50% de problema
   */
  triggerWorkEvent(sedeLevel = 1) {
    const roll = Math.random() * 100;
    const isSuccess = roll > 50;

    // Seleciona categoria
    let selectedEvent = null;
    let accumulated = 0;

    for (const [key, config] of Object.entries(this.eventConfigs)) {
      accumulated += config.chance;
      if (roll < accumulated) {
        selectedEvent = { key, config };
        break;
      }
    }

    if (!selectedEvent) {
      selectedEvent = {
        key: 'projectComplete',
        config: this.eventConfigs.projectComplete
      };
    }

    this.showEventModal(selectedEvent.config, selectedEvent.key);
    return selectedEvent;
  }

  /**
   * Mostra modal de evento com animações elegantes
   */
  showEventModal(config, eventKey) {
    // Cria container do modal
    const modal = document.createElement('div');
    modal.className = 'evento-modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
      backdrop-filter: blur(4px);
    `;

    // Card principal
    const card = document.createElement('div');
    card.className = 'evento-card';
    card.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      max-width: 520px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    // Imagem
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      width: 100%;
      height: 280px;
      background: linear-gradient(135deg, ${config.color}, ${this.lighten(config.color, 30)});
      overflow: hidden;
      position: relative;
    `;

    const img = document.createElement('img');
    img.src = config.image;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: zoomIn 0.6s ease-out;
    `;
    imageContainer.appendChild(img);

    // Header com ícone e título
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 32px 32px 16px;
      background: white;
    `;

    const iconBadge = document.createElement('div');
    iconBadge.style.cssText = `
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: ${config.color}15;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 16px;
      animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
    `;
    iconBadge.textContent = config.icon;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    title.textContent = config.title;

    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    `;
    subtitle.textContent = config.subtitle;

    header.appendChild(iconBadge);
    header.appendChild(title);
    header.appendChild(subtitle);

    // Impacts section
    const impacts = document.createElement('div');
    impacts.style.cssText = `
      padding: 24px 32px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    `;

    const impactGrid = document.createElement('div');
    impactGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 16px;
    `;

    config.impacts.forEach((impact, idx) => {
      const impactItem = document.createElement('div');
      impactItem.style.cssText = `
        text-align: center;
        animation: slideInUp 0.4s ease-out ${0.1 * (idx + 1)}s both;
      `;

      const value = document.createElement('div');
      value.style.cssText = `
        font-size: 20px;
        font-weight: 700;
        font-family: 'Monaco', 'Menlo', monospace;
        color: ${config.color};
        margin-bottom: 4px;
      `;
      value.textContent = impact;

      const label = document.createElement('div');
      label.style.cssText = `
        font-size: 11px;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      `;
      label.textContent = ['Lucro', 'Custo', 'Dias', 'Reputação'][idx] || '';

      impactItem.appendChild(value);
      impactItem.appendChild(label);
      impactGrid.appendChild(impactItem);
    });

    impacts.appendChild(impactGrid);

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      width: 100%;
      padding: 16px 32px;
      background: white;
      border: none;
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border-top: 1px solid #e5e7eb;
    `;
    closeBtn.textContent = 'Continuar';

    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.background = '#f3f4f6';
    });

    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.background = 'white';
    });

    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });

    // Monta card
    card.appendChild(imageContainer);
    card.appendChild(header);
    card.appendChild(impacts);
    card.appendChild(closeBtn);

    // Monta modal
    modal.appendChild(card);
    document.body.appendChild(modal);

    // Efeitos
    this.playSound(config.sound);
    this.vibrate(config.vibration);

    this.modalsActive++;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal(modal);
    });

    // ESC para fechar
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Fecha modal com animação
   */
  closeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      modal.remove();
      this.modalsActive--;
    }, 300);
  }

  /**
   * Reproduz som (com fallback se não disponível)
   */
  playSound(soundPath) {
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail - som não disponível
      });
    } catch (e) {
      // Silently ignore
    }
  }

  /**
   * Vibração do device (se suportado)
   */
  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Utilitário para clarear cores
   */
  lighten(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  /**
   * Calcula custo administrativo mensal por sede
   */
  getAdministrativeCost(sedeLevel) {
    return this.administrativeCosts[sedeLevel] || this.administrativeCosts[1];
  }

  /**
   * Aplica custo administrativo mensal
   */
  applyMonthlyCosts(playerData) {
    const cost = this.getAdministrativeCost(playerData.currentSede);
    playerData.caixa -= cost;
    playerData.gastoAdministrativo = (playerData.gastoAdministrativo || 0) + cost;
    
    if (playerData.caixa < 0) {
      this.triggerBankruptcy(playerData);
    }
    return cost;
  }

  /**
   * Trigger de falência
   */
  triggerBankruptcy(playerData) {
    playerData.gameover = true;
    this.showEventModal(this.eventConfigs.bankruptcy, 'bankruptcy');
  }
}

/**
 * Injetar CSS de animações no documento
 */
function injectAnimationStyles() {
  if (document.getElementById('imperio-animations')) return;

  const style = document.createElement('style');
  style.id = 'imperio-animations';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(1.05);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;

  document.head.appendChild(style);
}

// Inicializa animações ao carregar
injectAnimationStyles();

// Exporta para uso global
window.ImperioEventsSystem = ImperioEventsSystem;

/**
 * EXEMPLO DE USO:
 * 
 * // Instancia o sistema
 * const eventos = new ImperioEventsSystem();
 * 
 * // Dispara evento aleatório durante obra
 * eventos.triggerWorkEvent(sedeLevel);
 * 
 * // Aplica custos administrativos mensais
 * eventos.applyMonthlyCosts(playerData);
 * 
 * // Estrutura de dados esperada do jogador:
 * {
 *   caixa: 50000,
 *   currentSede: 1,
 *   gastoAdministrativo: 0,
 *   reputacao: 50
 * }
 */
