import confetti from 'canvas-confetti';

/**
 * Triggers a confetti celebration animation
 * @param {Object} options - Configuration options for the confetti
 * @param {Array} options.colors - Array of color strings for confetti particles
 * @param {number} options.particleCount - Number of confetti particles to generate
 * @param {number} options.spread - Spread angle in degrees
 * @param {Object} options.origin - Origin position {x: 0-1, y: 0-1}
 */
export function triggerConfetti(options = {}) {
  const defaults = {
    colors: ['#f59e0b', '#ef4444', '#f97316', '#dc2626', '#fbbf24'],
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 }
  };

  const config = { ...defaults, ...options };

  confetti({
    particleCount: config.particleCount,
    spread: config.spread,
    origin: config.origin,
    colors: config.colors
  });
}