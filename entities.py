"""
Game entity classes for SpaceWar
"""
import math
import random
from config import (
    ARENA_WIDTH, ARENA_HEIGHT, PROJECTILE_LIFESPAN, TICK_TIME,
    NUM_ASTEROIDS, ASTEROID_MIN_RADIUS, ASTEROID_MAX_RADIUS,
    STARTING_HEALTH, STARTING_LIVES,
    POWERUP_LIFETIME, SKILL_PACK_RADIUS, SKILL_PACK_DRIFT_SPEED,
    SKILL_PACK_SPAWN_INTERVAL_MIN, SKILL_PACK_SPAWN_INTERVAL_MAX,
    SUN_X, SUN_Y, SUN_RADIUS, SUN_MASS, COMET_MASS, COMET_DAMAGE_RADIUS,
    GRAVITY_CONSTANT, THRUST_ACCELERATION
)


class Projectile:
    def __init__(self, x, y, vx, vy, owner_id):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.owner_id = owner_id
        self.lifespan = PROJECTILE_LIFESPAN


class Asteroid:
    def __init__(self, x, y, radius, vx=0, vy=0):
        self.x = x
        self.y = y
        self.radius = radius
        self.vx = vx
        self.vy = vy
        self.mass = radius * 2


class PlasmaCometOrbitalBomb:
    def __init__(self):
        self.x = SUN_X + 250
        self.y = SUN_Y
        self.vx = 0
        self.vy = -200
        self.radius = 25
        self.mass = COMET_MASS
        self.damage_radius = COMET_DAMAGE_RADIUS

    def update(self):
        dx = SUN_X - self.x
        dy = SUN_Y - self.y
        distance = math.sqrt(dx*dx + dy*dy)

        if distance > SUN_RADIUS + self.radius:
            accel = GRAVITY_CONSTANT / (distance * distance)
            ax = (dx / distance) * accel
            ay = (dy / distance) * accel

            self.vx += ax * TICK_TIME
            self.vy += ay * TICK_TIME

        self.x += self.vx * TICK_TIME
        self.y += self.vy * TICK_TIME

        if self.x < 0:
            self.x += ARENA_WIDTH
        elif self.x > ARENA_WIDTH:
            self.x -= ARENA_WIDTH
        if self.y < 0:
            self.y += ARENA_HEIGHT
        elif self.y > ARENA_HEIGHT:
            self.y -= ARENA_HEIGHT


class AlienFort:
    def __init__(self):
        angle = math.pi / 3
        self.x = SUN_X + 200 * math.cos(angle)
        self.y = SUN_Y + 200 * math.sin(angle)
        self.radius = 30
        self.health = 50
        self.max_health = 50
        self.rotation = 0
        self.fire_cooldown = 60

    def update(self):
        self.rotation += 0.5
        if self.fire_cooldown > 0:
            self.fire_cooldown -= 1


class PowerUp:
    def __init__(self, x, y, powerup_type):
        self.x = x
        self.y = y
        self.powerup_type = powerup_type  # 'shield' or 'ultimate'
        self.lifetime = POWERUP_LIFETIME
        self.radius = 12


class SkillPack:
    def __init__(self, x, y, ultimate_type):
        self.x = x
        self.y = y
        self.ultimate_type = ultimate_type  # EMP_BURST, DEATH_RAY, or GOD_MODE
        self.radius = SKILL_PACK_RADIUS
        self.rotation = 0
        # Slow drift
        angle = random.uniform(0, 2 * math.pi)
        self.vx = math.cos(angle) * SKILL_PACK_DRIFT_SPEED
        self.vy = math.sin(angle) * SKILL_PACK_DRIFT_SPEED

    def update(self):
        self.x += self.vx * TICK_TIME
        self.y += self.vy * TICK_TIME
        self.rotation += 3  # Rotating animation

        # Arena wrapping
        if self.x < 0:
            self.x += ARENA_WIDTH
        elif self.x > ARENA_WIDTH:
            self.x -= ARENA_WIDTH
        if self.y < 0:
            self.y += ARENA_HEIGHT
        elif self.y > ARENA_HEIGHT:
            self.y -= ARENA_HEIGHT


class Player:
    def __init__(self, player_id):
        self.player_id = player_id
        self.x = 100 if player_id == 1 else ARENA_WIDTH - 100
        self.y = ARENA_HEIGHT / 2
        self.vx = 0
        self.vy = 0
        self.rotation = 0 if player_id == 1 else 180
        self.thrust = False
        self.rotate_left = False
        self.rotate_right = False
        self.mass = 10
        self.health = STARTING_HEALTH
        self.max_health = STARTING_HEALTH
        self.lives = STARTING_LIVES
        self.fire_cooldown = 0
        self.invulnerability_timer = 0
        self.shield_active = False
        self.shield_timer = 0
        self.ultimate_meter = 0
        self.is_dead = False
        self.current_ultimate = None  # EMP_BURST, DEATH_RAY, GOD_MODE, or None
        self.is_firing_laser = False
        self.death_ray_timer = 0
        self.god_mode_timer = 0
        self.original_thrust_power = THRUST_ACCELERATION


class GameState:
    def __init__(self):
        self.players = {
            1: Player(1),
            2: Player(2)
        }
        self.sun = {
            "x": SUN_X,
            "y": SUN_Y,
            "radius": SUN_RADIUS,
            "mass": SUN_MASS
        }
        self.projectiles = []
        self.static_asteroids = self._generate_asteroids()
        self.plasma_comet = PlasmaCometOrbitalBomb()
        self.alien_fort = AlienFort()
        self.powerups = []
        self.skill_packs = []
        self.scores = {1: 0, 2: 0}
        self.tick = 0
        self.game_over = False
        self.winner = None
        self.powerup_spawn_timer = POWERUP_LIFETIME
        self.skill_pack_spawn_timer = random.randint(SKILL_PACK_SPAWN_INTERVAL_MIN, SKILL_PACK_SPAWN_INTERVAL_MAX)

    def _generate_asteroids(self):
        asteroids = []
        cluster_x = SUN_X + 250
        cluster_y = SUN_Y - 150

        for _ in range(NUM_ASTEROIDS):
            offset_x = random.uniform(-80, 80)
            offset_y = random.uniform(-80, 80)
            radius = random.uniform(ASTEROID_MIN_RADIUS, ASTEROID_MAX_RADIUS)
            asteroids.append(Asteroid(
                cluster_x + offset_x,
                cluster_y + offset_y,
                radius
            ))
        return asteroids
