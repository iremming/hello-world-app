// Hello World App
// Main application entry point

import confetti from 'canvas-confetti';

console.log("Hello World app loaded");

// Get the confetti button element
const confettiBtn = document.getElementById('confetti-btn');

// Add click event listener to trigger confetti animation
confettiBtn.addEventListener('click', () => {
  confetti();
});