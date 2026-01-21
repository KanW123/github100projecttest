// P2P Shooting Game - Main Game Logic

// ===========================================
// Configuration
// ===========================================
const VERSION = 'v1.1.0';

const CONFIG = {
    // Cloudflare Workers Signaling Server
    SIGNALING_SERVER: 'wss://p2p-signaling.ailovedirector.workers.dev',
    // Set to false for real P2P, true for solo testing
    USE_MOCK: false,

    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    PLAYER: {
        WIDTH: 40,
        HEIGHT: 60,
        SPEED: 5,
        JUMP_FORCE: 15,
        GRAVITY: 0.8,
        MAX_HP: 100,
    },

    BULLET: {
        WIDTH: 10,
        HEIGHT: 4,
        SPEED: 12,
        DAMAGE: 10,
        COOLDOWN: 200, // ms
    },

    GAME_TIME: 60, // seconds
};

// ===========================================
// Game State
// ===========================================
let gameState = {
    screen: 'lobby',
    roomId: null,
    playerId: null,
    isHost: false,

    players: {
        1: { x: 100, y: 400, vx: 0, vy: 0, hp: 100, facing: 1, grounded: false },
        2: { x: 600, y: 400, vx: 0, vy: 0, hp: 100, facing: -1, grounded: false },
    },
    bullets: [],

    timeLeft: CONFIG.GAME_TIME,
    gameRunning: false,
    lastShot: 0,
};

let keys = {};
let ws = null;
let peerConnection = null;
let dataChannel = null;
let canvas, ctx;

// ===========================================
// Screen Management
// ===========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.screen = screenId;
}

// ===========================================
// Signaling Server Connection
// ===========================================
function connectToRoom(roomId) {
    if (CONFIG.USE_MOCK) {
        // Mock mode for testing without server
        console.log('Mock mode: Simulating connection');
        gameState.roomId = roomId;
        gameState.playerId = 1;
        gameState.isHost = true;
        showScreen('waiting');
        document.getElementById('roomCode').textContent = roomId;
        document.getElementById('player1Slot').classList.add('joined');
        document.getElementById('player1Slot').querySelector('span').textContent = 'You';
        document.getElementById('readyBtn').disabled = false;
        document.getElementById('waitingStatus').textContent = 'Mock mode - Click Ready to start solo test';
        return;
    }

    const wsUrl = `${CONFIG.SIGNALING_SERVER}/room/${roomId}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to signaling server');
        gameState.roomId = roomId;
        showScreen('waiting');
        document.getElementById('roomCode').textContent = roomId;
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleSignalingMessage(data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        document.getElementById('lobbyStatus').textContent = 'Connection failed. Try again.';
    };

    ws.onclose = () => {
        console.log('Disconnected from signaling server');
        if (gameState.screen === 'waiting') {
            showScreen('lobby');
            document.getElementById('lobbyStatus').textContent = 'Disconnected from room.';
        }
    };
}

function handleSignalingMessage(data) {
    console.log('Signaling:', data.type, data);

    switch (data.type) {
        case 'joined':
            gameState.playerId = data.playerId;
            gameState.isHost = data.playerId === 1;
            updatePlayerSlots(data.playerCount);
            if (data.playerCount >= 2) {
                document.getElementById('readyBtn').disabled = false;
            }
            break;

        case 'player_joined':
            updatePlayerSlots(data.playerCount);
            if (data.playerCount >= 2) {
                document.getElementById('readyBtn').disabled = false;
                document.getElementById('waitingStatus').textContent = 'Opponent joined! Get Ready!';
            }
            break;

        case 'player_left':
            updatePlayerSlots(data.playerCount);
            document.getElementById('waitingStatus').textContent = 'Opponent left...';
            document.getElementById('readyBtn').disabled = true;
            break;

        case 'player_ready':
            const slot = document.getElementById(`player${data.playerId}Slot`);
            slot.classList.add('ready');
            break;

        case 'game_start':
            startGame();
            break;

        // WebRTC signaling
        case 'offer':
            handleOffer(data);
            break;
        case 'answer':
            handleAnswer(data);
            break;
        case 'ice-candidate':
            handleIceCandidate(data);
            break;

        // Game state sync (fallback)
        case 'game_state':
            if (data.playerId !== gameState.playerId) {
                syncRemotePlayer(data);
            }
            break;
    }
}

function updatePlayerSlots(count) {
    const slot1 = document.getElementById('player1Slot');
    const slot2 = document.getElementById('player2Slot');

    slot1.classList.toggle('joined', count >= 1);
    slot2.classList.toggle('joined', count >= 2);

    slot1.querySelector('span').textContent = gameState.playerId === 1 ? 'You' : (count >= 1 ? 'Player' : '---');
    slot2.querySelector('span').textContent = gameState.playerId === 2 ? 'You' : (count >= 2 ? 'Player' : '---');
}

// ===========================================
// WebRTC P2P Connection
// ===========================================
async function setupPeerConnection() {
    const config = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    };

    peerConnection = new RTCPeerConnection(config);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && ws) {
            ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
            }));
        }
    };

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel();
    };

    // Host creates data channel
    if (gameState.isHost) {
        dataChannel = peerConnection.createDataChannel('game');
        setupDataChannel();

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify({
            type: 'offer',
            sdp: offer.sdp,
        }));
    }
}

function setupDataChannel() {
    dataChannel.onopen = () => {
        console.log('P2P Data channel open!');
    };

    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleP2PMessage(data);
    };

    dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
    };
}

async function handleOffer(data) {
    await peerConnection.setRemoteDescription({
        type: 'offer',
        sdp: data.sdp,
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({
        type: 'answer',
        sdp: answer.sdp,
    }));
}

async function handleAnswer(data) {
    await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: data.sdp,
    });
}

async function handleIceCandidate(data) {
    if (data.candidate) {
        await peerConnection.addIceCandidate(data.candidate);
    }
}

function handleP2PMessage(data) {
    switch (data.type) {
        case 'player_state':
            const otherId = gameState.playerId === 1 ? 2 : 1;
            gameState.players[otherId] = { ...gameState.players[otherId], ...data.state };
            break;

        case 'bullet_fired':
            gameState.bullets.push(data.bullet);
            break;

        case 'hit':
            gameState.players[data.targetId].hp -= CONFIG.BULLET.DAMAGE;
            break;
    }
}

function sendP2P(data) {
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(data));
    } else if (ws && ws.readyState === WebSocket.OPEN) {
        // Fallback to WebSocket
        ws.send(JSON.stringify({ type: 'game_state', ...data }));
    }
}

// ===========================================
// Game Logic
// ===========================================
function startGame() {
    showScreen('game');
    initCanvas();
    resetGameState();
    gameState.gameRunning = true;

    // Start game loop
    requestAnimationFrame(gameLoop);

    // Start timer
    const timerInterval = setInterval(() => {
        if (!gameState.gameRunning) {
            clearInterval(timerInterval);
            return;
        }
        gameState.timeLeft--;
        document.getElementById('timer').textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function resetGameState() {
    gameState.players = {
        1: { x: 100, y: 400, vx: 0, vy: 0, hp: CONFIG.PLAYER.MAX_HP, facing: 1, grounded: false },
        2: { x: 600, y: 400, vx: 0, vy: 0, hp: CONFIG.PLAYER.MAX_HP, facing: -1, grounded: false },
    };
    gameState.bullets = [];
    gameState.timeLeft = CONFIG.GAME_TIME;
    gameState.lastShot = 0;
}

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Responsive sizing
    const container = document.getElementById('game');
    const header = document.getElementById('gameHeader');
    const controls = document.getElementById('mobileControls');

    const availableHeight = window.innerHeight - header.offsetHeight - (controls.offsetHeight || 0);
    const scale = Math.min(
        window.innerWidth / CONFIG.CANVAS_WIDTH,
        availableHeight / CONFIG.CANVAS_HEIGHT,
        1
    );

    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    canvas.style.width = `${CONFIG.CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CONFIG.CANVAS_HEIGHT * scale}px`;
}

let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameState.gameRunning) return;

    const dt = Math.min((timestamp - lastTime) / 16.67, 2); // Cap delta time
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    const myPlayer = gameState.players[gameState.playerId || 1];

    // Input handling
    if (keys['ArrowLeft'] || keys['a']) {
        myPlayer.vx = -CONFIG.PLAYER.SPEED;
        myPlayer.facing = -1;
    } else if (keys['ArrowRight'] || keys['d']) {
        myPlayer.vx = CONFIG.PLAYER.SPEED;
        myPlayer.facing = 1;
    } else {
        myPlayer.vx = 0;
    }

    if ((keys['ArrowUp'] || keys['w']) && myPlayer.grounded) {
        myPlayer.vy = -CONFIG.PLAYER.JUMP_FORCE;
        myPlayer.grounded = false;
    }

    // Shooting (Space or F key)
    if (keys[' '] || keys['f']) {
        const now = Date.now();
        if (now - gameState.lastShot >= CONFIG.BULLET.COOLDOWN) {
            fireBullet(myPlayer);
            gameState.lastShot = now;
        }
    }

    // Physics for all players
    for (const id in gameState.players) {
        const p = gameState.players[id];

        // Gravity
        p.vy += CONFIG.PLAYER.GRAVITY * dt;

        // Position update
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Ground collision
        const groundY = CONFIG.CANVAS_HEIGHT - 100;
        if (p.y + CONFIG.PLAYER.HEIGHT >= groundY) {
            p.y = groundY - CONFIG.PLAYER.HEIGHT;
            p.vy = 0;
            p.grounded = true;
        }

        // Wall collision
        if (p.x < 0) p.x = 0;
        if (p.x + CONFIG.PLAYER.WIDTH > CONFIG.CANVAS_WIDTH) {
            p.x = CONFIG.CANVAS_WIDTH - CONFIG.PLAYER.WIDTH;
        }
    }

    // Update bullets
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx * dt;

        // Remove if off screen
        if (b.x < -50 || b.x > CONFIG.CANVAS_WIDTH + 50) {
            gameState.bullets.splice(i, 1);
            continue;
        }

        // Collision with players
        for (const id in gameState.players) {
            if (parseInt(id) === b.owner) continue;

            const p = gameState.players[id];
            if (rectCollision(b, CONFIG.BULLET, p, CONFIG.PLAYER)) {
                p.hp -= CONFIG.BULLET.DAMAGE;
                gameState.bullets.splice(i, 1);

                // Send hit notification
                sendP2P({ type: 'hit', targetId: id });

                // Check for KO
                if (p.hp <= 0) {
                    endGame();
                }
                break;
            }
        }
    }

    // Update HP display
    document.getElementById('p1HP').textContent = Math.max(0, gameState.players[1].hp);
    document.getElementById('p2HP').textContent = Math.max(0, gameState.players[2].hp);

    // Send my state to opponent
    sendP2P({
        type: 'player_state',
        state: {
            x: myPlayer.x,
            y: myPlayer.y,
            vx: myPlayer.vx,
            vy: myPlayer.vy,
            facing: myPlayer.facing,
            hp: myPlayer.hp,
        }
    });
}

function fireBullet(player) {
    const bullet = {
        x: player.x + (player.facing > 0 ? CONFIG.PLAYER.WIDTH : -CONFIG.BULLET.WIDTH),
        y: player.y + CONFIG.PLAYER.HEIGHT / 2,
        vx: CONFIG.BULLET.SPEED * player.facing,
        owner: gameState.playerId || 1,
    };

    gameState.bullets.push(bullet);
    sendP2P({ type: 'bullet_fired', bullet });
}

function rectCollision(obj1, size1, obj2, size2) {
    return obj1.x < obj2.x + size2.WIDTH &&
           obj1.x + size1.WIDTH > obj2.x &&
           obj1.y < obj2.y + size2.HEIGHT &&
           obj1.y + size1.HEIGHT > obj2.y;
}

function render() {
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 100, CONFIG.CANVAS_WIDTH, 100);

    // Draw platforms (optional)
    ctx.fillStyle = '#3a3a6e';
    ctx.fillRect(300, 350, 200, 20);
    ctx.fillRect(100, 250, 150, 20);
    ctx.fillRect(550, 250, 150, 20);

    // Draw players
    for (const id in gameState.players) {
        const p = gameState.players[id];
        const isMe = parseInt(id) === (gameState.playerId || 1);

        // Body
        ctx.fillStyle = isMe ? '#00ff88' : '#ff6666';
        ctx.fillRect(p.x, p.y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT);

        // Direction indicator
        ctx.fillStyle = '#fff';
        const eyeX = p.x + (p.facing > 0 ? CONFIG.PLAYER.WIDTH - 12 : 4);
        ctx.fillRect(eyeX, p.y + 15, 8, 8);

        // HP bar
        const hpPercent = p.hp / CONFIG.PLAYER.MAX_HP;
        ctx.fillStyle = '#333';
        ctx.fillRect(p.x - 5, p.y - 15, 50, 8);
        ctx.fillStyle = hpPercent > 0.3 ? '#00ff88' : '#ff4444';
        ctx.fillRect(p.x - 5, p.y - 15, 50 * hpPercent, 8);
    }

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    for (const b of gameState.bullets) {
        ctx.fillRect(b.x, b.y, CONFIG.BULLET.WIDTH, CONFIG.BULLET.HEIGHT);
    }

    // Draw version info
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.fillText(`${VERSION} | P${gameState.playerId || '?'} | Room: ${gameState.roomId || '---'}`, 10, CONFIG.CANVAS_HEIGHT - 10);
}

function endGame() {
    gameState.gameRunning = false;

    const myPlayer = gameState.players[gameState.playerId || 1];
    const otherPlayer = gameState.players[gameState.playerId === 1 ? 2 : 1];

    let resultText = '';
    if (myPlayer.hp <= 0) {
        resultText = 'Defeat...';
        document.getElementById('resultText').className = 'defeat';
    } else if (otherPlayer.hp <= 0) {
        resultText = 'Victory!';
        document.getElementById('resultText').className = 'victory';
    } else {
        // Time up - compare HP
        if (myPlayer.hp > otherPlayer.hp) {
            resultText = 'Victory!';
            document.getElementById('resultText').className = 'victory';
        } else if (myPlayer.hp < otherPlayer.hp) {
            resultText = 'Defeat...';
            document.getElementById('resultText').className = 'defeat';
        } else {
            resultText = 'Draw';
            document.getElementById('resultText').className = '';
        }
    }

    document.getElementById('resultText').textContent = resultText;
    document.getElementById('resultStats').textContent =
        `Your HP: ${Math.max(0, myPlayer.hp)} | Opponent HP: ${Math.max(0, otherPlayer.hp)}`;

    showScreen('result');
}

// ===========================================
// Input Handling
// ===========================================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mobile controls
document.querySelectorAll('.ctrl-btn').forEach(btn => {
    const key = btn.dataset.key;

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[key] = true;
    });

    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[key] = false;
    });
});

// ===========================================
// UI Event Handlers
// ===========================================
document.getElementById('createRoom').addEventListener('click', async () => {
    document.getElementById('lobbyStatus').textContent = 'Creating room...';

    if (CONFIG.USE_MOCK) {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        connectToRoom(roomId);
        return;
    }

    try {
        const res = await fetch(`${CONFIG.SIGNALING_SERVER.replace('wss:', 'https:')}/room`, {
            method: 'POST',
        });
        const { roomId } = await res.json();
        connectToRoom(roomId);
    } catch (err) {
        document.getElementById('lobbyStatus').textContent = 'Failed to create room.';
    }
});

document.getElementById('joinRoom').addEventListener('click', () => {
    const roomId = document.getElementById('roomInput').value.toUpperCase().trim();
    if (roomId.length < 4) {
        document.getElementById('lobbyStatus').textContent = 'Enter a valid room code.';
        return;
    }
    document.getElementById('lobbyStatus').textContent = 'Joining room...';
    connectToRoom(roomId);
});

document.getElementById('readyBtn').addEventListener('click', async () => {
    document.getElementById('readyBtn').disabled = true;
    document.getElementById(`player${gameState.playerId || 1}Slot`).classList.add('ready');

    if (CONFIG.USE_MOCK) {
        // Mock mode - start immediately
        startGame();
        return;
    }

    // Setup P2P before marking ready
    await setupPeerConnection();

    ws.send(JSON.stringify({ type: 'ready' }));
});

document.getElementById('leaveRoom').addEventListener('click', () => {
    if (ws) ws.close();
    showScreen('lobby');
});

document.getElementById('rematch').addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ready' }));
        showScreen('waiting');
        document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('ready'));
        document.getElementById('readyBtn').disabled = false;
    } else if (CONFIG.USE_MOCK) {
        startGame();
    }
});

document.getElementById('backToLobby').addEventListener('click', () => {
    if (ws) ws.close();
    if (peerConnection) peerConnection.close();
    showScreen('lobby');
});

// Handle window resize
window.addEventListener('resize', () => {
    if (gameState.screen === 'game' && canvas) {
        initCanvas();
    }
});

// Initialize
console.log(`P2P Shooting Battle ${VERSION} loaded!`);
console.log('Mock mode:', CONFIG.USE_MOCK ? 'ON (for testing)' : 'OFF');

// Show version in lobby
const versionEl = document.getElementById('versionInfo');
if (versionEl) {
    versionEl.textContent = `${VERSION} | ${CONFIG.USE_MOCK ? 'MOCK' : 'P2P'}`;
}
