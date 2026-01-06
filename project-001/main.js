// Sky Fighter - Simple Airplane Shooting Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game settings
let CANVAS_WIDTH, CANVAS_HEIGHT;

function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 20, 400);
    const maxHeight = Math.min(window.innerHeight - 150, 600);
    CANVAS_WIDTH = maxWidth;
    CANVAS_HEIGHT = maxHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let enemies = [];
let bullets = [];
let stars = [];
let explosions = [];

// Player
const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00ff88',
    lastShot: 0,
    shootDelay: 200
};

// Input state
const keys = {
    left: false,
    right: false,
    shoot: false
};

// Initialize player position
function initPlayer() {
    player.x = CANVAS_WIDTH / 2 - player.width / 2;
    player.y = CANVAS_HEIGHT - player.height - 20;
}

// Create stars for background
function createStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 0.5
        });
    }
}

// Spawn enemy
function spawnEnemy() {
    const size = 30 + Math.random() * 20;
    enemies.push({
        x: Math.random() * (CANVAS_WIDTH - size),
        y: -size,
        width: size,
        height: size,
        speed: 2 + Math.random() * 2 + score / 500,
        color: `hsl(${Math.random() * 60 + 300}, 100%, 50%)`
    });
}

// Shoot bullet
function shoot() {
    const now = Date.now();
    if (now - player.lastShot < player.shootDelay) return;
    player.lastShot = now;

    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        speed: 8,
        color: '#ffff00'
    });
}

// Create explosion
function createExplosion(x, y) {
    const particles = [];
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 20,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
        });
    }
    explosions.push(...particles);
}

// Draw player (simple airplane shape)
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    // Body
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.7);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height * 0.4, 5, 0, Math.PI * 2);
    ctx.fill();
}

// Draw enemy (simple enemy shape)
function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width, enemy.y);
    ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.3);
    ctx.lineTo(enemy.x, enemy.y);
    ctx.closePath();
    ctx.fill();
}

// Draw bullet
function drawBullet(bullet) {
    ctx.fillStyle = bullet.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
}

// Draw stars
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// Draw explosions
function drawExplosions() {
    explosions.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Move player
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed;
    }
    if (keys.shoot) {
        shoot();
    }

    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
    });

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });

    // Update enemies
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        // Check collision with player
        if (checkCollision(player, enemy)) {
            enemies.splice(eIndex, 1);
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            lives--;
            livesEl.textContent = `LIVES: ${lives}`;
            if (lives <= 0) {
                gameOver();
            }
            return;
        }

        // Check collision with bullets
        bullets.forEach((bullet, bIndex) => {
            if (checkCollision(bullet, enemy)) {
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                scoreEl.textContent = `SCORE: ${score}`;
            }
        });

        // Remove if off screen
        if (enemy.y > CANVAS_HEIGHT) {
            enemies.splice(eIndex, 1);
        }
    });

    // Update explosions
    explosions.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            explosions.splice(index, 1);
        }
    });

    // Spawn enemies
    if (Math.random() < 0.02 + score / 5000) {
        spawnEnemy();
    }
}

// Check collision between two rectangles
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    drawStars();

    // Draw bullets
    bullets.forEach(drawBullet);

    // Draw enemies
    enemies.forEach(drawEnemy);

    // Draw player
    drawPlayer();

    // Draw explosions
    drawExplosions();
}

// Game loop
function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    explosions = [];
    scoreEl.textContent = `SCORE: ${score}`;
    livesEl.textContent = `LIVES: ${lives}`;
    initPlayer();
    createStars();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    gameLoop();
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        keys.shoot = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === ' ' || e.key === 'ArrowUp') keys.shoot = false;
});

// Touch controls
let touchX = null;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;

    // Determine action based on touch position
    const centerZone = CANVAS_WIDTH / 3;
    if (touchX < centerZone) {
        keys.left = true;
    } else if (touchX > CANVAS_WIDTH - centerZone) {
        keys.right = true;
    } else {
        keys.shoot = true;
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const newTouchX = touch.clientX - rect.left;

    // Reset all controls
    keys.left = false;
    keys.right = false;
    keys.shoot = false;

    // Update based on position
    const centerZone = CANVAS_WIDTH / 3;
    if (newTouchX < centerZone) {
        keys.left = true;
    } else if (newTouchX > CANVAS_WIDTH - centerZone) {
        keys.right = true;
    } else {
        keys.shoot = true;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.left = false;
    keys.right = false;
    keys.shoot = false;
}, { passive: false });

// Button controls
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize
initPlayer();
createStars();
draw();
