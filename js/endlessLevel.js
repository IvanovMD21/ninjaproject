// endlessLevel.js - Бесконечный уровень с платформами и стенами

class EndlessLevel {
    constructor() {
        this.groundLevel = window.GROUND_LEVEL;
        this.groundY = window.GROUND_Y;

        this.camera = new Camera(canvas.width, canvas.height);

        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = window.SPAWN_DELAY;

        this.platforms = [];
        this.walls = [];
        this.generatedSections = new Set();
        this.sectionSize = 1200;
        
        this.playerHeight = window.PLAYER_HEIGHT;
        this.maxJumpHeight = 225;
        this.minPlatformHeight = 120;
        this.stepWidth = 180;
        
        this.score = 0;
        this.highScore = this.loadHighScore();

        this.gameOver = false;
        this.startTime = Date.now();

        this.minX = 0;

        this.preGenerateSections(15, true);
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('ninjaHighScore');
        return saved ? parseInt(saved) : 0;
    }
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('ninjaHighScore', this.highScore.toString());
        }
    }

    preGenerateSections(count, includeLeft = false) {
        if (includeLeft) {
            for (let i = -5; i < 0; i++) {
                this.generateSection(i * this.sectionSize, true);
            }
        }
        for (let i = 0; i < count; i++) {
            this.generateSection(i * this.sectionSize, false);
        }
    }

    generateSection(sectionX, isLeftSide = false) {
        const sectionKey = Math.floor(sectionX / this.sectionSize);
        if (this.generatedSections.has(sectionKey)) return;
        
        this.generatedSections.add(sectionKey);
        
        if (isLeftSide || sectionX < 0) {
            this.generatePlatformSection(sectionX, true);
            return;
        }
        
        const distance = sectionX / 1000;
        const wallChance = 0.3 + (distance * 0.05);
        
        if (Math.random() < Math.min(0.7, wallChance)) {
            this.generateWallWithStairs(sectionX);
        } else {
            this.generatePlatformSection(sectionX, false);
        }
    }
    
    generateWallWithStairs(sectionX) {
        const distance = sectionX / 1000;
        const baseHeight = 150;
        const extraHeight = Math.min(375, Math.floor(distance * 90));
        const wallHeight = baseHeight + Math.floor(Math.random() * 225) + extraHeight;
        
        const wallX = sectionX + 450 + Math.random() * 450;
        const wallWidth = 60 + Math.floor(Math.random() * 30);
        const wall = new Platform(wallX, this.groundLevel - wallHeight, wallWidth, wallHeight, 'wall');
        this.walls.push(wall);
        
        const numSteps = Math.ceil(wallHeight / 180) + 1;
        const stepHeight = wallHeight / numSteps;
        
        for (let i = 0; i < numSteps; i++) {
            const stepY = this.groundLevel - 75 - (i * stepHeight);
            
            if (stepY < this.groundLevel - 600) continue;
            if (stepY > this.groundLevel - 90) continue;
            
            const stepX = wallX - 150 - (i * 30);
            
            if (stepX < 0) continue;
            
            if (i > 0) {
                const prevStepY = this.groundLevel - 75 - ((i-1) * stepHeight);
                const jumpDistance = prevStepY - stepY;
                
                if (jumpDistance > this.maxJumpHeight - 30) {
                    const midY = (prevStepY + stepY) / 2;
                    this.addPlatformWithCheck(stepX + 60, midY, this.stepWidth);
                }
            }
            
            this.addPlatformWithCheck(stepX, stepY, this.stepWidth);
        }
        
        for (let i = 0; i < numSteps; i++) {
            const stepY = this.groundLevel - 75 - (i * stepHeight);
            
            if (stepY < this.groundLevel - 600) continue;
            if (stepY > this.groundLevel - 90) continue;
            
            const stepX = wallX + wallWidth + 75 + (i * 30);
            
            if (i > 0) {
                const prevStepY = this.groundLevel - 75 - ((i-1) * stepHeight);
                const jumpDistance = prevStepY - stepY;
                
                if (jumpDistance > this.maxJumpHeight - 30) {
                    const midY = (prevStepY + stepY) / 2;
                    this.addPlatformWithCheck(stepX - 60, midY, this.stepWidth);
                }
            }
            
            this.addPlatformWithCheck(stepX, stepY, this.stepWidth);
        }
        
        const topY = this.groundLevel - wallHeight - 45;
        if (topY > this.groundLevel - 600) {
            this.addPlatformWithCheck(Math.max(0, wallX - 120), topY, 180);
            this.addPlatformWithCheck(wallX + wallWidth + 45, topY, 180);
        }
    }
    
    generatePlatformSection(sectionX, isLeftSide = false) {
        const distance = Math.max(0, sectionX / 1000);
        const extraPlatforms = isLeftSide ? 0 : Math.floor(distance * 3);
        const numPlatforms = 3 + Math.floor(Math.random() * 6) + extraPlatforms;
        
        let lastY = this.groundLevel - 75;
        
        for (let i = 0; i < numPlatforms; i++) {
            const y = Math.max(
                this.groundLevel - 600,
                lastY - (this.maxJumpHeight - 45) - Math.random() * 45
            );
            
            const x = Math.max(0, sectionX + 150 + (i * (isLeftSide ? 120 : 180)) + Math.random() * 150);
            
            let valid = true;
            for (let p of this.platforms) {
                if (Math.abs(p.x - x) < 150) {
                    const dy = Math.abs(p.y - y);
                    if (dy < 75) {
                        valid = false;
                        break;
                    }
                }
            }
            
            if (valid) {
                const width = 120 + Math.floor(Math.random() * 120);
                const platform = new Platform(x, y, width, 30, 'platform');
                this.platforms.push(platform);
                lastY = y;
            }
        }
    }
    
    addPlatformWithCheck(x, y, width = 180) {
        if (x < 0) return;
        
        for (let p of this.platforms) {
            if (Math.abs(p.x - x) < 90) {
                const dy = Math.abs(p.y - y);
                if (dy < this.minPlatformHeight) return;
            }
        }
        
        const platform = new Platform(x, y, width + Math.random() * 45, 30, 'platform');
        this.platforms.push(platform);
    }

    generateNewSections() {
        const currentSection = Math.floor((this.camera.x + canvas.width/2) / this.sectionSize);
        const lookAhead = 10;
        
        for (let i = 1; i <= lookAhead; i++) {
            this.generateSection((currentSection + i) * this.sectionSize, false);
        }
        
        const removeBefore = currentSection - 8;
        
        this.platforms = this.platforms.filter(p => {
            const section = Math.floor(p.x / this.sectionSize);
            if (section < removeBefore) {
                for (let enemy of this.enemies) {
                    if (enemy.currentPlatform === p) {
                        enemy.currentPlatform = null;
                    }
                }
                return false;
            }
            return true;
        });
        
        this.walls = this.walls.filter(w => {
            const section = Math.floor(w.x / this.sectionSize);
            return section >= removeBefore;
        });
        
        for (let key of this.generatedSections) {
            if (key < removeBefore) {
                this.generatedSections.delete(key);
            }
        }
    }

    spawnEnemy() {
        if (!window.player) return;
        
        const spawnWorldX = this.camera.x + canvas.width + 500 + Math.random() * 800;
        
        const visibleEnemies = this.enemies.filter(e => 
            e.x > this.camera.x - 200 && e.x < this.camera.x + canvas.width + 200
        ).length;
        
        if (visibleEnemies >= 6) return;
        
        if (Math.random() < 0.5) {
            const availablePlatforms = this.platforms.filter(p => 
                !p.hasEnemy && 
                p.x > this.camera.x + canvas.width - 200 && 
                p.x < this.camera.x + canvas.width * 2
            );
            
            if (availablePlatforms.length > 0) {
                const platform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
                
                const enemy = new AnimatedEnemy(platform.x + platform.width/2, platform.y);
                enemy.y = platform.y - enemy.height;
                enemy.currentPlatform = platform;
                platform.hasEnemy = true;
                this.enemies.push(enemy);
                return;
            }
        }
        
        this.enemies.push(new AnimatedEnemy(spawnWorldX, this.groundLevel));
    }

    update(player) {
            if (this.gameOver || !player) return;

            if (player.shurikens <= 0) {
                this.gameOver = true;
                this.saveHighScore();
                return;
            }

            this.camera.update(
                player.x + player.width / 2,
                player.y + player.height / 2
            );
            
            this.generateNewSections();

            this.enemySpawnTimer++;
            if (this.enemySpawnTimer >= this.enemySpawnDelay) {
                this.enemySpawnTimer = 0;
                if (this.enemies.length < window.MAX_ENEMIES) {
                    this.spawnEnemy();
                }
            }

            for (let i = this.enemies.length - 1; i >= 0; i--) {
                let enemy = this.enemies[i];
                
                // Обновляем только видимых врагов
                if (enemy.x > this.camera.x - 500 && enemy.x < this.camera.x + canvas.width + 500) {
                    enemy.checkPlayerInRange(player);
                    enemy.update();
                    this.applyPhysicsToEnemy(enemy);
                    
                    // Проверяем столкновение с топорами
                    if (enemy.checkAxeCollision(player)) {
                        this.gameOver = true;
                        this.saveHighScore();
                        return;
                    }
                    
                    // ==== ОЧИСТКА НЕВИДИМЫХ ТОПОРОВ ====
                    // Удаляем топоры, которые улетели за пределы экрана
                    if (enemy.throwingAxes) {
                        enemy.throwingAxes = enemy.throwingAxes.filter(axe => {
                            // Топор виден, если он в пределах экрана + небольшой запас
                            const isVisible = axe.x > this.camera.x - 200 && 
                                            axe.x < this.camera.x + canvas.width + 200;
                            
                            // Если топор не видим и не активен - удаляем
                            // Если топор активен, но улетел далеко - он сам деактивируется через maxTravelDistance
                            return axe.active;
                        });
                    }
                    // ===================================
                }
                
                // Удаляем врагов, которые далеко позади
                if (enemy.x + enemy.width < this.camera.x - 1000) {
                    if (enemy.currentPlatform) {
                        enemy.currentPlatform.hasEnemy = false;
                    }
                    this.enemies.splice(i, 1);
                }   
            }
        }
    applyPhysicsToEnemy(enemy) {
        enemy.velocityY += 0.5;
        enemy.y += enemy.velocityY;
        enemy.onGround = false;
        
        if (enemy.y + enemy.height >= this.groundLevel) {
            enemy.y = this.groundLevel - enemy.height;
            enemy.velocityY = 0;
            enemy.onGround = true;
            if (enemy.currentPlatform) {
                enemy.currentPlatform.hasEnemy = false;
                enemy.currentPlatform = null;
            }
            return;
        }
        
        for (let platform of this.platforms) {
            if (platform.isStandingOn(enemy)) {
                enemy.y = platform.y - enemy.height;
                enemy.velocityY = 0;
                enemy.onGround = true;
                if (enemy.currentPlatform !== platform) {
                    if (enemy.currentPlatform) enemy.currentPlatform.hasEnemy = false;
                    enemy.currentPlatform = platform;
                    platform.hasEnemy = true;
                }
                break;
            }
        }
        
        for (let wall of this.walls) {
            if (this.checkRectCollision(enemy, wall)) {
                if (enemy.x < wall.x) {
                    enemy.x = wall.x - enemy.width;
                } else {
                    enemy.x = wall.x + wall.width;
                }
            }
        }
    }

    checkHorizontalOverlap(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x;
    }

    checkRectCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    checkCollisions(player) {
        if (this.gameOver || !player) return;

        const oldX = player.x;
        const oldY = player.y;

        player.velocityY += player.gravity;
        if (player.velocityY > 15) player.velocityY = 15;

        let newX = player.x + player.velocityX;

        if (newX < this.minX) {
            player.x = this.minX;
            player.velocityX = 0;
        } else {
            player.x = newX;
        }

        for (let wall of this.walls) {
            if (this.checkRectCollision(player, wall)) {
                player.x = oldX;
                player.velocityX = 0;
                break;
            }
        }

        let newY = player.y + player.velocityY;
        player.y = newY;
        player.onGround = false;

        if (player.y + player.height >= this.groundLevel) {
            player.y = this.groundLevel - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }

        if (player.velocityY >= 0) {
            for (let platform of this.platforms) {
                if (platform.type === 'wall') continue;

                const standingOn = (
                    this.checkHorizontalOverlap(player, platform) &&
                    player.y + player.height <= platform.y + 23 &&
                    player.y + player.height >= platform.y - 8 &&
                    oldY + player.height <= platform.y
                );

                if (standingOn) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                    break;
                }
            }
        } else {
            for (let platform of this.platforms) {
                if (platform.type === 'wall') continue;

                const wasBelow = oldY + player.height <= platform.y;
                const isAbove = player.y + player.height > platform.y + 8;

                if (wasBelow && isAbove && this.checkHorizontalOverlap(player, platform)) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                    break;
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            if (this.checkRectCollision(player, enemy)) {
                if (player.velocityY > 0 && oldY + player.height <= enemy.y + 8) {
                    if (enemy.takeDamage()) {
                        if (enemy.currentPlatform) enemy.currentPlatform.hasEnemy = false;
                        this.enemies.splice(i, 1);
                        this.score += enemy.scoreValue;
                        if (player.addShurikens) {
                            player.addShurikens(window.SHURIKEN_REWARD);
                        }
                        player.velocityY = -18;
                    }
                } else {
                    this.gameOver = true;
                    this.saveHighScore();
                    return;
                }
            }
        }

        if (player.fireballs) {
            for (let i = player.fireballs.length - 1; i >= 0; i--) {
                let fireball = player.fireballs[i];
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    let enemy = this.enemies[j];
                    if (this.checkRectCollision(fireball, enemy)) {
                        if (enemy.health > 0) {
                            if (enemy.takeDamage()) {
                                if (enemy.currentPlatform) enemy.currentPlatform.hasEnemy = false;
                                this.enemies.splice(j, 1);
                                this.score += enemy.scoreValue;
                                if (player.addShurikens) {
                                    player.addShurikens(window.SHURIKEN_REWARD);
                                }
                            }
                        }
                        player.fireballs.splice(i, 1);
                        break;
                    }
                }
            }
        }

        if (player.y > canvas.height + 300) {
            this.gameOver = true;
            this.saveHighScore();
        }
    }

    draw(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff7e5f');
    gradient.addColorStop(0.3, '#feb47b');
    gradient.addColorStop(0.6, '#ff6b6b');
    gradient.addColorStop(1, '#4a2f6e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.camera.apply(ctx);

    const startX = Math.max(-3000, Math.floor(this.camera.x / 1000) * 1000 - 3000);
    const endX = startX + 10500;
    
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(startX, this.groundLevel - 30, 10500, 150);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(startX, this.groundLevel - 30, 10500, 15);

    ctx.strokeStyle = '#5c7c44';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = startX; i < endX; i += 60) {
        ctx.moveTo(i, this.groundLevel - 38);
        ctx.lineTo(i + 30, this.groundLevel - 53);
        ctx.lineTo(i + 60, this.groundLevel - 38);
    }
    ctx.stroke();

    for (let platform of this.platforms) {
        platform.draw(ctx);
    }
    
    for (let wall of this.walls) {
        wall.draw(ctx);
    }

    for (let enemy of this.enemies) {
        enemy.draw(ctx);
    }

    if (window.player) {
        window.player.draw(ctx);
    }

    this.camera.restore(ctx);
}

// Новый метод для отрисовки UI отдельно
    drawUI(ctx) {
        // Сохраняем текущее состояние контекста
        ctx.save();
        
        // Сбрасываем ВСЕ трансформации в ноль
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Устанавливаем стили для UI
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Фиксированные координаты для UI (относительно левого верхнего угла canvas)
        const startX = 50;
        let startY = 50;
        
        // Рисуем очки
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 45px "Kashima Rus", Arial';
        ctx.fillText(`Очки: ${this.score}`, startX, startY);
        
        // Рисуем рекорд
        startY += 60;
        ctx.fillText(`Рекорд: ${this.highScore}`, startX, startY);
        
        // Рисуем счетчик сюрикенов
        if (window.player) {
            startY += 60;
            
            if (window.player.shurikenIconLoaded) {
                ctx.drawImage(window.player.shurikenIcon, startX, startY, 120, 48);
            } else {
                ctx.fillStyle = '#ffaa00';
                ctx.font = 'bold 30px "Kashima Rus", Arial';
                ctx.fillText('🔥', startX, startY + 20);
            }
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 45px "Kashima Rus", Arial';
            ctx.fillText(`: ${window.player.shurikens}`, startX + 120, startY);
        }
        
        // Если Game Over - рисуем затемнение и текст
        if (this.gameOver) {
            // Затемнение на весь экран
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Текст Game Over по центру
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 105px "Kashima Rus", Arial';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 105);
            
            if (window.player && window.player.shurikens <= 0) {
                ctx.fillStyle = '#ffaa00';
                ctx.font = 'bold 60px "Kashima Rus", Arial';
                ctx.fillText('СЮРИКЕНЫ КОНЧИЛИСЬ!', canvas.width / 2, canvas.height / 2);
            }
            
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 60px "Kashima Rus", Arial';
            ctx.fillText(`Очки: ${this.score}`, canvas.width / 2, canvas.height / 2 + 75);
            ctx.fillText(`Рекорд: ${this.highScore}`, canvas.width / 2, canvas.height / 2 + 150);
            
            ctx.font = '38px "Kashima Rus", Arial';
            ctx.fillText('Нажми R для рестарта', canvas.width / 2, canvas.height / 2 + 240);
        }
        
        // Восстанавливаем состояние контекста
        ctx.restore();
    }

    reset() {
        this.saveHighScore();
        
        this.enemies = [];
        this.platforms = [];
        this.walls = [];
        this.generatedSections.clear();
        this.score = 0;
        this.gameOver = false;
        this.enemySpawnTimer = 0;
        this.camera.reset();

        if (window.player) {
            window.player.x = 300;
            window.player.y = this.groundY;
            window.player.velocityX = 0;
            window.player.velocityY = 0;
            window.player.fireballs = [];
            window.player.reset();
        }
        
        this.preGenerateSections(15, true);
        this.spawnEnemy();
        this.spawnEnemy();
    }
}

function initEndlessLevel() {
    console.log('Запуск бесконечного уровня');
    window.endlessLevel = new EndlessLevel();
}

function updateEndlessLevel() {
    if (window.endlessLevel && window.player && !window.endlessLevel.gameOver) {
        window.endlessLevel.update(window.player);
        window.endlessLevel.checkCollisions(window.player);
    }
}

function drawEndlessLevel() {
    if (window.endlessLevel) {
        window.endlessLevel.draw(ctx);
    }
}

window.endlessLevel = null;
window.initEndlessLevel = initEndlessLevel;
window.updateEndlessLevel = updateEndlessLevel;
window.drawEndlessLevel = drawEndlessLevel;