// camera.js - Камера, следующая за игроком

class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        
        // В бесконечном мире нет границ
        this.minX = -Infinity;
        this.maxX = Infinity;
    }
    
    update(targetX) {
        // Центрируем камеру на игроке
        this.x = targetX - this.width / 2;
        
        // В бесконечном мире не ограничиваем камеру
        // this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
    }
    
    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, 0);
    }
    
    restore(ctx) {
        ctx.restore();
    }
    
    reset() {
        this.x = 0;
    }
    
    getScreenX(worldX) {
        return worldX - this.x;
    }
}

window.Camera = Camera;