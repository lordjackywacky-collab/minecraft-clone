/**
 * Player controller with movement, physics, and collision detection
 */

import * as THREE from './three.module.min.js';
import { BlockType } from './blocks.js';

export class Player {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;
        
        // Movement
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 5;
        this.jumpSpeed = 8;
        this.gravity = 20;
        
        // Player dimensions
        this.height = 1.7;
        this.width = 0.6;
        
        // State
        this.isOnGround = false;
        this.isJumping = false;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        
        // Mouse
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;
        this.isPointerLocked = false;
        
        // Raycasting for block interaction
        this.raycaster = new THREE.Raycaster();
        this.targetedBlock = null;
        
        // Current block to place
        this.currentBlockType = BlockType.DIRT;
        
        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse controls
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        
        // Pointer lock
        document.body.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
            const prompt = document.getElementById('clickPrompt');
            if (this.isPointerLocked) {
                prompt.classList.add('hidden');
            } else {
                prompt.classList.remove('hidden');
            }
        });
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                event.preventDefault();
                break;
            case 'Digit1':
                this.currentBlockType = BlockType.DIRT;
                break;
            case 'Digit2':
                this.currentBlockType = BlockType.STONE;
                break;
            case 'Digit3':
                this.currentBlockType = BlockType.WOOD;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
        }
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;

        this.rotation.y -= event.movementX * this.mouseSensitivity;
        this.rotation.x -= event.movementY * this.mouseSensitivity;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }

    onMouseDown(event) {
        if (!this.isPointerLocked) return;

        event.preventDefault();

        if (event.button === 0) {
            // Left click - break block
            this.breakBlock();
        } else if (event.button === 2) {
            // Right click - place block
            this.placeBlock();
        }
    }

    breakBlock() {
        const result = this.world.raycastBlocks(
            this.camera.position,
            this.getViewDirection(),
            5
        );

        if (result.hit) {
            this.world.setBlock(
                result.position.x,
                result.position.y,
                result.position.z,
                BlockType.AIR
            );
        }
    }

    placeBlock() {
        const result = this.world.raycastBlocks(
            this.camera.position,
            this.getViewDirection(),
            5
        );

        if (result.hit) {
            // Place block adjacent to the hit face
            const placePos = result.position.clone().add(result.normal);
            
            // Don't place block where player is standing
            const playerBottom = this.camera.position.y - this.height;
            const playerTop = this.camera.position.y + 0.3;
            
            const blockBottom = placePos.y;
            const blockTop = placePos.y + 1;
            
            const dx = Math.abs(placePos.x + 0.5 - this.camera.position.x);
            const dz = Math.abs(placePos.z + 0.5 - this.camera.position.z);
            
            // Check if block would intersect with player
            if (dx < this.width && dz < this.width && 
                blockBottom < playerTop && blockTop > playerBottom) {
                return; // Don't place block
            }
            
            this.world.setBlock(
                placePos.x,
                placePos.y,
                placePos.z,
                this.currentBlockType
            );
        }
    }

    getViewDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.rotation);
        return direction;
    }

    update(deltaTime) {
        // Apply rotation to camera
        this.camera.quaternion.setFromEuler(this.rotation);
        
        // Calculate movement direction
        this.direction.set(0, 0, 0);
        
        if (this.keys.forward) this.direction.z -= 1;
        if (this.keys.backward) this.direction.z += 1;
        if (this.keys.left) this.direction.x -= 1;
        if (this.keys.right) this.direction.x += 1;
        
        this.direction.normalize();
        this.direction.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        // Apply movement
        this.velocity.x = this.direction.x * this.moveSpeed;
        this.velocity.z = this.direction.z * this.moveSpeed;
        
        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y -= this.gravity * deltaTime;
        }
        
        // Jump
        if (this.keys.jump && this.isOnGround && !this.isJumping) {
            this.velocity.y = this.jumpSpeed;
            this.isJumping = true;
            this.isOnGround = false;
        }
        
        if (!this.keys.jump) {
            this.isJumping = false;
        }
        
        // Move with collision detection
        this.moveWithCollision(deltaTime);
        
        // Update targeted block highlight
        this.updateTargetedBlock();
    }

    moveWithCollision(deltaTime) {
        const newPos = this.camera.position.clone();
        
        // Move horizontally
        newPos.x += this.velocity.x * deltaTime;
        if (!this.checkCollision(newPos)) {
            this.camera.position.x = newPos.x;
        }
        newPos.x = this.camera.position.x;
        
        newPos.z += this.velocity.z * deltaTime;
        if (!this.checkCollision(newPos)) {
            this.camera.position.z = newPos.z;
        }
        
        // Move vertically
        newPos.y += this.velocity.y * deltaTime;
        
        // Ground detection
        const feetPos = newPos.y - this.height;
        const feetBlock = this.world.getBlock(newPos.x, feetPos, newPos.z);
        
        if (this.world.blockManager.isSolid(feetBlock)) {
            // On ground
            this.camera.position.y = Math.floor(feetPos) + 1 + this.height;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            // In air
            const headPos = newPos.y + 0.3;
            const headBlock = this.world.getBlock(newPos.x, headPos, newPos.z);
            
            if (this.world.blockManager.isSolid(headBlock)) {
                // Hit ceiling
                this.velocity.y = 0;
                this.camera.position.y = Math.floor(headPos) - 0.3;
            } else {
                this.camera.position.y = newPos.y;
                this.isOnGround = false;
            }
        }
    }

    checkCollision(position) {
        // Check collision with blocks around player
        const halfWidth = this.width / 2;
        const feetY = position.y - this.height;
        const headY = position.y + 0.3;
        
        // Check corners of player bounding box
        const corners = [
            new THREE.Vector3(position.x + halfWidth, feetY, position.z + halfWidth),
            new THREE.Vector3(position.x + halfWidth, feetY, position.z - halfWidth),
            new THREE.Vector3(position.x - halfWidth, feetY, position.z + halfWidth),
            new THREE.Vector3(position.x - halfWidth, feetY, position.z - halfWidth),
            new THREE.Vector3(position.x + halfWidth, headY, position.z + halfWidth),
            new THREE.Vector3(position.x + halfWidth, headY, position.z - halfWidth),
            new THREE.Vector3(position.x - halfWidth, headY, position.z + halfWidth),
            new THREE.Vector3(position.x - halfWidth, headY, position.z - halfWidth),
        ];
        
        for (let corner of corners) {
            const block = this.world.getBlock(corner.x, corner.y, corner.z);
            if (this.world.blockManager.isSolid(block)) {
                return true;
            }
        }
        
        return false;
    }

    updateTargetedBlock() {
        const result = this.world.raycastBlocks(
            this.camera.position,
            this.getViewDirection(),
            5
        );

        if (result.hit) {
            this.targetedBlock = result;
            // Offset position to center of block
            const highlightPos = new THREE.Vector3(
                result.position.x + 0.5,
                result.position.y + 0.5,
                result.position.z + 0.5
            );
            return highlightPos;
        } else {
            this.targetedBlock = null;
            return null;
        }
    }

    getPosition() {
        return this.camera.position;
    }

    getCurrentBlockName() {
        return this.world.blockManager.getBlockName(this.currentBlockType);
    }
}
