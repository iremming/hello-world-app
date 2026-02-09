// Hello World App
// Main application entry point

import confetti from 'canvas-confetti';

console.log("Hello World app loaded");

// Get the fireworks button element
const fireworksBtn = document.getElementById('fireworks-btn');

// Error handling and loading state management
let isAnimating = false;

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

// Create firework burst at specific position
const createFireworkBurst = async (x, y, particleCount = 80, spread = 120) => {
  return confetti({
    particleCount,
    spread,
    origin: { x, y },
    colors: getRandomFireworksColors(),
    gravity: 0.6,
    scalar: 1.4,
    drift: 0,
    ticks: 300,
    startVelocity: 45
  });
};

// Launch firework with upward trajectory followed by burst
const launchFirework = async (startX, endX, endY) => {
  // Launch trail upward
  await confetti({
    particleCount: 15,
    spread: 15,
    origin: { x: startX, y: 1 },
    colors: getRandomFireworksColors(),
    gravity: -0.1,
    scalar: 0.8,
    ticks: 100,
    startVelocity: 35,
    angle: 90
  });
  
  // Wait for trail to reach peak, then burst
  setTimeout(async () => {
    await createFireworkBurst(endX, endY, 100, 140);
  }, 600);
};

// Sequential fireworks show
const triggerFireworks = async () => {
  // Prevent multiple simultaneous animations
  if (isAnimating) {
    return;
  }
  
  try {
    // Set loading state
    isAnimating = true;
    fireworksBtn.disabled = true;
    fireworksBtn.textContent = '🚀 Launching...';
    fireworksBtn.style.opacity = '0.8';
    
    // Check if confetti library is available
    if (!confetti || typeof confetti !== 'function') {
      throw new Error('Confetti library not loaded properly');
    }
    
    // First firework - left side
    await launchFirework(0.2, 0.2, 0.3);
    
    // Second firework - right side (delayed)
    setTimeout(async () => {
      await launchFirework(0.8, 0.8, 0.4);
    }, 800);
    
    // Third firework - center (delayed)
    setTimeout(async () => {
      await launchFirework(0.5, 0.5, 0.2);
    }, 1600);
    
    // Fourth and fifth fireworks - simultaneous finale
    setTimeout(async () => {
      await Promise.all([
        launchFirework(0.3, 0.3, 0.35),
        launchFirework(0.7, 0.7, 0.25)
      ]);
    }, 2400);
    
    // Grand finale burst
    setTimeout(async () => {
      await createFireworkBurst(0.5, 0.3, 150, 160);
    }, 3200);
    
    // Reset button after complete show
    setTimeout(() => {
      resetButton();
    }, 4500);
    
  } catch (error) {
    console.error('Error triggering fireworks:', error);
    
    // Show error state
    fireworksBtn.textContent = '❌ Error!';
    fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    // Reset button after error display
    setTimeout(() => {
      resetButton();
    }, 2000);
  }
};

// Reset button to original state
const resetButton = () => {
  isAnimating = false;
  fireworksBtn.disabled = false;
  fireworksBtn.textContent = '🎆 Launch Fireworks!';
  fireworksBtn.style.opacity = '1';
  fireworksBtn.style.background = 'linear-gradient(135deg, #1d4ed8, #7c3aed)';
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