// Hello World App
// Main application entry point

import { triggerConfettiSequence } from './confetti.js';

console.log("Hello World app loaded");

// DOM ready check and button event listener
document.addEventListener('DOMContentLoaded', function() {
  const celebrationButton = document.getElementById('celebration-button');
  
  if (celebrationButton) {
    celebrationButton.addEventListener('click', function() {
      // Trigger confetti animation sequence
      triggerConfettiSequence();
    });
  }
});

// Also handle case where script loads after DOM is ready
if (document.readyState === 'loading') {
  // DOM is still loading, event listener above will handle it
} else {
  // DOM is already loaded
  const celebrationButton = document.getElementById('celebration-button');
  
  if (celebrationButton) {
    celebrationButton.addEventListener('click', function() {
      // Trigger confetti animation sequence
      triggerConfettiSequence();
    });
  }
}