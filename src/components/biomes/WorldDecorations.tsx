import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TILE_SIZE } from './types';
import { Tree } from '../Trees';
import { Animal } from './Animal';
import { positionStore } from './biomes/positionStore';

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const dummy = new THREE.Object3D();

export default function WorldDecorations({ tiles }: { tiles: Map<string, any> }) {
  const worldData = useRef({
    trees: { pos: [] as any[], scale: [] as number[] },
    flowers: { pos: [] as any[], color: [] as string[], scale: [] as number[] },
    grass: { pos: [] as any[] },
    rocks: { pos: [] as any[], scale: [] as number[] },
    animals: [] as any[],
  });

  const meshesRef = useRef({
    flowerMesh: null as THREE.InstancedMesh | null,
    grassMesh: null as THREE.InstancedMesh | null,
    rockMesh: null as THREE.InstancedMesh | null,
  });

  const lastUpdatePos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));

  useMemo(() => {
    const data = worldData.current;
    const entries = Array.from(tiles.entries());
    
    data.trees = { pos: [], scale: [] };
    data.flowers = { pos: [], color: [], scale: [] };
    data.grass = { pos: [] };
    data.rocks = { pos: [], scale: [] };
    data.animals = [];

    for (const [key, type] of entries) {
      const [tx, tz] = key.split(',').map(Number);
      const worldX = tx * TILE_SIZE;
      const worldZ = tz * TILE_SIZE;
      const seed = tx * 12.34 + tz * 56.78;

      const treeCount = type === 'forest' ? Math.floor(pseudoRandom(seed + 1) * 3) + 1 : 0;
      const flowerCount = type === 'meadow' || type === 'grassland' ? Math.floor(pseudoRandom(seed + 2) * 3) + 1 : 0;
      const grassCount = type === 'meadow' || type === 'grassland' ? Math.floor(pseudoRandom(seed + 3) * 3) + 1 : 0;
      const rockCount = (type === 'rocky' && pseudoRandom(seed + 12) < 0.66) ? 1 : 0;
      const animalCount = pseudoRandom(seed + 0.5) < 0.066 ? 1 : 0;
      
      for (let i = 0; i < treeCount; i++) {
        data.trees.pos.push([worldX + (pseudoRandom(seed + i * 1.1) - 0.5) * 15, 0, worldZ + (pseudoRandom(seed + i * 2.2) - 0.5) * 15]);
        data.trees.scale.push(0.8 + pseudoRandom(seed + i * 3.3) * 0.5);
      }
      for (let i = 0; i < flowerCount; i++) {
        data.flowers.pos.push([worldX + (pseudoRandom(seed + i * 4.4) - 0.5) * 15, 0, worldZ + (pseudoRandom(seed + i * 5.5) - 0.5) * 15]);
        const colors = ['#FFC0CB', '#FFFF00', '#FFFFFF', '#E6E6FA', '#FFB6C1'];
        data.flowers.color.push(colors[Math.floor(pseudoRandom(seed + i * 6.6) * colors.length)]);
        data.flowers.scale.push(1);
      }
      for (let i = 0; i < grassCount; i++) {
        data.grass.pos.push([worldX + (pseudoRandom(seed + i * 7.7) - 0.5) * 15, 0, worldZ + (pseudoRandom(seed + i * 8.8) - 0.5) * 15]);
      }
      for (let i = 0; i < rockCount; i++) {
        data.rocks.pos.push([worldX + (pseudoRandom(seed + i * 9.9) - 0.5) * 15, 0.2, worldZ + (pseudoRandom(seed + i * 10.1) - 0.5) * 15]);
        data.rocks.scale.push(0.5 + pseudoRandom(seed + i * 11.1) * 1.0);
      }
      if (animalCount > 0) {
        data.animals.push({
          pos: [worldX + (pseudoRandom(seed + 0.6) - 0.5) * 15, 0, worldZ + (pseudoRandom(seed + 0.7) - 0.5) * 15],
          type: pseudoRandom(seed + 0.8) > 0.5 ? 'crab' : 'deer'
        });
      }
    }

    meshesRef.current.flowerMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshStandardMaterial({ transparent: true }), data.flowers.pos.length);
    meshesRef.current.grassMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.01, 0.015, 0.3), new THREE.MeshStandardMaterial({ color: '#66BB6A' }), data.grass.pos.length);
    meshesRef.current.rockMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: '#757575' }), data.rocks.pos.length);

    return () => {
      Object.values(meshesRef.current).forEach(m => {
        if (m) { m.geometry.dispose(); m.material.dispose(); }
      });
    };
  }, [tiles]);

  useFrame(() => {
    const playerPos = positionStore.playerPos;
    const distSq = playerPos.distanceToSquared(lastUpdatePos.current);
    if (distSq < 0.4) return;
    lastUpdatePos.current.copy(playerPos);

    const data = worldData.current;
    const maxDist = 400;
    const minDist = 20;

    const updateInstanced = (mesh: THREE.InstancedMesh | null, positions: any[], scales: any[] = [], colors: any[] = []) => {
      if (!mesh) return;
      let visibleCount = 0;
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const dSq = (p[0] - playerPos.x) ** 2 + (p[2] - playerPos.z) ** 2;
        if (dSq <= maxDist * maxDist) {
          const opacity = Math.max(0, 1 - (dSq - minDist * minDist) / (maxDist * maxDist - minDist * minDist));
          dummy.position.set(p[0], p[1] || 0, p[2]);
          dummy.scale.set(scales[i] || 1, scales[i] || 1, scales[i] || 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(visibleCount, dummy.matrix);
          if (colors[i]) {
            mesh.setColorAt(visibleCount, new THREE.Color(colors[i]).multiplyScalar(opacity));
          }
          visibleCount++;
        }
      }
      mesh.count = visibleCount;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateInstanced(meshesRef.current.flowerMesh, data.flowers.pos, data.flowers.scale, data.flowers.color);
    updateInstanced(meshesRef.current.grassMesh, data.grass.pos);
    updateInstanced(meshesRef.current.rockMesh, data.rocks.pos, data.rocks.scale);
  });

  return (
    <group>
      {meshesRef.current.flowerMesh && <primitive object={meshesRef.current.flowerMesh} />}
      {meshesRef.current.grassMesh && <primitive object={meshesRef.current.grassMesh} />}
      {meshesRef.current.rockMesh && <primitive object={meshesRef.current.rockMesh} />}
      {worldData.current.trees.pos.map((pos, i) => (
        <group key={`t-${i}`} position={pos}>
          <Tree position={[0, 0, 0]} scale={worldData.current.trees.scale[i]} />
        </group>
      ))}
      {worldData.current.animals.map((ani, i) => (
        <group key={`a-${i}`} position={ani.pos} rotation={[0, 0, 0]}>
          <Animal position={[0, 0, 0]} type={ani.type} />
        </group>
      ))}
    </group>
  );
}
