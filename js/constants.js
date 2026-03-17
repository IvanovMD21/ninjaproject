// constants.js - Константы игры

window.PLAYER_WIDTH = 68;
window.PLAYER_HEIGHT = 135;
window.GROUND_LEVEL = 900; // Уменьшаем с 1275 до 900, чтобы поднять землю
window.GROUND_Y = window.GROUND_LEVEL - window.PLAYER_HEIGHT; // 900 - 135 = 765

window.ENEMY_WIDTH = 60;
window.ENEMY_HEIGHT = 135;
window.ENEMY_SPEED = 0.7;
window.ENEMY_HEALTH = 3;
window.ENEMY_SCORE = 10;

window.MAX_ENEMIES = 15;
window.SPAWN_DELAY = 100;

window.GRAVITY = 0.7;
window.PLAYER_SPEED = 5;
window.JUMP_POWER = -20;

window.MAX_SHURIKENS = 5;
window.SHURIKEN_REWARD = 5;