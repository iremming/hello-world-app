// Hello World App
// Main application entry point

import { triggerConfettiSequence } from './confetti.js';

console.log("Hello World app loaded");

// Function to handle celebration button click
function handleCelebrationClick(button) {
  // Add clicked animation class
  button.classList.add('clicked');
  
  // Disable button to prevent spam
  button.disabled = true;
  
  // Trigger confetti animation sequence
  triggerConfettiSequence();
  
  // Re-enable button after confetti sequence completes (2.5 seconds)
  setTimeout(() => {
    button.disabled = false;
    button.classList.remove('clicked');
  }, 2500);
}

// DOM ready check and button event listener
document.addEventListener('DOMContentLoaded', function() {
  const celebrationButton = document.getElementById('celebration-button');
  
  if (celebrationButton) {
    celebrationButton.addEventListener('click', function() {
      handleCelebrationClick(this);
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
      handleCelebrationClick(this);
    });
  }
}