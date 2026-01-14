/**
 * Three.js renderer setup and rendering optimizations
 */

class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.highlightBox = null;
        
        this.init();
    }

    init() {
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 40, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = false;

        // Setup scene
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);

        // Create highlight box for targeted block
        const highlightGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.highlightBox = new THREE.Mesh(highlightGeometry, highlightMaterial);
        this.highlightBox.visible = false;
        this.scene.add(this.highlightBox);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    addToScene(object) {
        this.scene.add(object);
    }

    removeFromScene(object) {
        this.scene.remove(object);
    }

    setHighlight(position) {
        if (position) {
            this.highlightBox.position.copy(position);
            this.highlightBox.visible = true;
        } else {
            this.highlightBox.visible = false;
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }
}
