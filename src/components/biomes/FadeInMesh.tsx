import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FadeInMesh({ children }: { children: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  useFrame((_state, delta) => {
    if (opacityRef.current < 1) {
      opacityRef.current += delta * 0.8; // 1.25秒完成淡入
      if (opacityRef.current > 1) opacityRef.current = 1;
      
      // 递归遍历所有子对象并更新透明度
      groupRef.current?.traverse((obj) => {
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacityRef.current;
        }
      });
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
