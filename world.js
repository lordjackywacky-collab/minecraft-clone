/**
 * World generation and chunk management
 */

class Chunk {
    constructor(x, z, blockManager) {
        this.x = x;
        this.z = z;
        this.blockManager = blockManager;
        this.blocks = new Uint8Array(16 * 16 * 64); // 16x16x64 blocks
        this.mesh = null;
        this.dirty = true;
    }

    getBlockIndex(x, y, z) {
        return x + z * 16 + y * 16 * 16;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= 16 || y < 0 || y >= 64 || z < 0 || z >= 16) {
            return BlockType.AIR;
        }
        return this.blocks[this.getBlockIndex(x, y, z)];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= 16 || y < 0 || y >= 64 || z < 0 || z >= 16) {
            return;
        }
        this.blocks[this.getBlockIndex(x, y, z)] = type;
        this.dirty = true;
    }

    generateTerrain() {
        const offsetX = this.x * 16;
        const offsetZ = this.z * 16;

        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                // Simple terrain height calculation
                const worldX = offsetX + x;
                const worldZ = offsetZ + z;
                const height = 32 + Math.floor(
                    Math.sin(worldX * 0.1) * 3 + 
                    Math.cos(worldZ * 0.1) * 3
                );

                // Bedrock layer
                this.setBlock(x, 0, z, BlockType.BEDROCK);

                // Stone layers
                for (let y = 1; y < height - 4; y++) {
                    this.setBlock(x, y, z, BlockType.STONE);
                }

                // Dirt layers
                for (let y = height - 4; y < height; y++) {
                    this.setBlock(x, y, z, BlockType.DIRT);
                }

                // Grass top layer
                this.setBlock(x, height, z, BlockType.GRASS);

                // Add simple trees randomly
                if (Math.random() < 0.02 && height > 30) {
                    this.generateTree(x, height + 1, z);
                }
            }
        }
    }

    generateTree(x, y, z) {
        // Tree trunk (4 blocks high)
        for (let i = 0; i < 4; i++) {
            this.setBlock(x, y + i, z, BlockType.WOOD);
        }

        // Tree leaves (simple cube)
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 2; dy++) {
                    if (dx === 0 && dz === 0 && dy < 2) continue; // Skip trunk
                    const lx = x + dx;
                    const lz = z + dz;
                    const ly = y + 3 + dy;
                    if (lx >= 0 && lx < 16 && lz >= 0 && lz < 16) {
                        this.setBlock(lx, ly, lz, BlockType.LEAVES);
                    }
                }
            }
        }
    }

    buildMesh() {
        if (!this.dirty) return;

        // Remove old mesh if it exists
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh = null;
        }

        const geometries = {};
        for (let type in BlockColors) {
            geometries[type] = [];
        }

        // Build mesh with face culling
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 64; y++) {
                for (let z = 0; z < 16; z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === BlockType.AIR) continue;

                    const wx = this.x * 16 + x;
                    const wz = this.z * 16 + z;

                    this.addBlockFaces(x, y, z, wx, y, wz, blockType, geometries);
                }
            }
        }

        // Create merged mesh for the chunk
        const group = new THREE.Group();
        
        for (let type in geometries) {
            if (geometries[type].length === 0) continue;

            const mergedGeometry = new THREE.BufferGeometry();
            const positions = [];
            const normals = [];
            const indices = [];
            let vertexOffset = 0;

            for (let geom of geometries[type]) {
                const posArray = geom.getAttribute('position').array;
                const normArray = geom.getAttribute('normal').array;
                const idxArray = geom.index.array;

                for (let i = 0; i < posArray.length; i++) {
                    positions.push(posArray[i]);
                }
                for (let i = 0; i < normArray.length; i++) {
                    normals.push(normArray[i]);
                }
                for (let i = 0; i < idxArray.length; i++) {
                    indices.push(idxArray[i] + vertexOffset);
                }

                vertexOffset += posArray.length / 3;
                geom.dispose();
            }

            mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            mergedGeometry.setIndex(indices);

            const mesh = new THREE.Mesh(mergedGeometry, this.blockManager.getMaterial(type));
            group.add(mesh);
        }

        this.mesh = group;
        this.dirty = false;
    }

    addBlockFaces(x, y, z, wx, wy, wz, blockType, geometries) {
        const size = 1;

        // Check each face and only add if adjacent block is air or transparent
        // Top face
        if (this.shouldRenderFace(x, y + 1, z)) {
            const geo = new THREE.BoxGeometry(size, 0.01, size);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(0, 0.5, 0);
            geometries[blockType].push(geo);
        }

        // Bottom face
        if (this.shouldRenderFace(x, y - 1, z)) {
            const geo = new THREE.BoxGeometry(size, 0.01, size);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(0, -0.5, 0);
            geometries[blockType].push(geo);
        }

        // Front face
        if (this.shouldRenderFace(x, y, z + 1)) {
            const geo = new THREE.BoxGeometry(size, size, 0.01);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(0, 0, 0.5);
            geometries[blockType].push(geo);
        }

        // Back face
        if (this.shouldRenderFace(x, y, z - 1)) {
            const geo = new THREE.BoxGeometry(size, size, 0.01);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(0, 0, -0.5);
            geometries[blockType].push(geo);
        }

        // Right face
        if (this.shouldRenderFace(x + 1, y, z)) {
            const geo = new THREE.BoxGeometry(0.01, size, size);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(0.5, 0, 0);
            geometries[blockType].push(geo);
        }

        // Left face
        if (this.shouldRenderFace(x - 1, y, z)) {
            const geo = new THREE.BoxGeometry(0.01, size, size);
            geo.translate(wx + 0.5, wy + 0.5, wz + 0.5);
            geo.translate(-0.5, 0, 0);
            geometries[blockType].push(geo);
        }
    }

    shouldRenderFace(x, y, z) {
        const block = this.getBlock(x, y, z);
        return !this.blockManager.isSolid(block) || this.blockManager.isTransparent(block);
    }
}

class World {
    constructor(renderer, blockManager) {
        this.renderer = renderer;
        this.blockManager = blockManager;
        this.chunks = new Map();
        this.worldSize = 16; // 16x16 chunks
        
        this.generate();
    }

    generate() {
        // Generate chunks
        for (let x = 0; x < this.worldSize; x++) {
            for (let z = 0; z < this.worldSize; z++) {
                const chunk = new Chunk(x, z, this.blockManager);
                chunk.generateTerrain();
                const key = `${x},${z}`;
                this.chunks.set(key, chunk);
            }
        }

        // Build meshes for all chunks
        this.chunks.forEach(chunk => {
            chunk.buildMesh();
            if (chunk.mesh) {
                this.renderer.addToScene(chunk.mesh);
            }
        });
    }

    getChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        return this.chunks.get(key);
    }

    worldToChunk(worldX, worldZ) {
        return {
            chunkX: Math.floor(worldX / 16),
            chunkZ: Math.floor(worldZ / 16),
            localX: Math.floor(worldX) % 16,
            localZ: Math.floor(worldZ) % 16
        };
    }

    getBlock(x, y, z) {
        const { chunkX, chunkZ, localX, localZ } = this.worldToChunk(x, z);
        const chunk = this.getChunk(chunkX, chunkZ);
        
        if (!chunk) return BlockType.AIR;
        
        // Handle negative local coordinates
        const lx = localX < 0 ? localX + 16 : localX;
        const lz = localZ < 0 ? localZ + 16 : localZ;
        
        return chunk.getBlock(lx, Math.floor(y), lz);
    }

    setBlock(x, y, z, type) {
        const { chunkX, chunkZ, localX, localZ } = this.worldToChunk(x, z);
        const chunk = this.getChunk(chunkX, chunkZ);
        
        if (!chunk) return;
        
        // Handle negative local coordinates
        const lx = localX < 0 ? localX + 16 : localX;
        const lz = localZ < 0 ? localZ + 16 : localZ;
        
        chunk.setBlock(lx, Math.floor(y), lz, type);
        
        // Rebuild chunk mesh
        if (chunk.mesh) {
            this.renderer.removeFromScene(chunk.mesh);
        }
        chunk.buildMesh();
        if (chunk.mesh) {
            this.renderer.addToScene(chunk.mesh);
        }
    }

    raycastBlocks(origin, direction, maxDistance = 10) {
        // Simple voxel raycast
        const step = 0.1;
        const pos = origin.clone();
        const dir = direction.clone().normalize();

        for (let i = 0; i < maxDistance / step; i++) {
            pos.add(dir.multiplyScalar(step));
            
            const block = this.getBlock(pos.x, pos.y, pos.z);
            
            if (this.blockManager.isSolid(block)) {
                // Find exact block position
                const blockPos = new THREE.Vector3(
                    Math.floor(pos.x),
                    Math.floor(pos.y),
                    Math.floor(pos.z)
                );

                // Calculate which face was hit
                const localPos = new THREE.Vector3(
                    pos.x - blockPos.x,
                    pos.y - blockPos.y,
                    pos.z - blockPos.z
                );

                let normal = new THREE.Vector3(0, 1, 0);
                const epsilon = 0.01;

                if (localPos.y < epsilon) normal.set(0, -1, 0);
                else if (localPos.y > 1 - epsilon) normal.set(0, 1, 0);
                else if (localPos.x < epsilon) normal.set(-1, 0, 0);
                else if (localPos.x > 1 - epsilon) normal.set(1, 0, 0);
                else if (localPos.z < epsilon) normal.set(0, 0, -1);
                else if (localPos.z > 1 - epsilon) normal.set(0, 0, 1);

                return {
                    hit: true,
                    position: blockPos,
                    normal: normal,
                    blockType: block
                };
            }
        }

        return { hit: false };
    }
}
