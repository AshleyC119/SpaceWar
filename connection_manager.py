"""
WebSocket connection management and game state broadcasting
"""
from physics_engine import game_state
from config import EM_ZONE_X, EM_ZONE_Y, EM_ZONE_RADIUS

# Connection tracking
connected_clients = {}
player_connections = {}


async def broadcast_game_state():
    """Send current game state to all connected clients"""
    state = {
        "tick": game_state.tick,
        "sun": game_state.sun,
        "scores": game_state.scores,
        "game_over": game_state.game_over,
        "winner": game_state.winner,
        "players": {
            str(pid): {
                "x": p.x,
                "y": p.y,
                "vx": p.vx,
                "vy": p.vy,
                "rotation": p.rotation,
                "thrust": p.thrust,
                "health": p.health,
                "max_health": p.max_health,
                "lives": p.lives,
                "invulnerability": p.invulnerability_timer > 0,
                "shield_active": p.shield_active,
                "ultimate_meter": p.ultimate_meter,
                "is_dead": p.is_dead,
                "current_ultimate": p.current_ultimate,
                "is_firing_laser": p.is_firing_laser
            }
            for pid, p in game_state.players.items()
        },
        "projectiles": [
            {
                "x": proj.x,
                "y": proj.y,
                "owner_id": proj.owner_id
            }
            for proj in game_state.projectiles
        ],
        "asteroids": [
            {
                "x": ast.x,
                "y": ast.y,
                "radius": ast.radius
            }
            for ast in game_state.static_asteroids
        ],
        "comet": {
            "x": game_state.plasma_comet.x,
            "y": game_state.plasma_comet.y,
            "radius": game_state.plasma_comet.radius,
            "damage_radius": game_state.plasma_comet.damage_radius
        },
        "fort": {
            "x": game_state.alien_fort.x,
            "y": game_state.alien_fort.y,
            "radius": game_state.alien_fort.radius,
            "health": game_state.alien_fort.health,
            "max_health": game_state.alien_fort.max_health,
            "rotation": game_state.alien_fort.rotation
        },
        "powerups": [
            {
                "x": pu.x,
                "y": pu.y,
                "type": pu.powerup_type
            }
            for pu in game_state.powerups
        ],
        "skill_packs": [
            {
                "x": sp.x,
                "y": sp.y,
                "ultimate_type": sp.ultimate_type,
                "rotation": sp.rotation
            }
            for sp in game_state.skill_packs
        ],
        "em_zone": {
            "x": EM_ZONE_X,
            "y": EM_ZONE_Y,
            "radius": EM_ZONE_RADIUS
        }
    }

    disconnected = []
    for client_id, websocket in list(connected_clients.items()):
        try:
            await websocket.send_json(state)
        except Exception:
            disconnected.append(client_id)

    for client_id in disconnected:
        await disconnect_client(client_id)


async def disconnect_client(client_id):
    """Handle client disconnection"""
    if client_id in connected_clients:
        del connected_clients[client_id]

    if client_id in player_connections:
        player_id = player_connections[client_id]
        del player_connections[client_id]
        if player_id in game_state.players:
            game_state.players[player_id].thrust = False
            game_state.players[player_id].rotate_left = False
            game_state.players[player_id].rotate_right = False
