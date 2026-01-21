// P2P Fighting Game - Main Game Logic

// ===========================================
// Configuration
// ===========================================
const VERSION = 'v2.0.0';

const CONFIG = {
    // Cloudflare Workers Signaling Server
    SIGNALING_SERVER: 'wss://p2p-signaling.ailovedirector.workers.dev',
    // Set to false for real P2P, true for solo testing
    USE_MOCK: false,

    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    PLAYER: {
        WIDTH: 120,
        HEIGHT: 180,
        SPEED: 6,
        JUMP_FORCE: 18,
        GRAVITY: 0.9,
        MAX_HP: 100,
    },

    ATTACK: {
        PUNCH_DAMAGE: 8,
        KICK_DAMAGE: 12,
        PUNCH_RANGE: 80,
        KICK_RANGE: 100,
        PUNCH_DURATION: 200,  // ms
        KICK_DURATION: 300,
        HURT_DURATION: 300,
        BLOCK_REDUCTION: 0.2, // 80% damage reduction when blocking
    },

    GAME_TIME: 99, // seconds
};

// ===========================================
// Sprite Manager
// ===========================================
const SpriteManager = {
    sprites: {},
    loaded: false,

    async loadAll() {
        const poses = ['idle', 'punch', 'kick', 'block', 'hurt', 'win'];
        const basePath = 'assets/characters/';

        const loadPromises = poses.map(pose => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[`char1_${pose}`] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load: ${pose}`);
                    resolve(); // Continue even if one fails
                };
                img.src = `${basePath}char1_${pose}.png`;
            });
        });

        await Promise.all(loadPromises);
        this.loaded = true;
        console.log('Sprites loaded:', Object.keys(this.sprites));
    },

    get(name) {
        return this.sprites[name] || null;
    }
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
        1: {
            x: 150, y: 300, vx: 0, vy: 0, hp: 100,
            facing: 1, grounded: false,
            action: 'idle', actionTime: 0
        },
        2: {
            x: 550, y: 300, vx: 0, vy: 0, hp: 100,
            facing: -1, grounded: false,
            action: 'idle', actionTime: 0
        },
    },

    timeLeft: CONFIG.GAME_TIME,
    gameRunning: false,
    lastAttack: 0,
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

        case 'offer':
            handleOffer(data);
            break;
        case 'answer':
            handleAnswer(data);
            break;
        case 'ice-candidate':
            handleIceCandidate(data);
            break;

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

        case 'attack':
            handleRemoteAttack(data);
            break;
    }
}

function sendP2P(data) {
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(data));
    } else if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'game_state', ...data }));
    }
}

function syncRemotePlayer(data) {
    const otherId = gameState.playerId === 1 ? 2 : 1;

    if (data.type === 'player_state' || data.state) {
        const state = data.state || data;
        gameState.players[otherId] = { ...gameState.players[otherId], ...state };
    } else if (data.type === 'attack') {
        handleRemoteAttack(data);
    }
}

// ===========================================
// Game Logic
// ===========================================
async function startGame() {
    // Load sprites first
    if (!SpriteManager.loaded) {
        await SpriteManager.loadAll();
    }

    showScreen('game');
    initCanvas();
    resetGameState();
    gameState.gameRunning = true;

    requestAnimationFrame(gameLoop);

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
        1: {
            x: 150, y: 300, vx: 0, vy: 0, hp: CONFIG.PLAYER.MAX_HP,
            facing: 1, grounded: false,
            action: 'idle', actionTime: 0
        },
        2: {
            x: 550, y: 300, vx: 0, vy: 0, hp: CONFIG.PLAYER.MAX_HP,
            facing: -1, grounded: false,
            action: 'idle', actionTime: 0
        },
    };
    gameState.timeLeft = CONFIG.GAME_TIME;
    gameState.lastAttack = 0;
}

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

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

    const dt = Math.min((timestamp - lastTime) / 16.67, 2);
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    const myId = gameState.playerId || 1;
    const myPlayer = gameState.players[myId];
    const now = Date.now();

    // Check if action is still ongoing
    const actionElapsed = now - myPlayer.actionTime;
    const isActing = myPlayer.action !== 'idle' && myPlayer.action !== 'block';
    const actionDuration = myPlayer.action === 'punch' ? CONFIG.ATTACK.PUNCH_DURATION :
                          myPlayer.action === 'kick' ? CONFIG.ATTACK.KICK_DURATION :
                          myPlayer.action === 'hurt' ? CONFIG.ATTACK.HURT_DURATION : 0;

    if (isActing && actionElapsed > actionDuration) {
        myPlayer.action = 'idle';
    }

    // Input handling (only if not in hurt state)
    if (myPlayer.action !== 'hurt') {
        // Movement
        if (keys['ArrowLeft'] || keys['a']) {
            myPlayer.vx = -CONFIG.PLAYER.SPEED;
            myPlayer.facing = -1;
        } else if (keys['ArrowRight'] || keys['d']) {
            myPlayer.vx = CONFIG.PLAYER.SPEED;
            myPlayer.facing = 1;
        } else {
            myPlayer.vx = 0;
        }

        // Jump
        if ((keys['ArrowUp'] || keys['w']) && myPlayer.grounded) {
            myPlayer.vy = -CONFIG.PLAYER.JUMP_FORCE;
            myPlayer.grounded = false;
        }

        // Block (hold down or S)
        if (keys['ArrowDown'] || keys['s']) {
            myPlayer.action = 'block';
        } else if (myPlayer.action === 'block') {
            myPlayer.action = 'idle';
        }

        // Punch (Z or J)
        if ((keys['z'] || keys['j']) && myPlayer.action === 'idle') {
            performAttack(myPlayer, 'punch');
        }

        // Kick (X or K)
        if ((keys['x'] || keys['k']) && myPlayer.action === 'idle') {
            performAttack(myPlayer, 'kick');
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
        const groundY = CONFIG.CANVAS_HEIGHT - 80;
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
            action: myPlayer.action,
            actionTime: myPlayer.actionTime,
        }
    });
}

function performAttack(player, attackType) {
    const myId = gameState.playerId || 1;
    const otherId = myId === 1 ? 2 : 1;
    const opponent = gameState.players[otherId];

    player.action = attackType;
    player.actionTime = Date.now();

    // Calculate attack range
    const range = attackType === 'punch' ? CONFIG.ATTACK.PUNCH_RANGE : CONFIG.ATTACK.KICK_RANGE;
    const damage = attackType === 'punch' ? CONFIG.ATTACK.PUNCH_DAMAGE : CONFIG.ATTACK.KICK_DAMAGE;

    // Check if opponent is in range
    const playerCenterX = player.x + CONFIG.PLAYER.WIDTH / 2;
    const opponentCenterX = opponent.x + CONFIG.PLAYER.WIDTH / 2;
    const distance = Math.abs(playerCenterX - opponentCenterX);
    const inFront = (player.facing > 0 && opponentCenterX > playerCenterX) ||
                   (player.facing < 0 && opponentCenterX < playerCenterX);

    if (distance < range && inFront) {
        // Hit!
        let actualDamage = damage;
        if (opponent.action === 'block') {
            actualDamage = Math.floor(damage * CONFIG.ATTACK.BLOCK_REDUCTION);
        } else {
            opponent.action = 'hurt';
            opponent.actionTime = Date.now();
        }
        opponent.hp -= actualDamage;

        // Send attack notification
        sendP2P({
            type: 'attack',
            attackType,
            damage: actualDamage,
            targetId: otherId,
        });

        // Check KO
        if (opponent.hp <= 0) {
            setTimeout(() => endGame(), 500);
        }
    }
}

function handleRemoteAttack(data) {
    const myId = gameState.playerId || 1;
    if (data.targetId === myId) {
        const myPlayer = gameState.players[myId];
        myPlayer.hp -= data.damage;
        if (myPlayer.action !== 'block') {
            myPlayer.action = 'hurt';
            myPlayer.actionTime = Date.now();
        }
        if (myPlayer.hp <= 0) {
            setTimeout(() => endGame(), 500);
        }
    }
}

function render() {
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 80, CONFIG.CANVAS_WIDTH, 80);

    // Ground line
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.CANVAS_HEIGHT - 80);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - 80);
    ctx.stroke();

    // Draw players
    for (const id in gameState.players) {
        const p = gameState.players[id];
        const isMe = parseInt(id) === (gameState.playerId || 1);

        // Determine which sprite to use
        let spriteName = `char1_${p.action}`;
        const sprite = SpriteManager.get(spriteName) || SpriteManager.get('char1_idle');

        if (sprite) {
            ctx.save();

            // Flip sprite based on facing direction
            const drawX = p.x + CONFIG.PLAYER.WIDTH / 2;
            const drawY = p.y;

            ctx.translate(drawX, drawY);
            ctx.scale(p.facing, 1);

            // Draw sprite centered
            const scale = CONFIG.PLAYER.HEIGHT / sprite.height;
            const drawWidth = sprite.width * scale;
            const drawHeight = CONFIG.PLAYER.HEIGHT;

            ctx.drawImage(sprite, -drawWidth / 2, 0, drawWidth, drawHeight);

            ctx.restore();
        } else {
            // Fallback: colored rectangle
            ctx.fillStyle = isMe ? '#00ff88' : '#ff6666';
            ctx.fillRect(p.x, p.y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT);
        }

        // Player indicator (P1/P2)
        ctx.fillStyle = isMe ? '#00ff88' : '#ff6666';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isMe ? 'YOU' : 'P' + id, p.x + CONFIG.PLAYER.WIDTH / 2, p.y - 25);

        // HP bar above player
        const hpPercent = Math.max(0, p.hp / CONFIG.PLAYER.MAX_HP);
        const barWidth = 80;
        const barX = p.x + CONFIG.PLAYER.WIDTH / 2 - barWidth / 2;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, p.y - 15, barWidth, 10);

        ctx.fillStyle = hpPercent > 0.3 ? '#00ff88' : '#ff4444';
        ctx.fillRect(barX, p.y - 15, barWidth * hpPercent, 10);

        // Action indicator (for debugging)
        if (p.action !== 'idle') {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(p.action.toUpperCase(), p.x + CONFIG.PLAYER.WIDTH / 2, p.y - 40);
        }
    }

    // Draw version info and connection status
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    const wsStatus = ws && ws.readyState === WebSocket.OPEN ? 'WS:OK' : 'WS:--';
    const p2pStatus = dataChannel && dataChannel.readyState === 'open' ? 'P2P:OK' : 'P2P:--';
    ctx.fillText(`${VERSION} | P${gameState.playerId || '?'} | ${wsStatus} ${p2pStatus}`, 10, CONFIG.CANVAS_HEIGHT - 10);

    // Draw controls hint
    ctx.fillStyle = '#444';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Z/J:Punch  X/K:Kick  ↓/S:Block', CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 10);
}

function endGame() {
    gameState.gameRunning = false;

    const myPlayer = gameState.players[gameState.playerId || 1];
    const otherPlayer = gameState.players[gameState.playerId === 1 ? 2 : 1];

    // Set winner to win pose
    if (myPlayer.hp > otherPlayer.hp) {
        myPlayer.action = 'win';
    } else if (otherPlayer.hp > myPlayer.hp) {
        otherPlayer.action = 'win';
    }

    let resultText = '';
    if (myPlayer.hp <= 0) {
        resultText = 'K.O. - Defeat...';
        document.getElementById('resultText').className = 'defeat';
    } else if (otherPlayer.hp <= 0) {
        resultText = 'K.O. - Victory!';
        document.getElementById('resultText').className = 'victory';
    } else {
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
    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
});

// Mobile controls
document.querySelectorAll('.ctrl-btn').forEach(btn => {
    const key = btn.dataset.key;

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[key] = true;
        keys[key.toLowerCase()] = true;
    });

    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[key] = false;
        keys[key.toLowerCase()] = false;
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
        startGame();
        return;
    }

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

window.addEventListener('resize', () => {
    if (gameState.screen === 'game' && canvas) {
        initCanvas();
    }
});

// Initialize
console.log(`P2P Fighting Game ${VERSION} loaded!`);
console.log('Mock mode:', CONFIG.USE_MOCK ? 'ON (for testing)' : 'OFF');

// Preload sprites
SpriteManager.loadAll();

const versionEl = document.getElementById('versionInfo');
if (versionEl) {
    versionEl.textContent = `${VERSION} | ${CONFIG.USE_MOCK ? 'MOCK' : 'P2P'}`;
}
