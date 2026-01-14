/**
 * Main game loop and initialization
 */

class Game {
    constructor() {
        this.blockManager = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        
        this.init();
    }

    init() {
        console.log('Initializing Minecraft Clone...');
        
        // Initialize systems
        this.blockManager = new BlockManager();
        this.renderer = new Renderer();
        this.world = new World(this.renderer, this.blockManager);
        this.player = new Player(this.renderer.getCamera(), this.world);
        
        // Set initial player position
        this.player.camera.position.set(128, 40, 128);
        
        // Disable context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Start game loop
        this.gameLoop();
        
        console.log('Game initialized successfully!');
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent huge jumps
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        // Update
        this.update(clampedDelta);
        
        // Render
        this.render();
        
        // Update FPS counter
        this.updateFPS(currentTime);
    }

    update(deltaTime) {
        // Update player
        this.player.update(deltaTime);
        
        // Update UI
        this.updateUI();
    }

    render() {
        // Update block highlight
        const highlightPos = this.player.updateTargetedBlock();
        this.renderer.setHighlight(highlightPos);
        
        // Render scene
        this.renderer.render();
    }

    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            const fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            document.getElementById('fps').textContent = `FPS: ${fps}`;
            
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    updateUI() {
        const pos = this.player.getPosition();
        document.getElementById('position').textContent = 
            `Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
        
        document.getElementById('currentBlock').textContent = 
            `Current Block: ${this.player.getCurrentBlockName()}`;
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
