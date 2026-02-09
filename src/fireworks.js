// Fireworks animation module
// Implements custom fireworks effects using canvas-confetti

import confetti from 'canvas-confetti';

// Default fireworks configuration
const FIREWORKS_CONFIG = {
  colors: ['#3b82f6', '#8b5cf6', '#6366f1', '#a855f7', '#ffffff', '#e0e7ff'],
  particleCount: 80,
  spread: 70,
  ticks: 200,
  gravity: 0.6,
  decay: 0.94,
  startVelocity: 45,
  scalar: 1.2
};

// Create trailing particle effect
const createTrailingParticles = (origin, colors) => {
  return confetti({
    particleCount: 15,
    spread: 30,
    origin,
    colors,
    ticks: 100,
    gravity: 0.8,
    decay: 0.96,
    startVelocity: 25,
    scalar: 0.8,
    shapes: ['circle']
  });
};

// Create main explosive burst
const createExplosiveBurst = (origin, colors, particleCount = 80) => {
  return confetti({
    ...FIREWORKS_CONFIG,
    particleCount,
    origin,
    colors,
    shapes: ['circle', 'square']
  });
};

// Create sequential firework burst at specific position
const createFireworkBurst = async (origin, colors, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      // First create trailing particles
      await createTrailingParticles(origin, colors);
      
      // Small delay before main explosion
      setTimeout(async () => {
        // Main explosive burst
        await createExplosiveBurst(origin, colors);
        
        // Secondary smaller burst for extra sparkle
        setTimeout(async () => {
          await confetti({
            particleCount: 30,
            spread: 40,
            origin,
            colors,
            ticks: 150,
            gravity: 0.7,
            decay: 0.92,
            startVelocity: 20,
            scalar: 0.6,
            shapes: ['circle']
          });
          resolve();
        }, 200);
      }, 300);
    }, delay);
  });
};

// Main fireworks animation sequence
export const triggerFireworks = async () => {
  try {
    // Validate confetti library
    if (!confetti || typeof confetti !== 'function') {
      throw new Error('Canvas-confetti library not available');
    }

    const sequences = [
      // First burst - left side, blue theme
      {
        origin: { x: 0.25, y: 0.7 },
        colors: ['#3b82f6', '#1d4ed8', '#ffffff', '#e0e7ff'],
        delay: 0
      },
      // Second burst - right side, purple theme
      {
        origin: { x: 0.75, y: 0.6 },
        colors: ['#8b5cf6', '#a855f7', '#ffffff', '#f3e8ff'],
        delay: 800
      },
      // Third burst - center high, mixed theme
      {
        origin: { x: 0.5, y: 0.4 },
        colors: ['#6366f1', '#8b5cf6', '#3b82f6', '#ffffff'],
        delay: 1600
      },
      // Final grand burst - center, all colors
      {
        origin: { x: 0.5, y: 0.6 },
        colors: FIREWORKS_CONFIG.colors,
        delay: 2400
      }
    ];

    // Execute all firework sequences
    const promises = sequences.map(seq => 
      createFireworkBurst(seq.origin, seq.colors, seq.delay)
    );

    // Wait for all sequences to complete
    await Promise.all(promises);
    
    // Add extra wait time for visual completion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('Error in fireworks animation:', error);
    throw error;
  }
};

// Export individual functions for testing
export {
  createFireworkBurst,
  createExplosiveBurst,
  createTrailingParticles,
  FIREWORKS_CONFIG
};