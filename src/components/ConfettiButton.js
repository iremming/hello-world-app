import confetti from 'canvas-confetti';

export class ConfettiButton {
  constructor() {
    this.button = null;
    this.animationVariants = [
      'standard',
      'fireworks', 
      'stars'
    ];
    this.currentVariantIndex = 0;
  }

  createElement() {
    this.button = document.createElement('button');
    this.button.className = 'confetti-button';
    this.button.textContent = '🎉 Celebrate!';
    this.bindEvents();
    return this.button;
  }

  bindEvents() {
    if (this.button) {
      this.button.addEventListener('click', () => {
        this.triggerConfetti();
      });
    }
  }

  triggerConfetti() {
    const variant = this.getRandomVariant();
    
    switch (variant) {
      case 'standard':
        this.standardBurst();
        break;
      case 'fireworks':
        this.fireworks();
        break;
      case 'stars':
        this.stars();
        break;
      default:
        this.standardBurst();
    }
  }

  getRandomVariant() {
    return this.animationVariants[Math.floor(Math.random() * this.animationVariants.length)];
  }

  standardBurst() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  fireworks() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }

  stars() {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['FFE400', 'FFBD00', 'E89611', 'E89611', 'FFCA6C', 'FDFFB8']
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }
}