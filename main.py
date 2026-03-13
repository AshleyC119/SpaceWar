"""
SpaceWar: Ultimate Edition
Modular FastAPI game server
"""
from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import math

from physics_engine import physics_loop, game_state, Projectile
from connection_manager import connected_clients, player_connections, broadcast_game_state, disconnect_client
from config import (
    ULTIMATE_EMP_BURST, ULTIMATE_DEATH_RAY, ULTIMATE_GOD_MODE,
    EMP_PROJECTILE_COUNT, EMP_PROJECTILE_SPEED, FIRE_COOLDOWN, MUZZLE_VELOCITY,
    DEATH_RAY_DURATION
)

# FastAPI app initialization
app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_index():
    """Serve the main game HTML"""
    return FileResponse("static/index.html", media_type="text/html")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for game clients"""
    await websocket.accept()

    player_id = None
    if 1 not in player_connections.values():
        player_id = 1
    elif 2 not in player_connections.values():
        player_id = 2

    if player_id is None:
        await websocket.close(code=1008, reason="Game is full")
        return

    client_id = f"player_{player_id}_{id(websocket)}"
    connected_clients[client_id] = websocket
    player_connections[client_id] = player_id

    print(f"Player {player_id} connected")

    try:
        while True:
            data = await websocket.receive_json()

            if "input" in data and player_id in game_state.players:
                player = game_state.players[player_id]
                input_type = data["input"]
                state = data.get("state", False)

                if input_type == "thrust":
                    player.thrust = state
                elif input_type == "rotate_left":
                    player.rotate_left = state
                elif input_type == "rotate_right":
                    player.rotate_right = state
                elif input_type == "fire":
                    if player.fire_cooldown <= 0:
                        angle_rad = math.radians(player.rotation)
                        muzzle_x = math.cos(angle_rad) * MUZZLE_VELOCITY
                        muzzle_y = math.sin(angle_rad) * MUZZLE_VELOCITY
                        projectile = Projectile(
                            player.x + math.cos(angle_rad) * 15,
                            player.y + math.sin(angle_rad) * 15,
                            player.vx + muzzle_x,
                            player.vy + muzzle_y,
                            player_id
                        )
                        game_state.projectiles.append(projectile)
                        player.fire_cooldown = FIRE_COOLDOWN
                elif input_type == "ultimate":
                    # Execute the current ultimate ability
                    if player.ultimate_meter >= 100:
                        player.ultimate_meter = 0

                        if player.current_ultimate == ULTIMATE_EMP_BURST:
                            # EMP BURST: 16 projectiles in a circle
                            for i in range(EMP_PROJECTILE_COUNT):
                                angle = (2 * math.pi * i) / EMP_PROJECTILE_COUNT
                                vx = math.cos(angle) * EMP_PROJECTILE_SPEED
                                vy = math.sin(angle) * EMP_PROJECTILE_SPEED
                                projectile = Projectile(
                                    player.x,
                                    player.y,
                                    vx + player.vx,
                                    vy + player.vy,
                                    player_id
                                )
                                game_state.projectiles.append(projectile)
                            player.current_ultimate = None

                        elif player.current_ultimate == ULTIMATE_GOD_MODE:
                            # GOD MODE: 10 seconds invulnerability + 1.5x thrust
                            player.god_mode_timer = 600  # 10 seconds at 60 FPS
                            player.invulnerability_timer = 600
                            player.current_ultimate = None

                        elif player.current_ultimate == ULTIMATE_DEATH_RAY:
                            # DEATH RAY: Laser fire for 1.5 seconds
                            player.is_firing_laser = True
                            player.death_ray_timer = DEATH_RAY_DURATION  # 90 frames
                            player.current_ultimate = None
                elif input_type == "restart":
                    # Restart the game
                    from entities import GameState
                    game_state.__dict__ = GameState().__dict__
                    print(f"Game restarted by Player {player_id}")

    except Exception as e:
        print(f"Client error: {e}")
    finally:
        await disconnect_client(client_id)
        print(f"Player {player_id} disconnected")


@app.on_event("startup")
async def startup():
    """Start the physics loop when the server starts"""
    asyncio.create_task(physics_loop())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
