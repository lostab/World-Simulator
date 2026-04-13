# 🌍 World Simulator

An immersive, procedurally generated 3D world built with **React**, **Three.js**, and **@react-three/fiber**. Explore a vast, seamless landscape where nature is generated on the fly.

## 🚀 Live Demo
Check out the simulation in action: [ws.shuxia.site](https://ws.shuxia.site)

## ✨ Features

- **Infinite Terrain**: A procedurally generated world that loads as you move, ensuring a seamless experience without loading screens.
- **Dynamic Vegetation**: High-fidelity trees, rocks, flowers, and grass are distributed across the landscape based on noise-driven biome logic.
- **Living Ecosystem**: Encounter randomly spawned animals like deer and crabs that bring the world to life.
- **Performance Optimized**: 
  - **Floating Origin**: Prevents GPU precision artifacts in large-scale worlds.
  - **Instanced Rendering**: Efficiently renders thousands of decorations with minimal overhead.
  - **LIFO Tile Loading**: Prioritizes the horizon to eliminate visual popping.
- **Smooth Movement**: Time-independent camera interpolation for a fluid, professional feel.

## 🛠️ For Developers

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei
- **Optimization**: Custom Slot-based World Virtualization, Floating Origin System

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lostab/World-Simulator.git
   cd World-Simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📜 License
This project is open-source. Feel free to explore, fork, and contribute!
