/**
 * Block type definitions and properties
 */

import * as THREE from './three.module.min.js';

export const BlockType = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    BEDROCK: 4,
    WOOD: 5,
    LEAVES: 6
};

export const BlockColors = {
    [BlockType.GRASS]: 0x5a8f3a,
    [BlockType.DIRT]: 0x8b6f47,
    [BlockType.STONE]: 0x808080,
    [BlockType.BEDROCK]: 0x3c3c3c,
    [BlockType.WOOD]: 0x8b6914,
    [BlockType.LEAVES]: 0x228b22
};

export const BlockNames = {
    [BlockType.AIR]: 'Air',
    [BlockType.GRASS]: 'Grass',
    [BlockType.DIRT]: 'Dirt',
    [BlockType.STONE]: 'Stone',
    [BlockType.BEDROCK]: 'Bedrock',
    [BlockType.WOOD]: 'Wood',
    [BlockType.LEAVES]: 'Leaves'
};

export class BlockManager {
    constructor() {
        this.materials = {};
        this.createMaterials();
    }

    createMaterials() {
        // Create materials for each block type
        for (let type in BlockColors) {
            this.materials[type] = new THREE.MeshLambertMaterial({
                color: BlockColors[type],
                flatShading: true
            });
        }
    }

    getMaterial(blockType) {
        return this.materials[blockType];
    }

    getBlockName(blockType) {
        return BlockNames[blockType] || 'Unknown';
    }

    isTransparent(blockType) {
        return blockType === BlockType.AIR || blockType === BlockType.LEAVES;
    }

    isSolid(blockType) {
        return blockType !== BlockType.AIR;
    }
}
