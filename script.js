// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a simple rectangle
  ctx.fillStyle = '#f00';
  ctx.fillRect(50, 50, 100, 100);
}

function gameLoop() {
  // Update game state

  // Draw game elements
  draw();

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

