// Hello World App
// Main application entry point

import confetti from 'canvas-confetti';

console.log("Hello World app loaded");

// Get the fireworks button element
const fireworksBtn = document.getElementById('fireworks-btn');

// Error handling and loading state management
let isAnimating = false;
let activeAnimations = [];

// Fireworks color palette
const fireworksColors = {
  blue: ['#0ea5e9', '#3b82f6', '#1d4ed8'],
  white: ['#ffffff', '#f1f5f9', '#e2e8f0'],
  gold: ['#fbbf24', '#f59e0b', '#d97706'],
  green: ['#10b981', '#059669', '#047857'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9'],
  red: ['#ef4444', '#dc2626', '#b91c1c']
};

// Get random colors from fireworks palette
const getRandomFireworksColors = () => {
  const colorSets = Object.values(fireworksColors);
  const randomSet = colorSets[Math.floor(Math.random() * colorSets.length)];
  return randomSet;
};

// Cleanup function for particle systems
const cleanupAnimations = () => {
  activeAnimations.forEach(animation => {
    if (animation && typeof animation.cancel === 'function') {
      animation.cancel();
    }
  });
  activeAnimations = [];
};

// Chrysanthemum burst pattern - circular explosion
const chrysanthemumBurst = async (x, y) => {
  const particleCount = Math.min(120, 80); // Optimized count
  const animation = confetti({
    particleCount,
    spread: 180,
    origin: { x, y },
    colors: getRandomFireworksColors(),
    gravity: 0.8,
    scalar: 1.2,
    drift: 0.1,
    ticks: 400,
    startVelocity: 50,
    shapes: ['circle']
  });
  activeAnimations.push(animation);
  return animation;
};

// Palm tree effect - cascading downward
const palmTreeBurst = async (x, y) => {
  const particleCount = Math.min(100, 70); // Optimized count
  const animation = confetti({
    particleCount,
    spread: 60,
    origin: { x, y },
    colors: getRandomFireworksColors(),
    gravity: 1.2,
    scalar: 1.8,
    drift: 0.3,
    ticks: 500,
    startVelocity: 40,
    angle: 270
  });
  activeAnimations.push(animation);
  return animation;
};

// Ring explosion - expanding circle
const ringExplosion = async (x, y) => {
  const rings = 3;
  const animations = [];
  
  for (let i = 0; i < rings; i++) {
    setTimeout(async () => {
      const particleCount = Math.min(40, 30); // Optimized count
      const animation = confetti({
        particleCount,
        spread: 360,
        origin: { x, y },
        colors: getRandomFireworksColors(),
        gravity: 0.4,
        scalar: 0.8 + (i * 0.3),
        drift: 0,
        ticks: 200 + (i * 100),
        startVelocity: 25 + (i * 10)
      });
      activeAnimations.push(animation);
      animations.push(animation);
    }, i * 150);
  }
  
  return Promise.all(animations);
};

// Create firework burst at specific position with random pattern
const createFireworkBurst = async (x, y) => {
  const patterns = [chrysanthemumBurst, palmTreeBurst, ringExplosion];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return randomPattern(x, y);
};

// Launch firework with upward trajectory followed by burst
const launchFirework = async (startX, endX, endY) => {
  try {
    // Launch trail upward with reduced particles
    const trailAnimation = confetti({
      particleCount: 12, // Reduced for performance
      spread: 15,
      origin: { x: startX, y: 1 },
      colors: getRandomFireworksColors(),
      gravity: -0.1,
      scalar: 0.8,
      ticks: 100,
      startVelocity: 35,
      angle: 90
    });
    activeAnimations.push(trailAnimation);
    
    // Wait for trail to reach peak, then burst
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await createFireworkBurst(endX, endY);
          resolve();
        } catch (error) {
          console.warn('Firework burst error:', error);
          resolve(); // Continue sequence even if one firework fails
        }
      }, 600);
    });
  } catch (error) {
    console.warn('Firework launch error:', error);
    return Promise.resolve();
  }
};

// Fallback animation if canvas-confetti fails
const fallbackFireworks = async () => {
  if (!fireworksBtn) return;
  
  // Simple CSS animation fallback
  const originalText = fireworksBtn.textContent;
  const explosions = ['💥', '✨', '🌟', '⭐', '💫'];
  
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const randomExplosion = explosions[Math.floor(Math.random() * explosions.length)];
      fireworksBtn.textContent = randomExplosion;
      fireworksBtn.style.transform = `scale(${1.1 + Math.random() * 0.3})`;
    }, i * 400);
  }
  
  setTimeout(() => {
    fireworksBtn.textContent = originalText;
    fireworksBtn.style.transform = 'scale(1)';
  }, 2500);
};

// Sequential fireworks show with staggered timing
const triggerFireworks = async () => {
  // Prevent multiple simultaneous animations
  if (isAnimating) {
    return;
  }
  
  try {
    // Clean up any existing animations
    cleanupAnimations();
    
    // Set loading state
    isAnimating = true;
    fireworksBtn.disabled = true;
    fireworksBtn.textContent = '🚀 Launching...';
    fireworksBtn.style.opacity = '0.8';
    
    // Check if confetti library is available
    if (!confetti || typeof confetti !== 'function') {
      throw new Error('Confetti library not available');
    }
    
    // Performance monitoring
    const startTime = performance.now();
    
    // Staggered fireworks sequence with different patterns
    const fireworkSequence = [
      { delay: 0, startX: 0.2, endX: 0.2, endY: 0.3 },
      { delay: 800, startX: 0.8, endX: 0.8, endY: 0.4 },
      { delay: 1600, startX: 0.5, endX: 0.5, endY: 0.2 },
      { delay: 2200, startX: 0.3, endX: 0.3, endY: 0.35 },
      { delay: 2400, startX: 0.7, endX: 0.7, endY: 0.25 },
      { delay: 3200, startX: 0.5, endX: 0.5, endY: 0.3 } // Grand finale
    ];
    
    // Launch all fireworks with staggered timing
    const fireworkPromises = fireworkSequence.map(({ delay, startX, endX, endY }) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await launchFirework(startX, endX, endY);
            resolve();
          } catch (error) {
            console.warn('Individual firework failed:', error);
            resolve(); // Continue sequence
          }
        }, delay);
      });
    });
    
    // Wait for all fireworks to complete
    await Promise.all(fireworkPromises);
    
    // Performance logging
    const endTime = performance.now();
    console.log(`Fireworks sequence completed in ${endTime - startTime}ms`);
    
    // Reset button after complete show
    setTimeout(() => {
      resetButton();
    }, 1500);
    
  } catch (error) {
    console.error('Error triggering fireworks:', error);
    
    // Try fallback animation
    try {
      await fallbackFireworks();
    } catch (fallbackError) {
      console.error('Fallback animation also failed:', fallbackError);
    }
    
    // Show error state
    fireworksBtn.textContent = '❌ Error!';
    fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    // Reset button after error display
    setTimeout(() => {
      resetButton();
    }, 2000);
  }
};

// Reset button to original state with cleanup
const resetButton = () => {
  // Clean up any remaining animations
  cleanupAnimations();
  
  isAnimating = false;
  fireworksBtn.disabled = false;
  fireworksBtn.textContent = '🎆 Launch Fireworks!';
  fireworksBtn.style.opacity = '1';
  fireworksBtn.style.background = 'linear-gradient(135deg, #1d4ed8, #7c3aed)';
  fireworksBtn.style.transform = 'scale(1)';
};

// Add click event listener with error boundary
if (fireworksBtn) {
  fireworksBtn.addEventListener('click', (event) => {
    event.preventDefault();
    triggerFireworks().catch(error => {
      console.error('Unhandled error in fireworks animation:', error);
      resetButton();
    });
  });
} else {
  console.error('Fireworks button not found in DOM');
}

// Handle potential library loading errors on startup
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('confetti')) {
    console.error('Confetti library loading error:', event.error);
    if (fireworksBtn) {
      fireworksBtn.textContent = '❌ Library Error';
      fireworksBtn.disabled = true;
      fireworksBtn.style.opacity = '0.5';
    }
  }
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  cleanupAnimations();
});

// Performance optimization: cleanup animations after 10 seconds
setInterval(() => {
  if (!isAnimating && activeAnimations.length > 0) {
    cleanupAnimations();
  }
}, 10000);