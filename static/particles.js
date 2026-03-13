/**
 * Particle System - SpaceWar: Ultimate Edition
 */

class Particle {
    constructor(x, y, vx, vy, type = 'exhaust') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 2 + 1;
        this.alpha = 1.0;
        this.type = type;

        if (type === 'exhaust') {
            this.lifespan = Math.random() * 40 + 30;
        } else if (type === 'explosion') {
            this.lifespan = Math.random() * 30 + 40;
            this.size = Math.random() * 3 + 2;
        }
        this.maxLifespan = this.lifespan;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifespan--;
        this.alpha = Math.max(0, this.lifespan / this.maxLifespan);
    }

    isAlive() {
        return this.lifespan > 0 && this.alpha > 0;
    }
}

// Global particle array
let particles = [];

function spawnExhaustParticles(player) {
    const particlesPerFrame = 3;
    const angle = Math.PI / 180 * player.rotation;

    for (let i = 0; i < particlesPerFrame; i++) {
        const spawnDist = 12;
        const spawnX = player.x - Math.cos(angle) * spawnDist;
        const spawnY = player.y - Math.sin(angle) * spawnDist;

        const baseVx = -Math.cos(angle) * (Math.random() * 80 + 60);
        const baseVy = -Math.sin(angle) * (Math.random() * 80 + 60);

        const spreadAngle = (Math.random() - 0.5) * Math.PI / 3;
        const spreadDist = Math.random() * 40 + 20;

        const vx = baseVx + Math.cos(angle + spreadAngle) * spreadDist;
        const vy = baseVy + Math.sin(angle + spreadAngle) * spreadDist;

        particles.push(new Particle(spawnX, spawnY, vx, vy, 'exhaust'));
    }
}

function spawnExplosionParticles(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 150 + 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, vx, vy, 'explosion'));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (!particles[i].isAlive()) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles(ctx, frameCount) {
    for (const particle of particles) {
        ctx.save();
        ctx.globalAlpha = particle.alpha;

        if (particle.type === 'exhaust') {
            ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
            ctx.shadowColor = 'rgba(255, 150, 0, 1)';
        } else if (particle.type === 'explosion') {
            ctx.fillStyle = 'rgba(255, 100, 50, 0.8)';
            ctx.shadowColor = 'rgba(255, 100, 50, 1)';
        }

        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = particle.type === 'exhaust' ? 'rgba(255, 200, 100, 0.8)' : 'rgba(255, 150, 100, 0.9)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
