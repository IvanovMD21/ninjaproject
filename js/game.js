// game.js - Главный игровой цикл и управление

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Глобальные переменные
let gameState = 'menu';
let selectedCharacter = null;
let isPaused = false;

// Управление
window.keys = {};
window.hoveredCharacter = null;

// Маппинг русских букв на английские
const keyMapping = {
    'ц': 'w', 'ф': 'a', 'ы': 's', 'в': 'd',
    'Ц': 'W', 'Ф': 'A', 'Ы': 'S', 'В': 'D',
    'к': 'r', 'К': 'R',
    'ArrowUp': 'ArrowUp',
    'ArrowDown': 'ArrowDown',
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    ' ': ' ',
    'Space': 'Space',
    'Escape': 'Escape',
    'r': 'r', 'R': 'R'
};

function normalizeKey(key) {
    if (key.startsWith('Arrow') || key === ' ' || key === 'Space' || key === 'Escape') {
        return key;
    }
    
    if (keyMapping[key]) {
        return keyMapping[key];
    }
    
    return key;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('keydown', (e) => {
    const originalKey = e.key;
    const key = normalizeKey(originalKey);
    
    if ([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'Escape', 'r', 'R'].includes(key)) {
        e.preventDefault();
    }

    window.keys[key] = true;
    
    if (gameState === 'menu') {
        return;
    }
    
    if (gameState === 'characterSelect') {
        return;
    }
    
    if (gameState === 'playing') {
        
        if (key === 'Escape') {
            if (window.endlessLevel && window.endlessLevel.gameOver) {
                gameState = 'menu';
                return;
            }
            
            isPaused = !isPaused;
            return;
        }
        
        if (key === 'r' || key === 'R') {
            if (window.endlessLevel) {
                if (window.endlessLevel.gameOver) {
                    window.endlessLevel.reset();
                } else if (isPaused) {
                    window.endlessLevel.reset();
                    isPaused = false;
                }
            }
            return;
        }
        
        if (!isPaused && window.player) {
            if (key === 'ArrowUp' || key === 'w' || key === 'W') {
                window.player.jump();
            }
            if (key === ' ' || key === 'Space') {
                window.player.throwFireball();
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    const originalKey = e.key;
    const key = normalizeKey(originalKey);
    window.keys[key] = false;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (gameState === 'menu') {
        const buttonX = canvas.width/2 - 150;
        const buttonY = canvas.height/2 + 50;
        const buttonWidth = 300;
        const buttonHeight = 70;

        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            gameState = 'characterSelect';
        }
    }
    else if (gameState === 'characterSelect') {
        const boyX = canvas.width/2 - 350;
        const girlX = canvas.width/2 + 50;
        const charY = canvas.height/2 - 200;
        const charWidth = 300;
        const charHeight = 400;

        if (x >= boyX && x <= boyX + charWidth && y >= charY && y <= charY + charHeight) {
            selectedCharacter = 'boy';
            startGame();
        }
        else if (x >= girlX && x <= girlX + charWidth && y >= charY && y <= charY + charHeight) {
            selectedCharacter = 'girl';
            startGame();
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (gameState !== 'characterSelect') return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    window.hoveredCharacter = null;
    const boyX = canvas.width/2 - 350;
    const girlX = canvas.width/2 + 50;
    const charY = canvas.height/2 - 200;
    const charWidth = 300;
    const charHeight = 400;
    if (x >= boyX && x <= boyX + charWidth && y >= charY && y <= charY + charHeight) window.hoveredCharacter = 'boy';
    if (x >= girlX && x <= girlX + charWidth && y >= charY && y <= charY + charHeight) window.hoveredCharacter = 'girl';
});

function startGame() {
    console.log('Starting game with character:', selectedCharacter);
    window.player = new AnimatedPlayer(selectedCharacter);
    if (typeof initEndlessLevel === 'function') {
        initEndlessLevel();
        gameState = 'playing';
        isPaused = false;
    } else {
        console.error('initEndlessLevel not found!');
    }
}

function drawMenu() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffcc00';
    ctx.font = `bold ${Math.min(100, canvas.width/8)}px "Kashima Rus", Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NINJA', canvas.width/2, canvas.height/2 - 100);

    const buttonX = canvas.width/2 - 150;
    const buttonY = canvas.height/2 + 50;
    const buttonWidth = 300;
    const buttonHeight = 70;
    
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
    ctx.fill();
    
    ctx.fillStyle = '#0a0a1a';
    ctx.font = `bold ${Math.min(40, canvas.width/20)}px "Kashima Rus", Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('СТАРТ', canvas.width/2, buttonY + buttonHeight/2);
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
};

function gameLoop() {
    // Обновление физики
    if (window.player && gameState === 'playing' && !isPaused) {
        let moveLeft = window.keys['ArrowLeft'] || window.keys['a'] || window.keys['A'];
        let moveRight = window.keys['ArrowRight'] || window.keys['d'] || window.keys['D'];

        if (moveLeft && !moveRight) {
            window.player.velocityX = -window.player.speed;
            window.player.direction = -1;
        } else if (moveRight && !moveLeft) {
            window.player.velocityX = window.player.speed;
            window.player.direction = 1;
        } else {
            window.player.velocityX = 0;
        }
        window.player.updateAnimation();
    }

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка в зависимости от состояния
    if (gameState === 'menu') {
        drawMenu();
    } 
    else if (gameState === 'characterSelect') {
        if (typeof drawCharacterSelect === 'function') drawCharacterSelect();
    } 
    else if (gameState === 'playing') {
        // Обновляем игру если не на паузе
        if (!isPaused && typeof updateEndlessLevel === 'function') {
            updateEndlessLevel();
        }
        
        // Рисуем мир
        if (typeof drawEndlessLevel === 'function') {
            drawEndlessLevel();
        }
        
        // Рисуем UI поверх мира
        if (window.endlessLevel && typeof window.endlessLevel.drawUI === 'function') {
            window.endlessLevel.drawUI(ctx);
        }
        
        // Рисуем паузу поверх всего
        if (isPaused && window.endlessLevel && !window.endlessLevel.gameOver) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 70px "Kashima Rus", Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = '30px "Kashima Rus", Arial';
            ctx.fillText('ESC - продолжить', canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('R - начать сначала', canvas.width / 2, canvas.height / 2 + 60);
            
            ctx.restore();
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
console.log('Game initialized');