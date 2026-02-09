// Hello World App
// Main application entry point

import { createFireworks } from './fireworks.js';

console.log("Hello World app loaded");

// Canvas support detection
function isCanvasSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch (error) {
    console.error('Canvas support detection failed:', error);
    return false;
  }
}

// Get the fireworks button element and canvas
const fireworksBtn = document.getElementById('fireworks-btn');
const fireworksCanvas = document.getElementById('fireworks-canvas');

// Check for canvas support and graceful degradation
if (!isCanvasSupported()) {
  console.error('Canvas not supported in this browser');
  if (fireworksBtn) {
    fireworksBtn.textContent = '❌ Canvas Not Supported';
    fireworksBtn.disabled = true;
    fireworksBtn.style.opacity = '0.5';
    fireworksBtn.style.background = 'linear-gradient(135deg, #666, #444)';
  }
}

// Initialize fireworks system with error handling
let fireworksSystem = null;
let initializationError = null;

try {
  if (fireworksCanvas && isCanvasSupported()) {
    fireworksSystem = createFireworks(fireworksCanvas);
    console.log('Fireworks system initialized successfully');
  } else if (!fireworksCanvas) {
    throw new Error('Fireworks canvas element not found');
  }
} catch (error) {
  console.error('Failed to initialize fireworks system:', error);
  initializationError = error;
  
  if (fireworksBtn) {
    fireworksBtn.textContent = '❌ System Error';
    fireworksBtn.disabled = true;
    fireworksBtn.style.opacity = '0.5';
    fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  }
}

// Error handling and loading state management
let isAnimating = false;

// Configure fireworks animation with comprehensive error handling
const triggerFireworks = async () => {
  // Check for initialization errors first
  if (initializationError) {
    console.error('Cannot trigger fireworks due to initialization error:', initializationError);
    showError('System initialization failed');
    return;
  }

  // Prevent multiple simultaneous animations
  if (isAnimating) {
    console.warn('Fireworks animation already in progress');
    return;
  }
  
  try {
    // Verify system is still available
    if (!fireworksSystem) {
      throw new Error('Fireworks system not initialized properly');
    }

    // Verify canvas is still valid
    if (!fireworksCanvas || !fireworksCanvas.getContext) {
      throw new Error('Canvas element is not available or invalid');
    }

    // Test canvas context
    const ctx = fireworksCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context from canvas');
    }
    
    // Set loading state
    isAnimating = true;
    fireworksBtn.disabled = true;
    fireworksBtn.textContent = '🚀 Launching...';
    fireworksBtn.style.opacity = '0.8';
    
    console.log('Starting fireworks animation sequence');
    
    // Launch first wave of fireworks
    fireworksSystem.launch(3);
    console.log('Launched first wave (3 fireworks)');
    
    // Wait and launch second wave
    setTimeout(() => {
      try {
        if (fireworksSystem) {
          fireworksSystem.launch(2);
          console.log('Launched second wave (2 fireworks)');
        }
      } catch (error) {
        console.error('Error launching second wave:', error);
      }
    }, 500);
    
    // Launch final spectacular burst
    setTimeout(() => {
      try {
        if (fireworksSystem) {
          fireworksSystem.launch(4);
          console.log('Launched final burst (4 fireworks)');
        }
      } catch (error) {
        console.error('Error launching final burst:', error);
      }
    }, 1200);
    
    // Wait for animation to complete
    setTimeout(() => {
      console.log('Fireworks animation sequence completed');
      resetButton();
    }, 4000);
    
  } catch (error) {
    console.error('Error triggering fireworks animation:', error);
    showError(error.message || 'Unknown fireworks error');
  }
};

// Show error state on button
const showError = (message) => {
  console.error('Displaying error state:', message);
  
  if (fireworksBtn) {
    fireworksBtn.textContent = '❌ Error!';
    fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    fireworksBtn.style.opacity = '0.8';
  }
  
  // Reset button after error display
  setTimeout(() => {
    resetButton();
  }, 2000);
};

// Reset button to original state
const resetButton = () => {
  if (!fireworksBtn) return;
  
  isAnimating = false;
  
  // Don't reset if there was an initialization error
  if (initializationError) {
    return;
  }
  
  fireworksBtn.disabled = false;
  fireworksBtn.textContent = '🎆 Launch Fireworks!';
  fireworksBtn.style.opacity = '1';
  fireworksBtn.style.background = 'linear-gradient(135deg, #ff6b35, #ff1744, #ffd700)';
  
  console.log('Button reset to original state');
};

// Add click event listener with comprehensive error boundary
if (fireworksBtn) {
  fireworksBtn.addEventListener('click', (event) => {
    event.preventDefault();
    
    console.log('Fireworks button clicked');
    
    // Wrap in try-catch for immediate errors
    try {
      triggerFireworks().catch(error => {
        console.error('Unhandled error in fireworks animation promise:', error);
        showError('Animation failed');
      });
    } catch (error) {
      console.error('Immediate error in fireworks trigger:', error);
      showError('Trigger failed');
    }
  });
  
  console.log('Fireworks button event listener attached');
} else {
  console.error('Fireworks button element not found in DOM');
}

// Handle potential library loading errors and runtime errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const filename = event.filename || '';
  
  // Check if error is related to fireworks or canvas
  if (errorMessage.toLowerCase().includes('fireworks') || 
      errorMessage.toLowerCase().includes('canvas') ||
      filename.includes('fireworks.js')) {
    
    console.error('Fireworks system runtime error detected:', {
      message: errorMessage,
      filename: filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // Disable button if not already disabled
    if (fireworksBtn && !fireworksBtn.disabled) {
      fireworksBtn.textContent = '❌ System Error';
      fireworksBtn.disabled = true;
      fireworksBtn.style.opacity = '0.5';
      fireworksBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    
    // Clear any running animation
    if (fireworksSystem) {
      try {
        fireworksSystem.clear();
      } catch (clearError) {
        console.error('Error clearing fireworks system:', clearError);
      }
    }
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('fireworks') || 
       event.reason.message.includes('canvas'))) {
    
    console.error('Unhandled fireworks promise rejection:', event.reason);
    
    // Prevent the default browser error handling
    event.preventDefault();
    
    // Show error state
    showError('System error occurred');
  }
});

// Check for canvas context loss and handle gracefully
if (fireworksCanvas && isCanvasSupported()) {
  fireworksCanvas.addEventListener('webglcontextlost', (event) => {
    console.warn('Canvas context lost, preventing default and attempting recovery');
    event.preventDefault();
    
    // Attempt to reinitialize
    setTimeout(() => {
      try {
        if (isCanvasSupported()) {
          fireworksSystem = createFireworks(fireworksCanvas);
          console.log('Fireworks system reinitialized after context loss');
        }
      } catch (error) {
        console.error('Failed to reinitialize after context loss:', error);
        showError('System recovery failed');
      }
    }, 1000);
  });
}

console.log('Fireworks application initialization completed');