const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Spaceship {
  constructor() {
    this.width = 50;
    this.height = 20;
    this.x = (canvas.width - this.width) / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 5;
    this.direction = 0;
  }

  update() {
    this.x += this.direction * this.speed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
  }

  draw() {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Bullet {
  constructor(x, y) {
    this.width = 5;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.speed = 8;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y) {
    this.width = 40;
    this.height = 20;
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const spaceship = new Spaceship();
const bullets = [];
const enemies = [];

for (let i = 0; i < 5; i++) {
  enemies.push(new Enemy(20 + i * 100, 50));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') spaceship.direction = -1;
  if (e.key === 'ArrowRight') spaceship.direction = 1;
  if (e.key === ' ' || e.key === 'Space') {
    bullets.push(new Bullet(spaceship.x + spaceship.width / 2 - 2.5, spaceship.y));
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') spaceship.direction = 0;
});

function gameLoop() {
  // Update game state
  spaceship.update();
  bullets.forEach((bullet) => bullet.update());
  bullets.forEach((bullet, index) => {
    if (bullet.y < -bullet.height) bullets.splice(index, 1);
  });

  // Collision detection
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
      }
    });
  });

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw game elements
  spaceship.draw();
  bullets.forEach((bullet) => bullet.draw());
  enemies.forEach((enemy) => enemy.draw());

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

