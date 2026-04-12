import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { positionStore } from './positionStore';

const MAX_DIST = 600;
const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

export default function GlobalDecorationManager() {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const treeParts = useMemo(() => [
    { name: 'trunk', color: '#5d4037', geo: [0.2, 0.3, 2], offset: [0, 1, 0] },
    { name: 'leaf1', color: '#2e7d32', geo: [0.8, 8, 8], offset: [0, 2.2, 0] },
    { name: 'leaf2', color: '#388e3c', geo: [0.6, 8, 8], offset: [0, 2.8, 0] },
    { name: 'leaf3', color: '#43a047', geo: [0.5, 8, 8], offset: [0, 3.2, 0] },
    { name: 'leaf4', color: '#4caf50', geo: [0.4, 8, 8], offset: [0, 3.5, 0] },
  ], []);

  // 创建 Ref 数组来管理各个部分的 Mesh
  const meshRefs = useRef<any[]>([]);

  useFrame(() => {
    const absPlayerPos = positionStore.getAbsolutePlayerPos();
    
    treeParts.forEach((part, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      let visibleCount = 0;
      for (let i = 0; i < 1000; i++) {
        const absX = Math.sin(i * 123.456) * 2000;
        const absZ = Math.cos(i * 654.321) * 2000;
        
        const dx = absX - absPlayerPos.x;
        const dz = absZ - absPlayerPos.z;
        if (dx * dx + dz * dz < MAX_DIST_SQ) {
          const localX = absX - positionStore.worldOffset.x;
          const localZ = absZ - positionStore.worldOffset.z;
          
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
          ref={el => { if(el) meshRefs.current[i] = el }} 
          args={[
            part.name === 'trunk' ? new THREE.CylinderGeometry(...part.geo as any) : new THREE.SphereGeometry(...part.geo as any),
            new THREE.MeshStandardMaterial({ color: part.color }),
            1000
          ]}
          frustumCulling={false}
        />
      ))}
    </group>
  );
}
