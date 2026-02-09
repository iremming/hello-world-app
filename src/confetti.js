import confetti from 'canvas-confetti';

/**
 * Triggers a confetti celebration animation with multiple bursts
 * @param {Object} options - Configuration options for the confetti
 * @param {Array} options.colors - Array of color strings for confetti particles
 * @param {number} options.particleCount - Number of confetti particles to generate per burst
 * @param {number} options.spread - Spread angle in degrees
 * @param {Object} options.origin - Origin position {x: 0-1, y: 0-1}
 */
export function triggerConfetti(options = {}) {
  const defaults = {
    colors: ['#f59e0b', '#ef4444', '#f97316', '#dc2626', '#fbbf24', '#fb923c'],
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.6 }
  };

  const config = { ...defaults, ...options };

  // First burst - center
  confetti({
    particleCount: config.particleCount,
    spread: config.spread,
    origin: config.origin,
    colors: config.colors,
    startVelocity: 30,
    gravity: 0.8,
    drift: 0,
    ticks: 200
  });

  // Second burst - slightly delayed and wider spread
  setTimeout(() => {
    confetti({
      particleCount: config.particleCount * 0.7,
      spread: config.spread + 20,
      origin: config.origin,
      colors: config.colors,
      startVelocity: 25,
      gravity: 0.7,
      drift: 1,
      ticks: 180
    });
  }, 150);

  // Third burst - from left side
  setTimeout(() => {
    confetti({
      particleCount: config.particleCount * 0.5,
      spread: 50,
      origin: { x: 0.1, y: 0.7 },
      colors: config.colors,
      startVelocity: 35,
      gravity: 0.9,
      drift: 1,
      angle: 60
    });
  }, 300);

  // Fourth burst - from right side
  setTimeout(() => {
    confetti({
      particleCount: config.particleCount * 0.5,
      spread: 50,
      origin: { x: 0.9, y: 0.7 },
      colors: config.colors,
      startVelocity: 35,
      gravity: 0.9,
      drift: -1,
      angle: 120
    });
  }, 450);

  // Final burst - smaller celebration from center
  setTimeout(() => {
    confetti({
      particleCount: config.particleCount * 0.3,
      spread: 40,
      origin: config.origin,
      colors: config.colors,
      startVelocity: 20,
      gravity: 0.6,
      drift: 0,
      shapes: ['circle'],
      scalar: 0.8
    });
  }, 600);
}