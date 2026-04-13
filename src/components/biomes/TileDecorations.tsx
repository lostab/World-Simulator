import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TILE_SIZE } from './types';
import type { BiomeType } from './types';

import { Animal } from './Animal';
import { positionStore } from './positionStore';

interface DecorationItem {
  pos: [number, number, number];
  worldPos: THREE.Vector3;
  type: 'tree' | 'rock' | 'animal' | 'terrain' | 'flower' | 'grass';
  animalType?: 'crab' | 'deer';
  terrainType?: 'circle-blue' | 'square-green';
  scale: number;
  rotation: number;
}

const TREE_PARTS = [
  { name: 'trunk', geo: new THREE.CylinderGeometry(0.12, 0.22, 2.5, 12), mat: new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.88 }), yOffset: 1.25 },
  { name: 'crown1', geo: new THREE.ConeGeometry(1.3, 2.2, 12), mat: new THREE.MeshStandardMaterial({ color: '#3E8E41', transparent: true, opacity: 0.9 }), yOffset: 2.3 },
  { name: 'crown2', geo: new THREE.ConeGeometry(1.0, 1.8, 12), mat: new THREE.MeshStandardMaterial({ color: '#4CAF50', transparent: true, opacity: 0.9 }), yOffset: 3.3 },
  { name: 'crown3', geo: new THREE.ConeGeometry(0.7, 1.4, 12), mat: new THREE.MeshStandardMaterial({ color: '#66BB6A', transparent: true, opacity: 0.9 }), yOffset: 4.2 },
  { name: 'crown4', geo: new THREE.ConeGeometry(0.4, 0.8, 12), mat: new THREE.MeshStandardMaterial({ color: '#81C784', transparent: true, opacity: 0.9 }), yOffset: 5.0 },
];

const ROCK_CONFIG = {
  geo: new THREE.DodecahedronGeometry(0.3, 0),
  mat: new THREE.MeshStandardMaterial({ color: '#757575', roughness: 0.9 })
};

const dummy = new THREE.Object3D();

function pseudoRandom(seed: string, offset: number = 0): number {
  let hash = 0;
  const s = seed + offset;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

export default function TileDecorations({ tileKey, type }: { tileKey: string, type: BiomeType }) {
  if (!tileKey) return null;

  const [tx, tz] = tileKey.split(',').map(Number);
  const tileWorldX = tx * TILE_SIZE;
  const tileWorldZ = tz * TILE_SIZE;

  const isGrassland = type === 'grassland' || type === 'meadow';
  const treeCount = (isGrassland && pseudoRandom(tileKey, 999) < 0.2) ? 1 : 0;
  const rockCount = (type === 'rocky' && pseudoRandom(tileKey, 1000) < 0.05) ? 1 : 0;

  const treeItems = useMemo(() => {
    const items: { pos: [number, number, number]; rotation: number; scale: number }[] = [];
    for (let i = 0; i < treeCount; i++) {
      items.push({
        pos: [(pseudoRandom(tileKey, i) - 0.5) * 14, 0, (pseudoRandom(tileKey, i + 100) - 0.5) * 14],
        rotation: pseudoRandom(tileKey, i + 300) * Math.PI * 2,
        scale: 0.7 + pseudoRandom(tileKey, i + 200) * 0.6,
      });
    }
    return items;
  }, [tileKey, type, treeCount]);

  const decorations = useMemo(() => {
    const items: DecorationItem[] = [];
    for (let i = 0; i < rockCount; i++) {
      const rx = (pseudoRandom(tileKey, i + 10) - 0.5) * 14;
      const rz = (pseudoRandom(tileKey, i + 110) - 0.5) * 14;
      items.push({
        pos: [rx, 0.2, rz],
        worldPos: new THREE.Vector3(tileWorldX + rx, 0.2, tileWorldZ + rz),
        type: 'rock',
        scale: 0.5 + pseudoRandom(tileKey, i + 120) * 0.8,
        rotation: pseudoRandom(tileKey, i + 130) * Math.PI * 2,
      });
    }
    
    // 1. 花 (Flower)
    if (pseudoRandom(tileKey, 300) < 0.1) {
      const fx = (pseudoRandom(tileKey, 310) - 0.5) * 14;
      const fz = (pseudoRandom(tileKey, 320) - 0.5) * 14;
      items.push({
        pos: [fx, 0.05, fz],
        worldPos: new THREE.Vector3(tileWorldX + fx, 0.05, tileWorldZ + fz),
        type: 'flower',
        scale: 0.3 + pseudoRandom(tileKey, 330) * 0.4,
        rotation: pseudoRandom(tileKey, 340) * Math.PI * 2,
      });
    }

    // 2. 草 (Grass)
    if (pseudoRandom(tileKey, 400) < 0.1) {
      const gx = (pseudoRandom(tileKey, 410) - 0.5) * 14;
      const gz = (pseudoRandom(tileKey, 420) - 0.5) * 14;
      items.push({
        pos: [gx, 0.05, gz],
        worldPos: new THREE.Vector3(tileWorldX + gx, 0.05, tileWorldZ + gz),
        type: 'grass',
        scale: 0.5 + pseudoRandom(tileKey, 430) * 0.5,
        rotation: pseudoRandom(tileKey, 440) * Math.PI * 2,
      });
    }
    
    // 地形装饰物
    if (pseudoRandom(tileKey, 200) < 0.3) {
      const tx = (pseudoRandom(tileKey, 210) - 0.5) * 10;
      const tz = (pseudoRandom(tileKey, 220) - 0.5) * 10;
      const tType = pseudoRandom(tileKey, 230) > 0.5 ? 'circle-blue' : 'square-green';
      items.push({
        pos: [tx, 0.01, tz],
        worldPos: new THREE.Vector3(tileWorldX + tx, 0.01, tileWorldZ + tz),
        type: 'terrain',
        terrainType: tType,
        scale: 2 + pseudoRandom(tileKey, 240) * 4,
        rotation: pseudoRandom(tileKey, 250) * Math.PI * 2,
      });
    }

    if (pseudoRandom(tileKey, 50) < 0.1) {
      const rx = (pseudoRandom(tileKey, 60) - 0.5) * 14;
      const rz = (pseudoRandom(tileKey, 70) - 0.5) * 14;
      const aType = pseudoRandom(tileKey, 80) > 0.5 ? 'deer' : 'crab';
      items.push({
        pos: [rx, 0, rz],
        worldPos: new THREE.Vector3(tileWorldX + rx, 0, tileWorldZ + rz),
        type: 'animal',
        animalType: aType,
        scale: 1,
        rotation: pseudoRandom(tileKey, 90) * Math.PI * 2,
      });
    }
    return items;
  }, [tileKey, type, tileWorldX, tileWorldZ, rockCount]);

  const treeDataRef = useRef<{ positions: Float32Array, rotations: Float32Array, scales: Float32Array, distances: number[] } | null>(null);
  const rockDataRef = useRef<{ positions: Float32Array, rotations: Float32Array, scales: Float32Array, distances: number[] } | null>(null);
  const treeMeshesRef = useRef<THREE.InstancedMesh[]>([]);
  const rockMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const lastUpdatePos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));
  const UPDATE_THRESHOLD = 0.2;

  useMemo(() => {
    if (treeMeshesRef.current.length === 0) {
      treeMeshesRef.current = TREE_PARTS.map(part => {
        const mesh = new THREE.InstancedMesh(part.geo, part.mat, treeItems.length);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      });
    }
    const rMesh = new THREE.InstancedMesh(ROCK_CONFIG.geo, ROCK_CONFIG.mat, rockCount);
    rMesh.castShadow = true;
    rMesh.receiveShadow = true;
    rockMeshRef.current = rMesh;

    return () => {
      treeMeshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose()); else mesh.material.dispose();
      });
      rMesh.geometry.dispose();
      rMesh.material.dispose();
    };
  }, [treeItems.length, rockCount]);

  useFrame(() => {
    if (!treeDataRef.current || treeMeshesRef.current.length === 0) return;
    const playerPos = positionStore.playerPos;
    const distSq = playerPos.distanceToSquared(lastUpdatePos.current);
    if (distSq < UPDATE_THRESHOLD * UPDATE_THRESHOLD) return;
    lastUpdatePos.current.copy(playerPos);

    const maxDistance = 800;
    const minDistance = 50;

    let visibleTreeCount = 0;
    const tData = treeDataRef.current;
    for (let i = 0; i < treeItems.length; i++) {
      // 修正：使用 (地块坐标 + 相对坐标) 计算正确的世界距离
      const worldX = tileWorldX + tData.positions[i * 3];
      const worldZ = tileWorldZ + tData.positions[i * 3 + 2];
      const dx = worldX - playerPos.x;
      const dz = worldZ - playerPos.z;
      const dSq = dx * dx + dz * dz;

      if (dSq <= maxDistance * maxDistance) {
        const opacity = Math.max(0, 1 - (dSq - minDistance * minDistance) / (maxDistance * maxDistance - minDistance * minDistance));
        const scale = tData.scales[i] * opacity;
        dummy.scale.set(scale, scale, scale);
        dummy.rotation.y = tData.rotations[i];
        TREE_PARTS.forEach((part, partIdx) => {
          // 修正：这里直接设为相对坐标，由父级 group 变换到世界位置
          dummy.position.set(tData.positions[i * 3], part.yOffset, tData.positions[i * 3 + 2]);
          dummy.updateMatrix();
          treeMeshesRef.current[partIdx].setMatrixAt(visibleTreeCount, dummy.matrix);
          treeMeshesRef.current[partIdx].setColorAt(visibleTreeCount, new THREE.Color(part.mat.color).multiplyScalar(opacity));
        });
        visibleTreeCount++;
      }
    }
    treeMeshesRef.current.forEach(mesh => {
      mesh.count = visibleTreeCount;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    if (rockMeshRef.current && rockDataRef.current) {
      let visibleRockCount = 0;
      const rData = rockDataRef.current;
      for (let i = 0; i < rockCount; i++) {
        // 修正：使用 (地块坐标 + 相对坐标) 计算正确的世界距离
        const worldX = tileWorldX + rData.positions[i * 3];
        const worldZ = tileWorldZ + rData.positions[i * 3 + 2];
        const dx = worldX - playerPos.x;
        const dz = worldZ - playerPos.z;
        const dSq = dx * dx + dz * dz;

        if (dSq <= maxDistance * maxDistance) {
          const opacity = Math.max(0, 1 - (dSq - minDistance * minDistance) / (maxDistance * maxDistance - minDistance * minDistance));
          const scale = rData.scales[i] * opacity;
          dummy.scale.set(scale, scale, scale);
          dummy.rotation.y = rData.rotations[i];
          // 修正：使用相对坐标
          dummy.position.set(rData.positions[i * 3], rData.positions[i * 3 + 1], rData.positions[i * 3 + 2]);
          dummy.updateMatrix();
          rockMeshRef.current.setMatrixAt(visibleRockCount, dummy.matrix);
          rockMeshRef.current.setColorAt(visibleRockCount, new THREE.Color(ROCK_CONFIG.mat.color).multiplyScalar(opacity));
          visibleRockCount++;
        }
      }
      rockMeshRef.current.count = visibleRockCount;
      rockMeshRef.current.instanceMatrix.needsUpdate = true;
      if (rockMeshRef.current.instanceColor) rockMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  useMemo(() => {
    if (!treeDataRef.current || treeDataRef.current.positions.length !== treeItems.length * 3) {
      treeDataRef.current = {
        positions: new Float32Array(treeItems.length * 3),
        rotations: new Float32Array(treeItems.length),
        scales: new Float32Array(treeItems.length),
        distances: new Array(treeItems.length).fill(0),
      };
    }
    const tData = treeDataRef.current;
    for (let i = 0; i < treeItems.length; i++) {
      // 修正：仅存储相对坐标 (offset)
      tData.positions[i * 3] = treeItems[i].pos[0];
      tData.positions[i * 3 + 1] = 0;
      tData.positions[i * 3 + 2] = treeItems[i].pos[2];
      tData.rotations[i] = treeItems[i].rotation;
      tData.scales[i] = treeItems[i].scale;
    }

    if (!rockDataRef.current || rockDataRef.current.positions.length !== rockCount * 3) {
      rockDataRef.current = {
        positions: new Float32Array(rockCount * 3),
        rotations: new Float32Array(rockCount),
        scales: new Float32Array(rockCount),
        distances: new Array(rockCount).fill(0),
      };
    }
    const rData = rockDataRef.current;
    let rIdx = 0;
    decorations.forEach(item => {
      if (item.type === 'rock') {
        // 修正：仅存储相对坐标 (offset)
        rData.positions[rIdx * 3] = item.pos[0];
        rData.positions[rIdx * 3 + 1] = item.pos[1];
        rData.positions[rIdx * 3 + 2] = item.pos[2];
        rData.rotations[rIdx] = item.rotation;
        rData.scales[rIdx] = item.scale;
        rIdx++;
      }
    });
  }, [tileKey, type, tileWorldX, tileWorldZ, treeItems, rockCount, decorations]);

  return (
    <group>
      {treeMeshesRef.current.length > 0 && treeDataRef.current && (
        <>
          {treeMeshesRef.current.map((mesh, idx) => (
            <primitive key={`tree-part-${idx}`} object={mesh} />
          ))}
        </>
      )}
      {rockMeshRef.current && (
        <primitive object={rockMeshRef.current} />
      )}
      <group>
        {decorations.map((item, idx) => {
          if (item.type === 'animal') {
            return (
              <group 
                key={`${tileKey}-animal-${idx}`} 
                position={item.pos} 
                rotation={[0, item.rotation, 0]} 
                scale={item.scale}
              >
                <Animal position={[0, 0, 0]} type={item.animalType || 'deer'} />
              </group>
            );
          }
          if (item.type === 'terrain') {
            return (
              <mesh 
                key={`${tileKey}-terrain-${idx}`} 
                position={item.pos} 
                rotation={[-Math.PI / 2, 0, item.rotation]} 
                scale={[item.scale, item.scale, 1]}
              >
                {item.terrainType === 'circle-blue' ? (
                  <circleGeometry args={[1, 32]} />
                ) : (
                  <planeGeometry args={[1, 1]} />
                )}
                <meshStandardMaterial 
                  color={item.terrainType === 'circle-blue' ? '#0288d1' : '#4CAF50'} 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
            );
          }
          if (item.type === 'flower') {
            return (
              <group key={`${tileKey}-flower-${idx}`} position={item.pos} rotation={[0, item.rotation, 0]} scale={item.scale}>
                <mesh position={[0, 0.2, 0]} castShadow>
                  <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                  <meshStandardMaterial color="green" />
                </mesh>
                <mesh position={[0, 0.4, 0]} castShadow>
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshStandardMaterial color="red" />
                </mesh>
              </group>
            );
          }
          if (item.type === 'grass') {
            return (
              <mesh key={`${tileKey}-grass-${idx}`} position={item.pos} rotation={[0, item.rotation, 0]} scale={item.scale}>
                <coneGeometry args={[0.03, 0.6, 4]} />
                <meshStandardMaterial color="#4CAF50" />
              </mesh>
            );
          }
          return null;
        })}
      </group>
    </group>
  );
}
