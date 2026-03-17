// player.js - Класс игрока с анимацией и файерболами

class Fireball {
    constructor(x, y, direction, character) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.width = 48;
        this.height = 18;
        this.speed = 12;
        this.active = true;
        this.character = character;
        this.image = new Image();
        this.image.src = 'assets/fire.png';
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
    }

    update() {
        this.x += this.direction * this.speed;
        if (this.x < -500 || this.x > 6000) this.active = false;
    }

    draw(ctx) {
        if (!this.imageLoaded) return;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class AnimatedPlayer {
    constructor(character = 'boy') {
        this.character = character;
        this.x = 200;
        this.y = window.GROUND_Y;
        this.width = window.PLAYER_WIDTH;
        this.height = window.PLAYER_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = window.PLAYER_SPEED;
        this.jumpPower = window.JUMP_POWER;
        this.gravity = window.GRAVITY;
        this.onGround = false;

        this.frame = 0;
        this.animationSpeed = 0.15;
        this.state = 'idle';
        this.direction = 1;

        this.fireballs = [];
        this.shurikens = window.MAX_SHURIKENS;
        this.maxFireballs = 10;
        this.throwCooldown = 0;
        this.throwCooldownMax = 5;

        const base = character === 'boy' ? 'man' : 'woman';
        
        this.sprites = {
            idle: new Image(),
            runRight1: new Image(),
            runRight2: new Image(),
            runLeft1: new Image(),
            runLeft2: new Image()
        };
        
        this.sprites.idle.src = `assets/${base}_1.png`;
        this.sprites.runRight1.src = `assets/R_${base}_2.png`;
        this.sprites.runRight2.src = `assets/R_${base}_3.png`;
        this.sprites.runLeft1.src = `assets/L_${base}_2.png`;
        this.sprites.runLeft2.src = `assets/L_${base}_3.png`;
        
        this.sprites.jumpRight = [];
        this.sprites.jumpLeft = [];
        
        for (let i = 1; i <= 5; i++) {
            this.sprites.jumpRight[i] = new Image();
            this.sprites.jumpRight[i].src = `assets/R_${base}_jump_${i}.png`;
        }
        
        for (let i = 1; i <= 5; i++) {
            this.sprites.jumpLeft[i] = new Image();
            this.sprites.jumpLeft[i].src = `assets/L_${base}_jump_${i}.png`;
        }

        this.imagesLoaded = {};
        
        for (let key in this.sprites) {
            if (key !== 'jumpRight' && key !== 'jumpLeft' && this.sprites[key] instanceof Image) {
                this.imagesLoaded[key] = false;
                this.sprites[key].onload = () => { this.imagesLoaded[key] = true; };
            }
        }
        
        for (let i = 1; i <= 5; i++) {
            this.imagesLoaded[`jumpRight${i}`] = false;
            this.imagesLoaded[`jumpLeft${i}`] = false;
            
            this.sprites.jumpRight[i].onload = () => { 
                this.imagesLoaded[`jumpRight${i}`] = true; 
            };
            this.sprites.jumpLeft[i].onload = () => { 
                this.imagesLoaded[`jumpLeft${i}`] = true; 
            };
        }
        
        this.shurikenIcon = new Image();
        this.shurikenIcon.src = 'assets/fire.png';
        this.shurikenIconLoaded = false;
        this.shurikenIcon.onload = () => { this.shurikenIconLoaded = true; };
    }

    updateAnimation() {
        this.frame += this.animationSpeed;
        if (this.frame >= 5) this.frame = 0;

        if (this.throwCooldown > 0) this.throwCooldown--;

        if (!this.onGround) {
            this.state = 'jumping';
        } else {
            this.state = Math.abs(this.velocityX) > 0.1 ? 'running' : 'idle';
        }

        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            this.fireballs[i].update();
            if (!this.fireballs[i].active) this.fireballs.splice(i, 1);
        }
    }

    throwFireball() {
        if (this.shurikens <= 0) return false;
        
        if (this.throwCooldown <= 0 && this.fireballs.length < this.maxFireballs) {
            const offsetX = this.direction === 1 ? this.width : -48;
            this.fireballs.push(new Fireball(this.x + offsetX, this.y + this.height / 2 - 24, this.direction, this.character));
            this.throwCooldown = this.throwCooldownMax;
            this.shurikens--;
            return true;
        }
        return false;
    }
    
    addShurikens(amount) {
        this.shurikens += amount;
    }

    draw(ctx) {
        let sprite = null;
        const frameNum = Math.floor(this.frame);
        
        if (this.state === 'jumping') {
            if (this.direction === 1) {
                sprite = this.sprites.jumpRight[frameNum + 1];
            } else {
                sprite = this.sprites.jumpLeft[frameNum + 1];
            }
        } else if (this.state === 'running') {
            if (this.direction === 1) {
                sprite = frameNum < 2 ? this.sprites.runRight1 : this.sprites.runRight2;
            } else {
                sprite = frameNum < 2 ? this.sprites.runLeft1 : this.sprites.runLeft2;
            }
        } else {
            sprite = this.sprites.idle;
        }

        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.character === 'boy' ? '#4169e1' : '#ff69b4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        for (let fireball of this.fireballs) {
            fireball.draw(ctx);
        }
    }

    jump() {
        if (this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
            this.frame = 0;
        }
    }
    
    reset() {
        this.shurikens = window.MAX_SHURIKENS;
        this.fireballs = [];
        this.frame = 0;
        this.state = 'idle';
    }
}

window.Fireball = Fireball;
window.AnimatedPlayer = AnimatedPlayer;