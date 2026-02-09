// Hello World App
// Main application entry point

import { ConfettiButton } from './components/ConfettiButton.js';

console.log("Hello World app loaded");

// Create and append confetti button
const confettiButton = new ConfettiButton();
const buttonElement = confettiButton.createElement();

// Get the app container and append the button
const app = document.getElementById('app');
app.appendChild(buttonElement);