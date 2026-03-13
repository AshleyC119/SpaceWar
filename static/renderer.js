/**
 * Renderer - Canvas drawing logic for SpaceWar: Ultimate Edition
 */

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

function drawStars(ctx, frameCount) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.3;
    const stars = [
        { x: 100, y: 50 }, { x: 250, y: 100 }, { x: 400, y: 150 },
        { x: 600, y: 80 }, { x: 700, y: 200 }, { x: 150, y: 400 },
        { x: 550, y: 450 }, { x: 750, y: 550 }
    ];
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawSun(ctx, gameState, frameCount) {
    const sun = gameState.sun;
    const pulseIntensity = 0.8 + 0.4 * Math.sin(frameCount * 0.05);

    ctx.fillStyle = `rgba(255, 80, 0, ${0.1 * pulseIntensity})`;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius + 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 120, 0, ${0.15 * pulseIntensity})`;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius + 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 150, 0, ${0.25 * pulseIntensity})`;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius + 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff8800';
    ctx.shadowColor = `rgba(255, 150, 0, ${0.8 * pulseIntensity})`;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = 'rgba(255, 255, 100, 0.9)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(sun.x - 5, sun.y - 5, sun.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
}

function drawElectromagneticZone(ctx, gameState, frameCount) {
    if (!gameState.em_zone) return;

    const zone = gameState.em_zone;
    const zonePulse = 0.3 + 0.2 * Math.sin(frameCount * 0.08);

    ctx.fillStyle = `rgba(150, 0, 255, ${0.1 * zonePulse})`;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(150, 0, 255, ${0.15 * zonePulse})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = zone.x + Math.cos(angle) * zone.radius;
        const y1 = zone.y + Math.sin(angle) * zone.radius;
        const x2 = zone.x - Math.cos(angle) * zone.radius;
        const y2 = zone.y - Math.sin(angle) * zone.radius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.strokeStyle = `rgba(150, 0, 255, 0.4)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#aa00ff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 电磁区 ⚡', zone.x, zone.y);
}

function drawAsteroids(ctx, gameState) {
    if (!gameState.asteroids) return;

    for (const asteroid of gameState.asteroids) {
        ctx.fillStyle = '#666666';
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(100, 100, 100, 0.5)';
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(asteroid.x - asteroid.radius * 0.3, asteroid.y - asteroid.radius * 0.3, asteroid.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function drawComet(ctx, gameState, frameCount) {
    if (!gameState.comet) return;

    const comet = gameState.comet;
    const auraPulse = 0.5 + 0.5 * Math.sin(frameCount * 0.1);

    ctx.fillStyle = `rgba(255, 0, 0, ${0.15 * auraPulse})`;
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.damage_radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cc0000';
    ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = 'rgba(255, 50, 50, 0.9)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText('☢ 彗星 ☢', comet.x, comet.y + comet.radius + 20);
}

function drawAlienFort(ctx, gameState) {
    if (!gameState.fort) return;

    const fort = gameState.fort;

    ctx.save();
    ctx.translate(fort.x, fort.y);
    ctx.rotate(Math.PI / 180 * fort.rotation);

    ctx.fillStyle = '#0088ff';
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 136, 255, 0.6)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3);
        const x = Math.cos(angle) * fort.radius;
        const y = Math.sin(angle) * fort.radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, 0, fort.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const healthPercent = Math.max(0, fort.health / fort.max_health);
    ctx.fillStyle = '#333';
    ctx.fillRect(fort.x - 40, fort.y + 40, 80, 6);
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(fort.x - 40, fort.y + 40, 80 * healthPercent, 6);
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(fort.x - 40, fort.y + 40, 80, 6);

    ctx.fillStyle = '#00ccff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText('⚔ 堡垒 ⚔', fort.x, fort.y + 60);
}

function drawPowerUps(ctx, gameState, frameCount) {
    if (!gameState.powerups) return;

    for (const powerup of gameState.powerups) {
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.15);

        if (powerup.type === 'shield') {
            ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * pulse})`;
            ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        } else {
            ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * pulse})`;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        }

        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, powerup.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = powerup.type === 'shield' ? '#00ffff' : '#ffd700';
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.type === 'shield' ? '◯' : '⚡', powerup.x, powerup.y);
    }
}

function drawSkillPacks(ctx, gameState, frameCount) {
    if (!gameState.skill_packs) return;

    for (const pack of gameState.skill_packs) {
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.12);

        ctx.fillStyle = `rgba(255, 50, 200, ${0.2 * pulse})`;
        ctx.shadowColor = 'rgba(255, 50, 200, 0.8)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(pack.x, pack.y, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(pack.x, pack.y);
        ctx.rotate(Math.PI / 180 * pack.rotation);

        ctx.fillStyle = '#ff3366';
        ctx.fillRect(-12, -12, 24, 24);

        ctx.strokeStyle = '#ff99dd';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 50, 200, 0.9)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(-12, -12, 24, 24);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText('?', 0, 0);

        ctx.restore();
    }
}

function drawDeathRay(ctx, player) {
    const angle = Math.PI / 180 * player.rotation;
    const rayEndX = player.x + Math.cos(angle) * 2000;
    const rayEndY = player.y + Math.sin(angle) * 2000;

    ctx.save();

    // Outer glow
    ctx.strokeStyle = 'rgba(255, 20, 0, 0.4)';
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255, 20, 0, 0.8)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(rayEndX, rayEndY);
    ctx.stroke();

    // Main beam - Crimson Red
    ctx.strokeStyle = 'rgba(220, 20, 60, 0.8)';
    ctx.lineWidth = 20;
    ctx.shadowColor = 'rgba(255, 50, 50, 1)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(rayEndX, rayEndY);
    ctx.stroke();

    // Inner bright beam - Neon Pink
    ctx.strokeStyle = 'rgba(255, 100, 200, 0.9)';
    ctx.lineWidth = 10;
    ctx.shadowColor = 'rgba(255, 150, 200, 1)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(rayEndX, rayEndY);
    ctx.stroke();

    // Core bright center
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 255, 0, 1)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(rayEndX, rayEndY);
    ctx.stroke();

    ctx.restore();
}

function drawProjectiles(ctx, gameState) {
    if (!gameState.projectiles) return;

    for (const projectile of gameState.projectiles) {
        let color, radius;
        if (projectile.owner_id === 99) {
            color = '#00ff00';
            radius = 5;
        } else if (projectile.owner_id === 1) {
            color = '#ffff00';
            radius = 4;
        } else {
            color = '#00ffff';
            radius = 4;
        }

        ctx.fillStyle = `rgba(${projectile.owner_id === 99 ? '0, 255, 0' : projectile.owner_id === 1 ? '255, 255, 0' : '0, 255, 255'}, 0.3)`;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawPlayer(ctx, player, playerId, frameCount) {
    const colors = {
        "1": { ship: '#2E8B57', name: 'P1' },
        "2": { ship: '#1A1A1A', name: 'P2' }
    };
    const color = colors[playerId].ship;
    const isThrusting = player.thrust;
    const isInvulnerable = player.invulnerability;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(Math.PI / 180 * player.rotation);

    // Draw shield bubble
    if (player.shield_active) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Invulnerability flicker
    if (isInvulnerable && frameCount % 10 < 5) {
        ctx.fillStyle = `rgba(${playerId === "1" ? '46, 139, 87' : '200, 200, 200'}, 0.2)`;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Draw ship
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();

    // P2 white stroke for visibility
    if (playerId === "2") {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Cockpit
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(5, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    if (isThrusting) {
        drawThrustEffect(ctx);
    }

    // Velocity vector
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
    if (speed > 10) {
        const angleToVelocity = Math.atan2(player.vy, player.vx) * 180 / Math.PI;
        const velDisplay = Math.min(speed / 10, 30);
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(
            -5 + Math.cos((angleToVelocity) * Math.PI / 180) * velDisplay,
            Math.sin((angleToVelocity) * Math.PI / 180) * velDisplay
        );
        ctx.stroke();
    }

    ctx.restore();

    // Label with color
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(colors[playerId].name, player.x, player.y - 25);
}

function drawThrustEffect(ctx) {
    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(-20 - Math.random() * 15, -8);
    ctx.lineTo(-15 - Math.random() * 10, 0);
    ctx.lineTo(-20 - Math.random() * 15, 8);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(-12 - Math.random() * 8, -4);
    ctx.lineTo(-10 - Math.random() * 5, 0);
    ctx.lineTo(-12 - Math.random() * 8, 4);
    ctx.lineTo(-5, 3);
    ctx.closePath();
    ctx.fill();
}

function drawHealthBars(ctx, gameState, frameCount) {
    if (!gameState.players) return;

    const barHeight = 8;
    const barWidth = 80;
    let yPos = 15;

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        const colors = {
            "1": '#2E8B57',
            "2": '#1A1A1A'
        };
        const color = colors[playerId];
        const healthPercent = Math.max(0, player.health / player.max_health);

        if (player.invulnerability && frameCount % 15 > 7) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = '#333';
        ctx.fillRect(15, yPos, barWidth, barHeight);

        ctx.fillStyle = color;
        ctx.fillRect(15, yPos, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(15, yPos, barWidth, barHeight);

        ctx.globalAlpha = 1;

        ctx.fillStyle = color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P${playerId} 血量: ${Math.ceil(player.health)}`, 100, yPos + 10);

        // Display current ultimate type
        let ultimateText = player.current_ultimate || 'NONE';
        let ultimateColor = '#0099ff';
        if (player.current_ultimate === 'EMP_BURST') {
            ultimateText = 'READY: EMP';
            ultimateColor = '#00ffff';
        } else if (player.current_ultimate === 'DEATH_RAY') {
            ultimateText = 'READY: 死亡射线';
            ultimateColor = '#ff0000';
        } else if (player.current_ultimate === 'GOD_MODE') {
            ultimateText = 'READY: 神圣模式';
            ultimateColor = '#ffff00';
        }

        ctx.fillStyle = ultimateColor;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(ultimateText, 240, yPos + 10);

        yPos += 25;
    }
}

function drawUltimateMeters(ctx, gameState, frameCount) {
    if (!gameState.players) return;

    let yPos = 50;

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        const ultPercent = Math.max(0, player.ultimate_meter / 100);
        const isFull = player.ultimate_meter >= 100;

        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(15, yPos + 12, 80, 6);

        ctx.fillStyle = isFull ? '#ffff00' : '#0099ff';
        if (isFull && frameCount % 20 > 10) {
            ctx.fillStyle = '#ffaa00';
        }
        ctx.fillRect(15, yPos + 12, 80 * ultPercent, 6);

        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(15, yPos + 12, 80, 6);

        ctx.fillStyle = '#0099ff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('终极', 100, yPos + 15);

        yPos += 25;
    }
}

function drawLives(ctx, gameState) {
    if (!gameState.players) return;

    let yPos = 80;

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        const color = playerId === "1" ? '#2E8B57' : '#1A1A1A';

        for (let i = 0; i < player.lives; i++) {
            ctx.fillStyle = color;
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🛸', 15 + (i * 15), yPos);
        }

        yPos += 25;
    }
}

function drawScoreboard(ctx, gameState) {
    if (!gameState.scores) return;

    const margin = 15;
    const rightX = CANVAS_WIDTH - 120;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(rightX - 10, margin - 5, 110, 80);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('分数', rightX, margin + 15);

    ctx.fillStyle = '#2E8B57';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`P1: ${gameState.scores[1] || 0}`, rightX, margin + 35);

    ctx.fillStyle = '#ff9999';
    ctx.fillText(`P2: ${gameState.scores[2] || 0}`, rightX, margin + 50);

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('生命 & 技能', rightX, margin + 65);
}

function drawGameOverScreen(ctx, gameState) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const winner = gameState.winner;
    const winnerName = winner === 1 ? '玩家 1 🟢' : '玩家 2 ⚫';
    const color = winner === 1 ? '#2E8B57' : '#ffffff';

    ctx.fillStyle = color;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillText(winnerName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px Arial';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.fillText('获胜！', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 30px Arial';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    ctx.fillText('🎉 大笑到最后！🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

    const buttonX = CANVAS_WIDTH / 2;
    const buttonY = CANVAS_HEIGHT / 2 + 150;
    const buttonWidth = 200;
    const buttonHeight = 40;

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(buttonX - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText('重新开始 (RESTART)', buttonX, buttonY + buttonHeight / 2);

    window.restartButtonRect = {
        x: buttonX - buttonWidth / 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };

    ctx.shadowBlur = 0;
}

function drawUI(ctx) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 2, 0, Math.PI * 2);
    ctx.fill();
}

function render(ctx, gameState, frameCount) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply screen shake if death ray is active
    let screenShakeIntensity = 0;
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        if (player.is_firing_laser) {
            screenShakeIntensity = 2;
            break;
        }
    }

    if (screenShakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeIntensity;
        const shakeY = (Math.random() - 0.5) * screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
    }

    drawStars(ctx, frameCount);

    if (!gameState) return;

    drawParticles(ctx, frameCount);
    drawSun(ctx, gameState, frameCount);
    drawElectromagneticZone(ctx, gameState, frameCount);
    drawAsteroids(ctx, gameState);
    drawComet(ctx, gameState, frameCount);
    drawAlienFort(ctx, gameState);
    drawPowerUps(ctx, gameState, frameCount);
    drawSkillPacks(ctx, gameState, frameCount);
    drawProjectiles(ctx, gameState);

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        if (!player.is_dead) {
            drawPlayer(ctx, player, playerId, frameCount);
        }
    }

    // Draw death rays
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        if (player.is_firing_laser && !player.is_dead) {
            drawDeathRay(ctx, player);
        }
    }

    drawHealthBars(ctx, gameState, frameCount);
    drawUltimateMeters(ctx, gameState, frameCount);
    drawLives(ctx, gameState);
    drawScoreboard(ctx, gameState);

    if (gameState.game_over) {
        drawGameOverScreen(ctx, gameState);
    }

    drawUI(ctx);
}
