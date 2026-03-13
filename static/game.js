/**
 * Game Core - WebSocket, Input Handling, and Main Loop
 * SpaceWar: Ultimate Edition
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const tickCountEl = document.getElementById('tickCount');
const playerCountEl = document.getElementById('playerCount');

// Game state shared globally
window.gameState = null;
let frameCount = 0;
let lastFireTime = 0;
const FIRE_COOLDOWN = 167;

// Player input state
const playerInputs = {
    thrust: false,
    rotate_left: false,
    rotate_right: false
};

// WebSocket setup
const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port || 8000}/ws`);

ws.onopen = function() {
    console.log("Connected to ULTIMATE SPACEWAR");
    statusEl.textContent = "🚀 战斗开始！";
    document.getElementById('gameContainer').classList.add('connected');
};

ws.onmessage = function(event) {
    window.gameState = JSON.parse(event.data);
    tickCountEl.textContent = window.gameState.tick;
    playerCountEl.textContent = Object.keys(window.gameState.players).length;
    frameCount++;

    for (const playerId in window.gameState.players) {
        const player = window.gameState.players[playerId];
        if (player.thrust) {
            spawnExhaustParticles(player);
        }
    }

    updateParticles();
};

ws.onclose = function() {
    statusEl.textContent = "💀 已断开连接";
    document.getElementById('gameContainer').classList.remove('connected');
};

ws.onerror = function(error) {
    statusEl.textContent = "⚠ 错误";
    console.error("WebSocket error:", error);
};

function sendInput(inputType, state) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            input: inputType,
            state: state
        }));
    }
}

// Keyboard event handlers
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || e.code === 'ArrowUp') {
        if (!playerInputs.thrust) {
            playerInputs.thrust = true;
            sendInput('thrust', true);
        }
    } else if (key === 'a' || e.code === 'ArrowLeft') {
        if (!playerInputs.rotate_left) {
            playerInputs.rotate_left = true;
            sendInput('rotate_left', true);
        }
    } else if (key === 'd' || e.code === 'ArrowRight') {
        if (!playerInputs.rotate_right) {
            playerInputs.rotate_right = true;
            sendInput('rotate_right', true);
        }
    } else if (key === ' ') {
        const now = Date.now();
        if (now - lastFireTime >= FIRE_COOLDOWN) {
            sendInput('fire', true);
            lastFireTime = now;
        }
    } else if (key === 'e' || key === 'shift') {
        sendInput('ultimate', true);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || e.code === 'ArrowUp') {
        if (playerInputs.thrust) {
            playerInputs.thrust = false;
            sendInput('thrust', false);
        }
    } else if (key === 'a' || e.code === 'ArrowLeft') {
        if (playerInputs.rotate_left) {
            playerInputs.rotate_left = false;
            sendInput('rotate_left', false);
        }
    } else if (key === 'd' || e.code === 'ArrowRight') {
        if (playerInputs.rotate_right) {
            playerInputs.rotate_right = false;
            sendInput('rotate_right', false);
        }
    }
});

// Restart button click handler
canvas.addEventListener('click', (e) => {
    if (!window.gameState || !window.gameState.game_over || !window.restartButtonRect) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const button = window.restartButtonRect;
    if (clickX >= button.x && clickX <= button.x + button.width &&
        clickY >= button.y && clickY <= button.y + button.height) {
        sendInput('restart', true);
    }
});

// Main render loop
function gameLoop() {
    if (window.gameState) {
        render(ctx, window.gameState, frameCount);
    }
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
