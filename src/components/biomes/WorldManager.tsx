import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TILE_SIZE, RENDER_DISTANCE } from './types';
import type { BiomeType } from './types';
import { getBiomeAt } from './height';
import { getBiomeComponent } from './BiomeRegistry';
import WorldDecorations from './WorldDecorations';

export default function WorldManager({ playerPosition }: { playerPosition: THREE.Vector3 | { current: THREE.Vector3 } }) {
  const [tiles, setTiles] = useState<Map<string, BiomeType>>(() => {
    const initial = new Map<string, BiomeType>();
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        initial.set(`${x},${z}`, getBiomeAt(x * TILE_SIZE, z * TILE_SIZE));
      }
    }
    return initial;
  });

  const lastTilePos = useRef({ x: 0, z: 0 });
  const lastUpdateTime = useRef(0);

  const updateTiles = useCallback((centerX: number, centerZ: number) => {
    setTiles((prevTiles) => {
      const newTiles = new Map(prevTiles);
      let hasChanges = false;
      
      for (let x = centerX - RENDER_DISTANCE; x <= centerX + RENDER_DISTANCE; x++) {
        for (let z = centerZ - RENDER_DISTANCE; z <= centerZ + RENDER_DISTANCE; z++) {
          const key = `${x},${z}`;
          if (!newTiles.has(key)) {
            newTiles.set(key, getBiomeAt(x * TILE_SIZE, z * TILE_SIZE));
            hasChanges = true;
          }
        }
      }

      if (!hasChanges) return prevTiles;

      for (const key of newTiles.keys()) {
        const [tx, tz] = key.split(',').map(Number);
        if (Math.abs(tx - centerX) > RENDER_DISTANCE + 1 || Math.abs(tz - centerZ) > RENDER_DISTANCE + 1) {
          newTiles.delete(key);
        }
      }

      return newTiles;
    });
  }, []);

  useFrame(() => {
    const pos = (playerPosition as any).current || playerPosition;
    const tileX = Math.floor(pos.x / TILE_SIZE);
    const tileZ = Math.floor(pos.z / TILE_SIZE);

    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) return;
    
    if (Math.abs(tileX - lastTilePos.current.x) >= 2 || Math.abs(tileZ - lastTilePos.current.z) >= 2) {
      lastTilePos.current = { x: tileX, z: tileZ };
      lastUpdateTime.current = now;
      updateTiles(tileX, tileZ);
    }
  });

  const pos = (playerPosition as any).current || playerPosition;

  return (
    <group name="world">
      <group name="terrain">
        {Array.from(tiles.entries()).map(([key, type]) => {
          const [x, z] = key.split(',').map(Number);
          const BiomeComponent = getBiomeComponent(type);
          return (
            <BiomeComponent 
              key={key} 
              position={[x * TILE_SIZE, 0, z * TILE_SIZE]} 
              type={type}
            />
          );
        })}
      </group>
      <WorldDecorations playerPos={pos} tiles={tiles} />
    </group>
  );
}
