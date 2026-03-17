class ThrowingAxe {
    constructor(x, y, direction, isLeftSide) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.width = 120;
        this.height = 120;
        this.speed = 8;
        this.active = true;
        
        
        this.maxTravelDistance = (canvas.width * 2) / 4;  // 2/3 от ширины экрана
        this.startX = x;  
        // ====================================================================
        
        this.sprites = [];
        this.currentFrame = 0;
        this.animationSpeed = 0.3;
        this.frameCount = 5;
        
        const prefix = isLeftSide ? 'L_axe' : 'R_axe';
        
        for (let i = 1; i <= this.frameCount; i++) {
            const img = new Image();
            img.src = `assets/${prefix}_${i}.png`;
            this.sprites.push(img);
        }
        
        this.imagesLoaded = false;
        let loadedCount = 0;
        for (let img of this.sprites) {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === this.frameCount) {
                    this.imagesLoaded = true;
                }
            };
        }
    }
    
    update() {
        this.x += this.direction * this.speed;
        this.currentFrame += this.animationSpeed;
        if (this.currentFrame >= this.frameCount) {
            this.currentFrame = 0;
        }
        
        // ==== ПРОВЕРКА ДАЛЬНОСТИ ПОЛЕТА ====
        // Если топор улетел дальше максимальной дистанции - деактивируем
        const distanceTraveled = Math.abs(this.x - this.startX);
        if (distanceTraveled > this.maxTravelDistance) {
            this.active = false;
        }
        
        // Старая проверка (оставляем как запасной вариант)
        if (this.x < -1000 || this.x > 10000) {
            this.active = false;
        }
        // ===================================
    }
    
    draw(ctx) {
        if (!this.imagesLoaded) return;
        
        const frame = Math.floor(this.currentFrame);
        if (frame >= 0 && frame < this.sprites.length && this.sprites[frame]) {
            ctx.drawImage(this.sprites[frame], this.x, this.y, this.width, this.height);
        }
    }
}

class AnimatedEnemy {
    constructor(x, yGround) {
        this.width = window.ENEMY_WIDTH * 1.2;
        this.height = window.ENEMY_HEIGHT * 1.2;
        this.x = x;
        
        if (yGround === window.GROUND_LEVEL) {
            this.y = yGround - this.height;
            this.onGround = true;
            this.currentPlatform = null;
        } else {
            this.y = yGround - this.height;
            this.onGround = true;
        }

        this.speed = window.ENEMY_SPEED;
        this.maxHealth = window.ENEMY_HEALTH;
        this.health = this.maxHealth;
        this.scoreValue = window.ENEMY_SCORE;
        this.color = '#c41e3a';

        this.velocityY = 0;
        this.gravity = 0.5;

        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 90 + Math.floor(Math.random() * 180);

        this.frame = 0;
        this.animationSpeed = 0.1;

        this.sprites = { right1: new Image(), right2: new Image(), left1: new Image(), left2: new Image() };
        this.sprites.right1.src = 'assets/R_enemy_1.png';
        this.sprites.right2.src = 'assets/R_enemy_2.png';
        this.sprites.left1.src = 'assets/L_enemy_1.png';
        this.sprites.left2.src = 'assets/L_enemy_2.png';
        this.imagesLoaded = false;
        let loadedCount = 0;
        for (let key in this.sprites) {
            this.sprites[key].onload = () => { loadedCount++; if (loadedCount === 4) this.imagesLoaded = true; };
        }

        this.invulnerable = 0;
        this.invulnerableDuration = 30;
        
        this.currentPlatform = null;
        
        this.throwCooldown = 0;
        this.throwCooldownMax = 120;
        this.throwingAxes = [];
        this.playerInRange = false;
        this.playerSide = null;
        
        this.detectionRange = this.width * 20;
    }

    update() {
        this.frame += this.animationSpeed;
        if (this.frame >= 2) this.frame = 0;

        if (this.invulnerable > 0) this.invulnerable--;

        if (this.throwCooldown > 0) {
            this.throwCooldown--;
        }

        for (let i = this.throwingAxes.length - 1; i >= 0; i--) {
            this.throwingAxes[i].update();
            if (!this.throwingAxes[i].active) {
                this.throwingAxes.splice(i, 1);
            }
        }

        if (this.playerInRange && this.playerSide) {
            if (this.throwCooldown <= 0) {
                this.throwAxe();
                this.throwCooldown = this.throwCooldownMax;
            }
        }

        this.changeDirectionTimer++;
        if (this.changeDirectionTimer >= this.changeDirectionInterval) {
            this.direction *= -1;
            this.changeDirectionTimer = 0;
            this.changeDirectionInterval = 90 + Math.floor(Math.random() * 180);
        }

        if (this.onGround) {
            let newX = this.x + this.speed * this.direction;
            
            if (this.currentPlatform) {
                if (newX < this.currentPlatform.x) {
                    newX = this.currentPlatform.x;
                    this.direction *= -1;
                } else if (newX + this.width > this.currentPlatform.x + this.currentPlatform.width) {
                    newX = this.currentPlatform.x + this.currentPlatform.width - this.width;
                    this.direction *= -1;
                }
            }
            
            this.x = newX;
        }
    }
    
    checkPlayerInRange(player) {
        if (!player) return;
        
        const detectionBox = {
            x: this.x - (this.detectionRange - this.width) / 2,
            y: this.y,
            width: this.detectionRange,
            height: this.height
        };
        
        const playerRect = {
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height
        };
        
        const collision = !(playerRect.x > detectionBox.x + detectionBox.width ||
                           playerRect.x + playerRect.width < detectionBox.x ||
                           playerRect.y > detectionBox.y + detectionBox.height ||
                           playerRect.y + playerRect.height < detectionBox.y);
        
        if (collision) {
            this.playerInRange = true;
            
            const playerCenterX = player.x + player.width / 2;
            const enemyCenterX = this.x + this.width / 2;
            
            if (playerCenterX < enemyCenterX) {
                this.playerSide = 'left';
            } else {
                this.playerSide = 'right';
            }
        } else {
            this.playerInRange = false;
            this.playerSide = null;
        }
        
        return collision;
    }
    
    throwAxe() {
        const direction = this.playerSide === 'left' ? -1 : 1;
        
        const axeX = this.playerSide === 'left' ? 
            this.x - 30 : 
            this.x + this.width + 30;
            
        const axeY = this.y + this.height / 2 - 30;
        
        const axe = new ThrowingAxe(axeX, axeY, direction, this.playerSide === 'left');
        this.throwingAxes.push(axe);
    }
    
    checkAxeCollision(player) {
        for (let i = this.throwingAxes.length - 1; i >= 0; i--) {
            const axe = this.throwingAxes[i];
            
            if (axe.x < player.x + player.width &&
                axe.x + axe.width > player.x &&
                axe.y < player.y + player.height &&
                axe.y + axe.height > player.y) {
                
                this.throwingAxes.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
       
        for (let axe of this.throwingAxes) {
            axe.draw(ctx);
        }

        if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.imagesLoaded) {
            const frameNum = Math.floor(this.frame);
            let spriteKey = '';
            if (this.direction === 1) {
                spriteKey = frameNum === 0 ? 'right1' : 'right2';
            } else {
                spriteKey = frameNum === 0 ? 'left1' : 'left2';
            }
            const sprite = this.sprites[spriteKey];
            if (sprite) ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.globalAlpha = 1.0;

        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 9;
        const barX = this.x;
        const barY = this.y - 15;
        const healthPercent = this.health / this.maxHealth;

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    takeDamage() {
        if (this.invulnerable <= 0) {
            this.health--;
            this.invulnerable = this.invulnerableDuration;
            if (this.health <= 0) return true;
        }
        return false;
    }
}

window.ThrowingAxe = ThrowingAxe;
window.AnimatedEnemy = AnimatedEnemy;