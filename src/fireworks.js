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

// Main fireworks animation sequence with 4 sequential bursts
export const triggerFireworks = async () => {
  try {
    // Validate confetti library
    if (!confetti || typeof confetti !== 'function') {
      throw new Error('Canvas-confetti library not available');
    }

    // First burst - left side, bright blue theme
    await createFireworkBurst(
      { x: 0.2, y: 0.6 },
      ['#3b82f6', '#1e40af', '#ffffff', '#dbeafe'],
      0
    );

    // Wait before second burst
    await new Promise(resolve => setTimeout(resolve, 600));

    // Second burst - right side, purple theme
    await createFireworkBurst(
      { x: 0.8, y: 0.5 },
      ['#8b5cf6', '#7c3aed', '#ffffff', '#f3e8ff'],
      0
    );

    // Wait before third burst
    await new Promise(resolve => setTimeout(resolve, 700));

    // Third burst - center high, indigo theme
    await createFireworkBurst(
      { x: 0.5, y: 0.3 },
      ['#6366f1', '#4f46e5', '#a5b4fc', '#ffffff'],
      0
    );

    // Wait before final burst
    await new Promise(resolve => setTimeout(resolve, 800));

    // Final grand burst - center, all colors mixed
    await createFireworkBurst(
      { x: 0.5, y: 0.6 },
      ['#3b82f6', '#8b5cf6', '#6366f1', '#a855f7', '#ffffff', '#e0e7ff'],
      0
    );
    
    // Add extra wait time for visual completion
    await new Promise(resolve => setTimeout(resolve, 1200));
    
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