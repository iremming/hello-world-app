// Hello World App
// Main application entry point

import confetti from 'canvas-confetti';

console.log("Hello World app loaded");

// Get the confetti button element
const confettiBtn = document.getElementById('confetti-btn');

// Configure confetti animation with custom parameters
const triggerConfetti = () => {
  // First burst from left
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: 0.2, y: 0.6 },
    colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d']
  });
  
  // Second burst from right
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: 0.8, y: 0.6 },
    colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d']
  });
  
  // Central burst with more particles
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f87171', '#fcd34d'],
      gravity: 0.8,
      scalar: 1.2
    });
  }, 250);
};

// Add click event listener to trigger confetti animation
confettiBtn.addEventListener('click', triggerConfetti);