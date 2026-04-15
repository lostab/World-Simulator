import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { positionStore } from './positionStore';

const MAX_DIST = 600;
const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
const TREE_COUNT = 1000;

export default function GlobalDecorationManager() {
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 预计算树木位置（避免每帧计算 sin/cos）
  const treePositions = useMemo(() => {
    const positions: { x: number; z: number }[] = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      positions.push({
        x: Math.sin(i * 123.456) * 2000,
        z: Math.cos(i * 654.321) * 2000
      });
    }
    return positions;
  }, []);

  const treeParts = useMemo(() => [
    { name: 'trunk', color: '#5d4037', geo: [0.2, 0.3, 2] as const, offset: [0, 1, 0] },
    { name: 'leaf1', color: '#2e7d32', geo: [0.8, 8, 8] as const, offset: [0, 2.2, 0] },
    { name: 'leaf2', color: '#388e3c', geo: [0.6, 8, 8] as const, offset: [0, 2.8, 0] },
    { name: 'leaf3', color: '#43a047', geo: [0.5, 8, 8] as const, offset: [0, 3.2, 0] },
    { name: 'leaf4', color: '#4caf50', geo: [0.4, 8, 8] as const, offset: [0, 3.5, 0] },
  ], []);

  // 🔧 关键修复1：几何体和材质只创建一次
  const geometries = useMemo(() => {
    return treeParts.map(part =>
      part.name === 'trunk'
        ? new THREE.CylinderGeometry(...part.geo)
        : new THREE.SphereGeometry(...part.geo)
    );
  }, [treeParts]);

  const materials = useMemo(() => {
    return treeParts.map(part => new THREE.MeshStandardMaterial({ color: part.color }));
  }, [treeParts]);

  const meshRefs = useRef<THREE.InstancedMesh[]>([]);
  const frameSkip = useRef(0);

  // 🔧 关键修复2：组件卸载时彻底释放 GPU 资源
  useEffect(() => {
    return () => {
      meshRefs.current.forEach(mesh => {
        if (mesh) {
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
    };
  }, [geometries, materials]);

  useFrame(() => {
    // 每 3 帧执行一次（20 FPS 更新，完全足够，CPU 负载再降 33%）
    frameSkip.current = (frameSkip.current + 1) % 3;
    if (frameSkip.current !== 0) return;

    const absPlayerPos = positionStore.getAbsolutePlayerPos();
    const worldOffsetX = positionStore.worldOffset.x;
    const worldOffsetZ = positionStore.worldOffset.z;

    treeParts.forEach((part, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      let visibleCount = 0;
      for (let i = 0; i < TREE_COUNT; i++) {
        const tree = treePositions[i];
        const dx = tree.x - absPlayerPos.x;
        const dz = tree.z - absPlayerPos.z;

        if (dx * dx + dz * dz < MAX_DIST_SQ) {
          const localX = tree.x - worldOffsetX;
          const localZ = tree.z - worldOffsetZ;

          dummy.position.set(localX + part.offset[0], part.offset[1], localZ + part.offset[2]);
          dummy.updateMatrix();
          mesh.setMatrixAt(visibleCount++, dummy.matrix);
        }
      }
      mesh.count = visibleCount;
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      {treeParts.map((part, i) => (
        <instancedMesh
          key={part.name}
          ref={el => { if (el) meshRefs.current[i] = el; }}
          args={[geometries[i], materials[i], TREE_COUNT]}
          frustumCulled={true} // 启用视锥剔除
        />
      ))}
    </group>
  );
}