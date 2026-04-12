import { useState, useRef, useCallback, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TILE_SIZE } from './types';
import type { BiomeType } from './types';
import { getBiomeAt } from './height';
import { getBiomeComponent } from './BiomeRegistry';
import TileDecorations from './TileDecorations';
import { positionStore } from './positionStore';

// 将初始加载半径大幅缩小,确保进入场景时瞬间完成
const STARTUP_DISTANCE = 5;
const RENDER_DISTANCE = 26;

const Tile = memo(function Tile({ tileKey, type }: { tileKey: string, type: BiomeType }) {
  if (!tileKey || typeof tileKey !== 'string') return null;
  const parts = tileKey.split(',');
  if (parts.length !== 2) return null;

  const tx = Number(parts[0]);
  const tz = Number(parts[1]);
  const worldPos: [number, number, number] = [tx * TILE_SIZE, 0, tz * TILE_SIZE];
  const SandComponent = getBiomeComponent('sand') || (() => null);

  return (
    <group position={worldPos}>
      <SandComponent type="sand" position={[0, 0, 0]} />
      <TileDecorations tileKey={tileKey} type={type} />
    </group>
  );
});

export default function WorldManager({ playerPosition }: { playerPosition: THREE.Vector3 | { current: THREE.Vector3 } }) {
  const [tiles, setTiles] = useState<Map<string, BiomeType>>(() => {
    const initial = new Map<string, BiomeType>();
    // 启动时仅加载极小范围,消除进入卡顿
    for (let x = -STARTUP_DISTANCE; x <= STARTUP_DISTANCE; x++) {
      for (let z = -STARTUP_DISTANCE; z <= STARTUP_DISTANCE; z++) {
        const key = `${x},${z}`;
        const type = getBiomeAt(x * TILE_SIZE, z * TILE_SIZE);
        initial.set(key, type);
      }
    }
    return initial;
  });

  const mountQueue = useRef<Array<{key: string, type: BiomeType}>>([]);
  const lastTilePos = useRef({ x: 0, z: 0 });
  const lastUpdateTime = useRef(0);

  const updateTiles = useCallback((centerX: number, centerZ: number) => {
    setTiles((prevTiles) => {
      const newTiles = new Map(prevTiles);
      const toAdd: Array<{key: string, type: BiomeType}> = [];

      for (let x = centerX - RENDER_DISTANCE; x <= centerX + RENDER_DISTANCE; x++) {
        for (let z = centerZ - RENDER_DISTANCE; z <= centerZ + RENDER_DISTANCE; z++) {
          const key = `${x},${z}`;
          if (!newTiles.has(key)) {
            const type = getBiomeAt(x * TILE_SIZE, z * TILE_SIZE);
            toAdd.push({key, type});
          }
        }
      }

      for (const key of newTiles.keys()) {
        const [tx, tz] = key.split(',').map(Number);
        if (Math.abs(tx - centerX) > RENDER_DISTANCE + 1 || Math.abs(tz - centerZ) > RENDER_DISTANCE + 1) {
          newTiles.delete(key);
        }
      }

      mountQueue.current = [...mountQueue.current, ...toAdd];
      return newTiles;
    });
  }, []);

  const resolvePosition = (p: any): THREE.Vector3 => {
    if (!p) return new THREE.Vector3(0, 0, 0);
    if (p instanceof THREE.Vector3) return p;
    if (p && p.current instanceof THREE.Vector3) return p.current;
    return new THREE.Vector3(0, 0, 0);
  };

  useFrame(() => {
    try {
      const pos = resolvePosition(playerPosition);
      positionStore.playerPos.copy(pos);

      // 动态批处理:如果队列积压严重,自动增加每帧加载数量
      const BATCH_SIZE = mountQueue.current.length > 100 ? 50 : 15;
      if (mountQueue.current.length > 0) {
        const batch = mountQueue.current.splice(0, BATCH_SIZE);
        setTiles(prev => {
          const nextMap = new Map(prev);
          batch.forEach(item => nextMap.set(item.key, item.type));
          return nextMap;
        });
      }

      const tileX = Math.floor(pos.x / TILE_SIZE);
      const tileZ = Math.floor(pos.z / TILE_SIZE);
      const now = Date.now();
      if (now - lastUpdateTime.current < 1000) return;

      if (Math.abs(tileX - lastTilePos.current.x) >= 2 || Math.abs(tileZ - lastTilePos.current.z) >= 2) {
        lastTilePos.current = { x: tileX, z: tileZ };
        lastUpdateTime.current = now;
        updateTiles(tileX, tileZ);
      }
    } catch (e) {
      console.error("WorldManager useFrame error:", e);
    }
  });

  return (
    <group name="world">
      {Array.from(tiles.entries()).map(([key, type]) => (
        <Tile key={key} tileKey={key} type={type} />
      ))}
    </group>
  );
}
