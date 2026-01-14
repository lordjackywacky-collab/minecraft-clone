# 3D Minecraft Alpha Clone

A fully functional browser-based 3D Minecraft alpha clone built with Three.js and vanilla JavaScript. Experience the core mechanics of early Minecraft alpha versions directly in your browser!

## Features

### 🎮 Core Gameplay
- **3D Voxel World**: Chunk-based terrain system with multiple block types
- **First-Person Controls**: WASD movement with mouse look (pointer lock)
- **Physics Simulation**: Realistic gravity and jump mechanics
- **Block Interaction**: Break and place blocks with raycast detection
- **Collision Detection**: Proper player-world collision physics

### 🌍 World Generation
- **World Size**: 16x16 chunks (256x256 blocks)
- **Chunk Size**: Standard Minecraft dimensions (16x16x64 blocks)
- **Terrain Layers**: Bedrock → Stone → Dirt → Grass
- **Procedural Trees**: Randomly generated wood and leaf structures
- **Simple Terrain**: Gently rolling hills with height variation

### 🎨 Visual Features
- **Three.js Rendering**: Hardware-accelerated 3D graphics
- **Performance Optimizations**: Face culling and frustum culling
- **Block Highlighting**: Visual outline on targeted blocks
- **Lighting**: Ambient and directional lighting for depth
- **Fog Effect**: Distance fog for atmosphere

### 📦 Block Types
- Grass (green top layer)
- Dirt (brown subsurface)
- Stone (gray rock layer)
- Bedrock (dark bottom layer)
- Wood (tree trunks)
- Leaves (tree foliage)

## How to Run

### Option 1: Open Directly in Browser
1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
3. Click anywhere to lock the pointer and start playing
4. That's it! No build process or server required.

### Option 2: Using a Local Server (Recommended)
While not required, using a local server can improve performance:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Controls

| Key/Action | Function |
|------------|----------|
| **WASD** | Move forward, left, backward, right |
| **Mouse** | Look around (camera rotation) |
| **Space** | Jump |
| **Left Click** | Break/destroy block |
| **Right Click** | Place block |
| **ESC** | Release mouse pointer |
| **1** | Select Dirt block |
| **2** | Select Stone block |
| **3** | Select Wood block |

## How to Play

1. **Getting Started**
   - Open the game and click anywhere to lock the pointer
   - You'll spawn in the middle of a procedurally generated world

2. **Movement**
   - Use WASD to move around
   - Move your mouse to look in different directions
   - Press Space to jump

3. **Breaking Blocks**
   - Aim at a block (you'll see a black outline)
   - Left click to break it
   - Broken blocks are removed from the world

4. **Placing Blocks**
   - Aim at a block face where you want to place
   - Right click to place the current block type
   - Switch blocks using number keys (1, 2, 3)

5. **Exploration**
   - The world is 256x256 blocks with hills and trees
   - You can modify the terrain freely
   - Build structures or dig underground!

## Technical Details

### File Structure
```
minecraft-clone/
├── index.html      # Main HTML page with canvas and UI
├── style.css       # Game interface styling
├── game.js         # Main game loop and initialization
├── world.js        # Chunk management and terrain generation
├── player.js       # Player controls, physics, and collision
├── blocks.js       # Block type definitions and materials
├── renderer.js     # Three.js rendering and camera setup
└── README.md       # This file
```

### Technologies Used
- **Three.js** (v0.160.0) - 3D graphics library
- **Vanilla JavaScript** (ES6+) - No frameworks required
- **HTML5 Canvas** - Rendering surface
- **Pointer Lock API** - Mouse capture for FPS controls

### Performance Optimizations
- **Face Culling**: Hidden block faces aren't rendered
- **Chunk System**: World divided into manageable 16x16x64 chunks
- **Merged Geometries**: Chunks use merged meshes for efficiency
- **BufferGeometry**: Efficient geometry representation
- **Frustum Culling**: Built-in Three.js optimization

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

Requires WebGL support and Pointer Lock API.

## Known Limitations

- World is finite (256x256 blocks)
- Simplified terrain generation (no caves, ores, or complex biomes)
- No multiplayer support
- No save/load functionality
- Limited block types (6 types)
- No mobs or enemies
- No crafting or inventory system
- No day/night cycle

## Future Enhancements

Potential features for future development:
- [ ] More block types and textures
- [ ] Inventory system with multiple slots
- [ ] Advanced terrain generation (caves, mountains, rivers)
- [ ] Day/night cycle with dynamic lighting
- [ ] Sound effects for actions
- [ ] Water and lava simulation
- [ ] World save/load using localStorage
- [ ] Touch controls for mobile devices
- [ ] Multiplayer using WebRTC or WebSockets

## Development

### Code Organization

**blocks.js**: Defines block types, colors, and material properties
- `BlockType` enum for all block types
- `BlockManager` class for material management

**renderer.js**: Handles all Three.js rendering
- Camera setup and management
- Scene lighting and fog
- Block highlighting system

**world.js**: World generation and chunk management
- `Chunk` class for individual chunks
- `World` class for overall world management
- Terrain generation algorithms
- Voxel raycasting for block selection

**player.js**: Player controller
- First-person camera movement
- Physics simulation (gravity, jumping)
- Collision detection
- Block interaction (break/place)
- Input handling

**game.js**: Main game coordinator
- Game loop (update/render cycle)
- System initialization
- UI updates
- FPS counter

## License

This project is open source and available for educational purposes.

## Credits

Created as a browser-based implementation of Minecraft alpha mechanics using Three.js.

Inspired by the original Minecraft by Mojang Studios.

## Support

For issues or questions:
1. Check browser console for error messages
2. Ensure you're using a modern browser with WebGL support
3. Try refreshing the page if performance degrades
4. Check that JavaScript is enabled

---

**Enjoy building and exploring your voxel world! 🎮⛏️🌍**