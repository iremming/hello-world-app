import confetti from 'canvas-confetti';

export class ConfettiButton {
  constructor() {
    this.button = null;
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
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}