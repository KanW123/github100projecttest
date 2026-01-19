// Tiny Town - Isometric City Builder
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const moneyEl = document.getElementById('money');
const infoEl = document.getElementById('info');
const toolButtons = document.querySelectorAll('.tool-btn');

// Isometric tile settings
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_SIZE = 10;

// Canvas settings
let CANVAS_WIDTH, CANVAS_HEIGHT;
let offsetX, offsetY;

function resizeCanvas() {
    CANVAS_WIDTH = Math.min(window.innerWidth - 16, 500);
    CANVAS_HEIGHT = Math.min(window.innerHeight - 140, 450);
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    // Center the grid
    offsetX = CANVAS_WIDTH / 2;
    offsetY = 60;
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
});

// Game state
let money = 1000;
let currentTool = 'grass';
let grid = [];

// Tile types with colors and costs
const tileTypes = {
    empty: { color: null, cost: 0 },
    grass: { color: '#4ade80', darkColor: '#22c55e', cost: 0 },
    water: { color: '#60a5fa', darkColor: '#3b82f6', cost: 0 },
    road: { color: '#9ca3af', darkColor: '#6b7280', cost: 0 },
    house: { color: '#fbbf24', darkColor: '#f59e0b', cost: 100, height: 20, building: true },
    shop: { color: '#f472b6', darkColor: '#ec4899', cost: 200, height: 25, building: true },
    tree: { color: '#166534', darkColor: '#14532d', cost: 50, height: 15, building: true }
};

// Initialize grid
function initGrid() {
    grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = 'grass';
        }
    }
}

// Convert grid coordinates to screen coordinates
function gridToScreen(gx, gy) {
    const screenX = offsetX + (gx - gy) * (TILE_WIDTH / 2);
    const screenY = offsetY + (gx + gy) * (TILE_HEIGHT / 2);
    return { x: screenX, y: screenY };
}

// Convert screen coordinates to grid coordinates
function screenToGrid(screenX, screenY) {
    const relX = screenX - offsetX;
    const relY = screenY - offsetY;

    const gx = Math.floor((relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2);
    const gy = Math.floor((relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2);

    return { x: gx, y: gy };
}

// Draw isometric tile (diamond shape)
function drawTile(gx, gy, type) {
    const tile = tileTypes[type];
    if (!tile || !tile.color) return;

    const pos = gridToScreen(gx, gy);
    const x = pos.x;
    const y = pos.y;

    // Draw base tile (diamond)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fillStyle = tile.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw building if applicable
    if (tile.building && tile.height) {
        const h = tile.height;

        // Left face
        ctx.beginPath();
        ctx.moveTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - h);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - h);
        ctx.closePath();
        ctx.fillStyle = tile.darkColor;
        ctx.fill();
        ctx.stroke();

        // Right face
        ctx.beginPath();
        ctx.moveTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - h);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - h);
        ctx.closePath();
        ctx.fillStyle = tile.color;
        ctx.fill();
        ctx.stroke();

        // Top face
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_HEIGHT - h - TILE_HEIGHT);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - h);
        ctx.lineTo(x, y + TILE_HEIGHT - h);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - h);
        ctx.closePath();
        ctx.fillStyle = tile.color;
        ctx.fill();
        ctx.stroke();
    }
}

// Draw grid outline for hover effect
function drawGridOutline(gx, gy) {
    if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return;

    const pos = gridToScreen(gx, gy);
    const x = pos.x;
    const y = pos.y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw everything
function draw(hoverX = -1, hoverY = -1) {
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw tiles from back to front (painter's algorithm)
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            drawTile(x, y, grid[y][x]);
        }
    }

    // Draw hover outline
    if (hoverX >= 0 && hoverY >= 0) {
        drawGridOutline(hoverX, hoverY);
    }
}

// Place tile
function placeTile(gx, gy) {
    if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return;

    const tile = tileTypes[currentTool];
    if (!tile) return;

    if (currentTool === 'delete') {
        grid[gy][gx] = 'grass';
        infoEl.textContent = '削除しました';
    } else {
        if (tile.cost > money) {
            infoEl.textContent = 'お金が足りません！';
            return;
        }

        // Don't charge for placing same tile or on empty
        if (grid[gy][gx] !== currentTool && tile.cost > 0) {
            money -= tile.cost;
            moneyEl.textContent = `$${money}`;
        }

        grid[gy][gx] = currentTool;
        infoEl.textContent = `${currentTool} を配置`;
    }

    draw();
}

// Handle input
let lastHoverX = -1, lastHoverY = -1;

function handleInput(clientX, clientY, isClick = false) {
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const gridPos = screenToGrid(screenX, screenY);

    if (isClick) {
        placeTile(gridPos.x, gridPos.y);
    } else {
        if (gridPos.x !== lastHoverX || gridPos.y !== lastHoverY) {
            lastHoverX = gridPos.x;
            lastHoverY = gridPos.y;
            draw(gridPos.x, gridPos.y);
        }
    }
}

// Mouse events
canvas.addEventListener('mousemove', (e) => {
    handleInput(e.clientX, e.clientY, false);
});

canvas.addEventListener('click', (e) => {
    handleInput(e.clientX, e.clientY, true);
});

canvas.addEventListener('mouseleave', () => {
    lastHoverX = -1;
    lastHoverY = -1;
    draw();
});

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY, true);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY, false);
}, { passive: false });

// Tool selection
toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;

        const tile = tileTypes[currentTool];
        if (tile && tile.cost > 0) {
            infoEl.textContent = `${currentTool} ($${tile.cost})`;
        } else if (currentTool === 'delete') {
            infoEl.textContent = '削除モード';
        } else {
            infoEl.textContent = `${currentTool} を選択`;
        }
    });
});

// Initialize
initGrid();
draw();
