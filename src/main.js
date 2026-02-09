// Hello World App
// Main application entry point

import { triggerConfetti } from './confetti.js';

console.log("Hello World app loaded");

// Get the confetti button and add click event listener
const confettiButton = document.getElementById('confetti-button');
if (confettiButton) {
  confettiButton.addEventListener('click', () => {
    triggerConfetti();
  });
}