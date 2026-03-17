// platform.js - Класс платформы и бамбуковой стены

class Platform {
    constructor(x, y, width, height, type = 'platform') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.hasEnemy = false;
        
        if (type === 'wall') {
            this.segments = Math.ceil(height / 45);
        }
    }
    
    update() {}
    
    draw(ctx) {
        if (this.type === 'platform') {
            this.drawPlatform(ctx);
        } else {
            this.drawBambooWall(ctx);
        }
    }
    
    drawPlatform(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < this.width; i += 23) {
            ctx.fillRect(this.x + i, this.y, 8, this.height);
        }
        
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(this.x, this.y - 5, this.width, 5);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x, this.y + this.height, this.width, 8);
        
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    drawBambooWall(ctx) {
        const segmentHeight = 45;
        const poleWidth = 30;
        const numPoles = Math.max(1, Math.floor(this.width / poleWidth));
        
        for (let p = 0; p < numPoles; p++) {
            const poleX = this.x + p * poleWidth + (poleWidth - 12) / 2;
            
            for (let i = 0; i < this.segments; i++) {
                const segmentY = this.y + i * segmentHeight;
                
                ctx.fillStyle = '#2E8B57';
                ctx.fillRect(poleX, segmentY, 12, segmentHeight - 3);
                
                ctx.fillStyle = '#228B22';
                ctx.fillRect(poleX - 3, segmentY - 3, 18, 6);
                ctx.fillRect(poleX - 3, segmentY + segmentHeight - 9, 18, 6);
                
                if (i === 0 && Math.random() > 0.3) {
                    ctx.fillStyle = '#32CD32';
                    ctx.beginPath();
                    ctx.moveTo(poleX + 12, segmentY - 8);
                    ctx.lineTo(poleX + 38, segmentY - 30);
                    ctx.lineTo(poleX + 23, segmentY - 8);
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.moveTo(poleX + 6, segmentY - 12);
                    ctx.lineTo(poleX - 23, segmentY - 35);
                    ctx.lineTo(poleX - 8, segmentY - 12);
                    ctx.fill();
                }
            }
        }
        
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 8 + i * 15, this.y);
            ctx.lineTo(this.x + 23 + i * 15, this.y + this.height);
            ctx.stroke();
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + this.width, this.y, 8, this.height);
    }
    
    checkCollision(obj) {
        return obj.x < this.x + this.width &&
               obj.x + obj.width > this.x &&
               obj.y < this.y + this.height &&
               obj.y + obj.height > this.y;
    }
    
    isStandingOn(obj) {
        if (this.type === 'wall') return false;
        
        return obj.x < this.x + this.width &&
               obj.x + obj.width > this.x &&
               obj.y + obj.height <= this.y + 15 &&
               obj.y + obj.height >= this.y - 8 &&
               obj.velocityY >= 0;
    }
}

window.Platform = Platform;