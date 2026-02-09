// Hello World App
// Main application entry point

import confetti from 'canvas-confetti';
import { triggerFireworks } from './fireworks.js';

console.log("Hello World app loaded");

// Get the button elements
const confettiBtn = document.getElementById('confetti-btn');
const fireworksBtn = document.getElementById('fireworks-btn');

// Error handling and loading state management
let isAnimating = false;
let isFireworksAnimating = false;

// Configure confetti animation with custom parameters and error handling
const triggerConfetti = async () => {
  // Prevent multiple simultaneous animations
  if (isAnimating) {
    return;
  }
  
  try {
    // Set loading state
    isAnimating = true;
    confettiBtn.disabled = true;
    confettiBtn.textContent = '🎆 Celebrating...';
    confettiBtn.style.opacity = '0.8';
    
    // Check if confetti library is available
    if (!confetti || typeof confetti !== 'function') {
      throw new Error('Confetti library not loaded properly');
    }
    
    // First burst from left
    await confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d']
    });
    
    // Second burst from right
    await confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d']
    });
    
    // Central burst with more particles after delay
    await new Promise(resolve => {
      setTimeout(async () => {
        await confetti({
          particleCount: 100,
          spread: 120,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d'],
          gravity: 0.8,
          scalar: 1.2
        });
        resolve();
      }, 250);
    });
    
    // Wait for animation to complete
    setTimeout(() => {
      resetConfettiButton();
    }, 1000);
    
  } catch (error) {
    console.error('Error triggering confetti:', error);
    
    // Show error state
    confettiBtn.textContent = '❌ Error!';
    confettiBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    confettiBtn.style.transform = 'translateY(0)';
    confettiBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    
    // Reset button after error display
    setTimeout(() => {
      resetConfettiButton();
    }, 2000);
  }
};

// Configure fireworks animation with error handling and loading states
const triggerFireworksAnimation = async () => {
  // Prevent multiple simultaneous animations
  if (isFireworksAnimating) {
    return;
  }
  
  try {
    // Set loading state with proper styling for larger button
    isFireworksAnimating = true;
    fireworksBtn.disabled = true;
    fireworksBtn.textContent = '🚀 Launching...';
    fireworksBtn.style.opacity = '0.8';
    fireworksBtn.style.transform = 'translateY(0)';
    fireworksBtn.style.cursor = 'not-allowed';
    fireworksBtn.style.animation = 'none'; // Stop hover animation
    
    // Trigger the fireworks animation
    await triggerFireworks();
    
    // Wait for animation to complete
    setTimeout(() => {
      resetFireworksButton();
    }, 500);
    
  } catch (error) {
    console.error('Error triggering fireworks:', error);
    
    // Show error state with proper styling for larger button
    fireworksBtn.textContent = '❌ Error!';
    fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    fireworksBtn.style.transform = 'translateY(0)';
    fireworksBtn.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)';
    fireworksBtn.style.animation = 'none';
    
    // Reset button after error display
    setTimeout(() => {
      resetFireworksButton();
    }, 2000);
  }
};

// Reset confetti button to original state
const resetConfettiButton = () => {
  isAnimating = false;
  confettiBtn.disabled = false;
  confettiBtn.textContent = '🎉 Celebrate!';
  confettiBtn.style.opacity = '1';
  confettiBtn.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
  confettiBtn.style.cursor = 'pointer';
  confettiBtn.style.transform = 'translateY(0)';
  confettiBtn.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
};

// Reset fireworks button to original state with proper large button styling
const resetFireworksButton = () => {
  isFireworksAnimating = false;
  fireworksBtn.disabled = false;
  fireworksBtn.textContent = '🎆 Fireworks!';
  fireworksBtn.style.opacity = '1';
  fireworksBtn.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
  fireworksBtn.style.cursor = 'pointer';
  fireworksBtn.style.transform = 'translateY(0)';
  fireworksBtn.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
  fireworksBtn.style.animation = ''; // Re-enable hover animation
};

// Add click event listeners with error boundaries
if (confettiBtn) {
  confettiBtn.addEventListener('click', (event) => {
    event.preventDefault();
    triggerConfetti().catch(error => {
      console.error('Unhandled error in confetti animation:', error);
      resetConfettiButton();
    });
  });
} else {
  console.error('Confetti button not found in DOM');
}

if (fireworksBtn) {
  fireworksBtn.addEventListener('click', (event) => {
    event.preventDefault();
    triggerFireworksAnimation().catch(error => {
      console.error('Unhandled error in fireworks animation:', error);
      resetFireworksButton();
    });
  });
} else {
  console.error('Fireworks button not found in DOM');
}

// Handle potential library loading errors on startup
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('confetti') || event.message.includes('fireworks'))) {
    console.error('Library loading error:', event.error);
    
    if (confettiBtn) {
      confettiBtn.textContent = '❌ Library Error';
      confettiBtn.disabled = true;
      confettiBtn.style.opacity = '0.5';
      confettiBtn.style.cursor = 'not-allowed';
    }
    
    if (fireworksBtn) {
      fireworksBtn.textContent = '❌ Library Error';
      fireworksBtn.disabled = true;
      fireworksBtn.style.opacity = '0.5';
      fireworksBtn.style.cursor = 'not-allowed';
      fireworksBtn.style.animation = 'none';
    }
  }
});

// Handle DOM content loaded to ensure proper initialization
document.addEventListener('DOMContentLoaded', () => {
  // Verify all required elements are present
  if (!confettiBtn || !fireworksBtn) {
    console.error('Required button elements not found in DOM');
    return;
  }
  
  // Verify library dependencies
  if (!confetti || typeof confetti !== 'function') {
    console.error('Canvas-confetti library not properly loaded');
    
    // Disable buttons if library isn't available
    confettiBtn.textContent = '❌ Library Missing';
    confettiBtn.disabled = true;
    confettiBtn.style.opacity = '0.5';
    
    fireworksBtn.textContent = '❌ Library Missing';
    fireworksBtn.disabled = true;
    fireworksBtn.style.opacity = '0.5';
    fireworksBtn.style.animation = 'none';
  }
});

// Prevent button state issues during page unload
window.addEventListener('beforeunload', () => {
  if (isAnimating) {
    resetConfettiButton();
  }
  if (isFireworksAnimating) {
    resetFireworksButton();
  }
});