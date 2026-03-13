"""
Physics engine for SpaceWar - handles 60Hz update loop and collision detection
"""
import math
import asyncio
from config import (
    ARENA_WIDTH, ARENA_HEIGHT, TICK_TIME, FPS,
    SUN_X, SUN_Y, SUN_RADIUS, SUN_MASS, GRAVITY_CONSTANT, MIN_DISTANCE,
    THRUST_ACCELERATION, ROTATION_SPEED, MAX_VELOCITY, LINEAR_DAMPING,
    MUZZLE_VELOCITY, PROJECTILE_RADIUS,
    ASTEROID_MIN_RADIUS, ASTEROID_MAX_RADIUS,
    COMET_DAMAGE_RADIUS, COMET_DAMAGE_PER_TICK,
    INVULNERABILITY_TIME, STARTING_HEALTH,
    POWERUP_SPAWN_INTERVAL, SKILL_PACK_SPAWN_INTERVAL_MIN, SKILL_PACK_SPAWN_INTERVAL_MAX,
    EM_ZONE_X, EM_ZONE_Y, EM_ZONE_RADIUS, EM_FORCE_MAGNITUDE,
    DEATH_RAY_WIDTH, DEATH_RAY_DAMAGE_PER_FRAME,
    ULTIMATE_EMP_BURST, ULTIMATE_DEATH_RAY, ULTIMATE_GOD_MODE,
    ULTIMATE_CHARGE_RATE, ULTIMATE_THRESHOLD,
    EMP_PROJECTILE_COUNT, EMP_PROJECTILE_SPEED,
    SHIELD_DURATION
)
from entities import (
    GameState, Projectile, PowerUp, SkillPack
)
import random


# Global game state - this is the single source of truth for the game
game_state = GameState()


def find_safe_spawn():
    """Find a safe spawn location avoiding obstacles"""
    max_attempts = 10
    for _ in range(max_attempts):
        angle = random.uniform(0, 2 * math.pi)
        distance = 150
        x = SUN_X + distance * math.cos(angle)
        y = SUN_Y + distance * math.sin(angle)

        x = x % ARENA_WIDTH
        y = y % ARENA_HEIGHT

        too_close = False

        for ast in game_state.static_asteroids:
            dx = ast.x - x
            dy = ast.y - y
            if math.sqrt(dx*dx + dy*dy) < 80:
                too_close = True
                break

        dx = game_state.plasma_comet.x - x
        dy = game_state.plasma_comet.y - y
        if math.sqrt(dx*dx + dy*dy) < 150:
            too_close = True

        dx = game_state.alien_fort.x - x
        dy = game_state.alien_fort.y - y
        if math.sqrt(dx*dx + dy*dy) < 150:
            too_close = True

        if not too_close:
            return x, y

    return 100 if random.random() < 0.5 else ARENA_WIDTH - 100, ARENA_HEIGHT / 2


def apply_lorentz_force(vx, vy, x, y):
    """Apply Lorentz force in EM zone"""
    dx = x - EM_ZONE_X
    dy = y - EM_ZONE_Y
    distance = math.sqrt(dx*dx + dy*dy)

    if distance < EM_ZONE_RADIUS:
        # Perpendicular force (rotate velocity 90 degrees)
        speed = math.sqrt(vx*vx + vy*vy)
        if speed > 0:
            perp_x = -vy / speed
            perp_y = vx / speed

            force_x = perp_x * EM_FORCE_MAGNITUDE * TICK_TIME
            force_y = perp_y * EM_FORCE_MAGNITUDE * TICK_TIME

            vx += force_x
            vy += force_y

    return vx, vy


def apply_death_ray_damage(firing_player, target_player):
    """Check if death ray from firing_player hits target_player using raycasting"""
    if not firing_player.is_firing_laser:
        return

    # Ray origin
    ray_x = firing_player.x
    ray_y = firing_player.y

    # Ray direction
    angle_rad = math.radians(firing_player.rotation)
    ray_dx = math.cos(angle_rad)
    ray_dy = math.sin(angle_rad)

    # Vector from ray origin to target
    to_target_x = target_player.x - ray_x
    to_target_y = target_player.y - ray_y

    # Project target onto ray
    dot_product = to_target_x * ray_dx + to_target_y * ray_dy

    # Check if target is in front of the ray
    if dot_product < 0:
        return

    # Check if distance from ray is within laser width
    closest_x = ray_x + dot_product * ray_dx
    closest_y = ray_y + dot_product * ray_dy

    distance_x = target_player.x - closest_x
    distance_y = target_player.y - closest_y
    perpendicular_distance = math.sqrt(distance_x*distance_x + distance_y*distance_y)

    if perpendicular_distance < DEATH_RAY_WIDTH and target_player.invulnerability_timer <= 0 and not target_player.shield_active:
        target_player.health -= DEATH_RAY_DAMAGE_PER_FRAME


async def physics_loop():
    """Main game physics loop running at 60 FPS"""
    while True:
        await asyncio.sleep(TICK_TIME)

        if game_state.game_over:
            game_state.tick += 1
            from connection_manager import broadcast_game_state
            await broadcast_game_state()
            continue

        # Spawn power-ups periodically
        game_state.powerup_spawn_timer -= 1
        if game_state.powerup_spawn_timer <= 0:
            x = random.uniform(100, ARENA_WIDTH - 100)
            y = random.uniform(100, ARENA_HEIGHT - 100)
            powerup_type = random.choice(['shield', 'ultimate'])
            game_state.powerups.append(PowerUp(x, y, powerup_type))
            game_state.powerup_spawn_timer = random.randint(600, 900)  # 10-15 seconds

        # Spawn skill packs periodically
        game_state.skill_pack_spawn_timer -= 1
        if game_state.skill_pack_spawn_timer <= 0:
            spawn_x, spawn_y = find_safe_spawn()
            ultimate_type = random.choice([ULTIMATE_EMP_BURST, ULTIMATE_DEATH_RAY, ULTIMATE_GOD_MODE])
            game_state.skill_packs.append(SkillPack(spawn_x, spawn_y, ultimate_type))
            game_state.skill_pack_spawn_timer = random.randint(SKILL_PACK_SPAWN_INTERVAL_MIN, SKILL_PACK_SPAWN_INTERVAL_MAX)

        # Update each player
        for player_id, player in game_state.players.items():
            if player.is_dead:
                continue

            # Update timers
            if player.fire_cooldown > 0:
                player.fire_cooldown -= 1
            if player.invulnerability_timer > 0:
                player.invulnerability_timer -= 1
            if player.shield_timer > 0:
                player.shield_timer -= 1
            else:
                player.shield_active = False

            # Update ultimate ability timers
            if player.god_mode_timer > 0:
                player.god_mode_timer -= 1
                if player.god_mode_timer <= 0:
                    # Restore original thrust power
                    player.invulnerability_timer = 0
            if player.is_firing_laser and player.death_ray_timer > 0:
                player.death_ray_timer -= 1
                if player.death_ray_timer <= 0:
                    player.is_firing_laser = False

            # Charge ultimate meter
            if player.ultimate_meter < ULTIMATE_THRESHOLD:
                player.ultimate_meter += ULTIMATE_CHARGE_RATE

            # Calculate gravity from Sun
            dx = game_state.sun["x"] - player.x
            dy = game_state.sun["y"] - player.y
            distance = math.sqrt(dx*dx + dy*dy)

            ax, ay = 0, 0

            # Check collision with sun
            if distance < SUN_RADIUS and not player.shield_active:
                player.health = 0

            if distance > MIN_DISTANCE:
                accel = GRAVITY_CONSTANT / (distance * distance)
                ax = (dx / distance) * accel
                ay = (dy / distance) * accel

            # Apply thrust
            if player.thrust:
                angle_rad = math.radians(player.rotation)
                thrust_x = math.cos(angle_rad) * THRUST_ACCELERATION
                thrust_y = math.sin(angle_rad) * THRUST_ACCELERATION
                ax += thrust_x
                ay += thrust_y

            # Apply extra thrust if in god mode
            if player.god_mode_timer > 0:
                angle_rad = math.radians(player.rotation)
                if player.thrust:
                    extra_thrust_x = math.cos(angle_rad) * THRUST_ACCELERATION * 0.5
                    extra_thrust_y = math.sin(angle_rad) * THRUST_ACCELERATION * 0.5
                    ax += extra_thrust_x
                    ay += extra_thrust_y

            # Update velocity
            player.vx += ax * TICK_TIME
            player.vy += ay * TICK_TIME

            # Apply Lorentz force in EM zone
            player.vx, player.vy = apply_lorentz_force(player.vx, player.vy, player.x, player.y)

            # Limit velocity
            vel_mag = math.sqrt(player.vx**2 + player.vy**2)
            if vel_mag > MAX_VELOCITY:
                player.vx = (player.vx / vel_mag) * MAX_VELOCITY
                player.vy = (player.vy / vel_mag) * MAX_VELOCITY

            # Apply damping
            player.vx *= LINEAR_DAMPING
            player.vy *= LINEAR_DAMPING

            # Update position
            player.x += player.vx * TICK_TIME
            player.y += player.vy * TICK_TIME

            # Arena wrapping
            if player.x < 0:
                player.x += ARENA_WIDTH
            elif player.x > ARENA_WIDTH:
                player.x -= ARENA_WIDTH
            if player.y < 0:
                player.y += ARENA_HEIGHT
            elif player.y > ARENA_HEIGHT:
                player.y -= ARENA_HEIGHT

            # Handle rotation
            if player.rotate_left:
                player.rotation -= ROTATION_SPEED
            if player.rotate_right:
                player.rotation += ROTATION_SPEED
            player.rotation = player.rotation % 360

            # Check asteroid collision
            for asteroid in game_state.static_asteroids:
                dx = asteroid.x - player.x
                dy = asteroid.y - player.y
                distance = math.sqrt(dx*dx + dy*dy)
                if distance < asteroid.radius + 15:
                    if distance > 0:
                        bounce_x = (player.x - asteroid.x) / distance
                        bounce_y = (player.y - asteroid.y) / distance
                        player.vx = bounce_x * 100
                        player.vy = bounce_y * 100
                    if player.invulnerability_timer <= 0 and not player.shield_active:
                        player.health -= 5

            # Check comet damage
            dx = game_state.plasma_comet.x - player.x
            dy = game_state.plasma_comet.y - player.y
            distance = math.sqrt(dx*dx + dy*dy)
            if distance < COMET_DAMAGE_RADIUS and not player.shield_active:
                if player.invulnerability_timer <= 0:
                    player.health -= COMET_DAMAGE_PER_TICK

            # Check fort collision
            dx = game_state.alien_fort.x - player.x
            dy = game_state.alien_fort.y - player.y
            distance = math.sqrt(dx*dx + dy*dy)
            if distance < game_state.alien_fort.radius + 15:
                if distance > 0:
                    bounce_x = (player.x - game_state.alien_fort.x) / distance
                    bounce_y = (player.y - game_state.alien_fort.y) / distance
                    player.vx = bounce_x * 100
                    player.vy = bounce_y * 100

            # Check power-up collision
            for powerup in game_state.powerups[:]:
                dx = player.x - powerup.x
                dy = player.y - powerup.y
                distance = math.sqrt(dx*dx + dy*dy)
                if distance < 20 + powerup.radius:
                    if powerup.powerup_type == 'shield':
                        player.shield_active = True
                        player.shield_timer = SHIELD_DURATION
                    elif powerup.powerup_type == 'ultimate':
                        player.ultimate_meter = ULTIMATE_THRESHOLD
                    game_state.powerups.remove(powerup)

            # Check skill pack collision
            for skill_pack in game_state.skill_packs[:]:
                dx = player.x - skill_pack.x
                dy = player.y - skill_pack.y
                distance = math.sqrt(dx*dx + dy*dy)
                if distance < 20 + skill_pack.radius:
                    player.current_ultimate = skill_pack.ultimate_type
                    player.ultimate_meter = ULTIMATE_THRESHOLD
                    game_state.skill_packs.remove(skill_pack)

            # Handle death and respawn
            if player.health <= 0:
                player.lives -= 1
                if player.lives <= 0:
                    player.is_dead = True
                    # Check if other player is still alive
                    other_player_id = 2 if player_id == 1 else 1
                    game_state.game_over = True
                    game_state.winner = other_player_id
                else:
                    # Respawn with invulnerability
                    player.invulnerability_timer = INVULNERABILITY_TIME
                    spawn_x, spawn_y = find_safe_spawn()
                    player.x = spawn_x
                    player.y = spawn_y
                    player.vx = 0
                    player.vy = 0
                    player.health = player.max_health

        # Apply death ray damage between players
        for player_id, player in game_state.players.items():
            other_player_id = 2 if player_id == 1 else 1
            other_player = game_state.players[other_player_id]
            if not other_player.is_dead:
                apply_death_ray_damage(player, other_player)

        # Update projectiles
        for projectile in game_state.projectiles[:]:
            dx = game_state.sun["x"] - projectile.x
            dy = game_state.sun["y"] - projectile.y
            distance = math.sqrt(dx*dx + dy*dy)

            if distance > SUN_RADIUS:
                accel = GRAVITY_CONSTANT / (distance * distance)
                ax = (dx / distance) * accel
                ay = (dy / distance) * accel
                projectile.vx += ax * TICK_TIME
                projectile.vy += ay * TICK_TIME

            # Apply Lorentz force
            projectile.vx, projectile.vy = apply_lorentz_force(projectile.vx, projectile.vy, projectile.x, projectile.y)

            # Update position
            projectile.x += projectile.vx * TICK_TIME
            projectile.y += projectile.vy * TICK_TIME

            projectile.lifespan -= 1

            # Check collision with sun
            dx = game_state.sun["x"] - projectile.x
            dy = game_state.sun["y"] - projectile.y
            distance = math.sqrt(dx*dx + dy*dy)
            if distance < SUN_RADIUS + PROJECTILE_RADIUS:
                game_state.projectiles.remove(projectile)
                continue

            # Check collision with asteroids
            hit_asteroid = False
            for asteroid in game_state.static_asteroids:
                dx = asteroid.x - projectile.x
                dy = asteroid.y - projectile.y
                distance = math.sqrt(dx*dx + dy*dy)
                if distance < asteroid.radius + PROJECTILE_RADIUS:
                    hit_asteroid = True
                    break

            if hit_asteroid:
                game_state.projectiles.remove(projectile)
                continue

            # Check collision with fort
            dx = game_state.alien_fort.x - projectile.x
            dy = game_state.alien_fort.y - projectile.y
            distance = math.sqrt(dx*dx + dy*dy)
            if distance < game_state.alien_fort.radius + PROJECTILE_RADIUS:
                game_state.alien_fort.health -= 20
                game_state.projectiles.remove(projectile)
                if projectile.owner_id in game_state.scores:
                    game_state.scores[projectile.owner_id] += 5
                continue

            # Check collision with players
            hit = False
            for player_id, player in game_state.players.items():
                if projectile.owner_id != player_id and player.invulnerability_timer <= 0 and not player.shield_active and not player.is_dead:
                    dx = player.x - projectile.x
                    dy = player.y - projectile.y
                    distance = math.sqrt(dx*dx + dy*dy)
                    if distance < 15 + PROJECTILE_RADIUS:
                        player.health -= 10
                        if projectile.owner_id in game_state.scores:
                            game_state.scores[projectile.owner_id] += 10
                        hit = True
                        break

            if hit:
                game_state.projectiles.remove(projectile)
                continue

            # Remove if out of lifespan
            if projectile.lifespan <= 0:
                game_state.projectiles.remove(projectile)

        # Update power-ups
        for powerup in game_state.powerups[:]:
            powerup.lifetime -= 1
            if powerup.lifetime <= 0:
                game_state.powerups.remove(powerup)

        # Update skill packs
        for skill_pack in game_state.skill_packs[:]:
            skill_pack.update()

        # Update comet
        game_state.plasma_comet.update()

        # Update fort
        game_state.alien_fort.update()

        # Fort firing
        if game_state.alien_fort.fire_cooldown <= 0:
            for player_id, player in game_state.players.items():
                if not player.is_dead:
                    dx = player.x - game_state.alien_fort.x
                    dy = player.y - game_state.alien_fort.y
                    distance = math.sqrt(dx*dx + dy*dy)

                    if distance < 300 and distance > 50:
                        if distance > 0:
                            fire_vx = (dx / distance) * 150
                            fire_vy = (dy / distance) * 150
                            projectile = Projectile(
                                game_state.alien_fort.x,
                                game_state.alien_fort.y,
                                fire_vx,
                                fire_vy,
                                99
                            )
                            game_state.projectiles.append(projectile)
                            game_state.alien_fort.fire_cooldown = 120
                            break

        game_state.tick += 1
        from connection_manager import broadcast_game_state
        await broadcast_game_state()
