// Hello World App
// Main application entry point

import { createFireworks } from './fireworks.js';

console.log("Hello World app loaded");

// Get the fireworks button element and canvas
const fireworksBtn = document.getElementById('fireworks-btn');
const fireworksCanvas = document.getElementById('fireworks-canvas');

// Initialize fireworks system
let fireworksSystem = null;
if (fireworksCanvas) {
  fireworksSystem = createFireworks(fireworksCanvas);
}

// Error handling and loading state management
let isAnimating = false;

// Configure fireworks animation with custom parameters and error handling
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
    
    // Check if fireworks system is available
    if (!fireworksSystem) {
      throw new Error('Fireworks system not initialized properly');
    }
    
    // Launch first wave of fireworks
    fireworksSystem.launch(3);
    
    // Wait and launch second wave
    setTimeout(() => {
      fireworksSystem.launch(2);
    }, 500);
    
    // Launch final spectacular burst
    setTimeout(() => {
      fireworksSystem.launch(4);
    }, 1200);
    
    // Wait for animation to complete
    setTimeout(() => {
      resetButton();
    }, 4000);
    
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
  fireworksBtn.style.background = 'linear-gradient(135deg, #ff6b35, #ff1744, #ffd700)';
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
  if (event.message && (event.message.includes('fireworks') || event.message.includes('canvas'))) {
    console.error('Fireworks system loading error:', event.error);
    if (fireworksBtn) {
      fireworksBtn.textContent = '❌ System Error';
      fireworksBtn.disabled = true;
      fireworksBtn.style.opacity = '0.5';
    }
  }
});