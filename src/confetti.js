import confetti from 'canvas-confetti';

/**
 * Triggers a basic confetti burst from the center of the screen
 */
export function triggerBasicConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

/**
 * Triggers a celebration confetti with multiple bursts
 */
export function triggerCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Triggers confetti burst effect
 */
export function triggerConfettiBurst() {
  confetti({
    particleCount: 150,
    angle: 60,
    spread: 55,
    origin: { x: 0 }
  });
  
  confetti({
    particleCount: 150,
    angle: 120,
    spread: 55,
    origin: { x: 1 }
  });
}