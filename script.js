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
    this.lives = 3;
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
  constructor(x, y, dx, dy) {
    this.width = 5;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
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
    this.speed = 1;
  }

  update() {
    this.x += this.speed;
  }

  draw() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  fireBullet(bulletsArray) {
    const bulletSpeed = 4;
    const numBullets = 8;
    const angleStep = (2 * Math.PI) / numBullets;

    for (let i = 0; i < numBullets; i++) {
      const angle = i * angleStep;
      const dx = bulletSpeed * Math.cos(angle);
      const dy = bulletSpeed * Math.sin(angle);

      bulletsArray.push(new Bullet(this.x + this.width / 2, this.y + this.height, dx, dy));
    }
  }
}

class Boss {
  constructor(x, y) {
    this.width = 80;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.speed = 1.5;
    this.health = 10;
  }

  update() {
    this.x += this.speed;
  }

  draw() {
    ctx.fillStyle = '#a00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const spaceship = new Spaceship();
const bullets = [];
const enemies = [];
let boss = null;

for (let i = 0; i < 5; i++) {
  enemies.push(new Enemy(20 + i * 100, 50));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') spaceship.direction = -1;
  if (e.key === 'ArrowRight') spaceship.direction = 1;
  if (e.key === ' ' || e.key === 'Space') {
    const dx = 0;
    const dy = -8;
    bullets.push(new Bullet(spaceship.x + spaceship.width / 2 - 2.5, spaceship.y, dx, dy));
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') spaceship.direction = 0;
});

const enemyBullets = [];
let gameOver = false;

function drawLives() {
  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Lives: ${spaceship.lives}`, 10, 20);
}

function gameLoop() {
  // Update game state
  spaceship.update();
  bullets.forEach((bullet) => bullet.update());
  bullets.forEach((bullet, index) => {
    if (bullet.y < -bullet.height) bullets.splice(index, 1);
  });

  // Update enemies and check for edge collisions
  let changeDirection = false;
  enemies.forEach((enemy) => {
    enemy.update();
    if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
      changeDirection = true;
    }
  });

  // Change direction and move downward if an edge collision is detected
  if (changeDirection) {
    enemies.forEach((enemy) => {
      enemy.speed = -enemy.speed;
      enemy.y += enemy.height;
    });
  }

  // Fire bullets from enemies periodically
  if (Math.random() < 0.01) {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    randomEnemy.fireBullet(enemyBullets);
  }
  
  // Update enemy bullets and remove off-screen bullets
  enemyBullets.forEach((bullet) => bullet.update());
  enemyBullets.forEach((bullet, index) => {
    if (
      bullet.x < -bullet.width ||
      bullet.x > canvas.width ||
      bullet.y < -bullet.height ||
      bullet.y > canvas.height
    ) {
      enemyBullets.splice(index, 1);
    }
  });
  
  // Spawn the boss if there are no more enemies
  if (enemies.length === 0 && boss === null) {
    boss = new Boss(canvas.width / 2 - 40, 20);
  }

  // Update and draw the boss
  if (boss) {
    boss.update();
    boss.draw();

    // Change direction and move downward if the boss hits the edge of the canvas
    if (boss.x + boss.width > canvas.width || boss.x < 0) {
      boss.speed = -boss.speed;
      boss.y += boss.height;
    }
  }

  // Collision detection for bullets and enemies
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

  // Collision detection for spaceship and enemy bullets
  enemyBullets.forEach((bullet, index) => {
    if (
      bullet.x < spaceship.x + spaceship.width &&
      bullet.x + bullet.width > spaceship.x &&
      bullet.y < spaceship.y + spaceship.height &&
      bullet.y + bullet.height > spaceship.y
    ) {
      enemyBullets.splice(index, 1);
      spaceship.lives--;
      if (spaceship.lives === 0) {
        gameOver = true;
      }
    }
  });

  // Collision detection for bullets and the boss
  if (boss) {
    bullets.forEach((bullet, index) => {
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        bullets.splice(index, 1);
        boss.health--;

        if (boss.health === 0) {
          boss = null;
        }
      }
    });
  }
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw lives
  drawLives();

  // Draw game elements
  spaceship.draw();
  bullets.forEach((bullet) => bullet.draw());
  enemyBullets.forEach((bullet) => bullet.draw());
  enemies.forEach((enemy) => enemy.draw());

  if (gameOver) {
    ctx.fillStyle = '#fff';
    ctx.font = '48px sans-serif';
    ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2);
  } else {
    // Request the next frame
    requestAnimationFrame(gameLoop);
  }
}

// Start the game loop
gameLoop();
