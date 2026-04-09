import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DistanceFadeGroupProps {
  children: React.ReactNode;
  playerPos: THREE.Vector3;
  position?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  fadeScale?: boolean;
}

export function DistanceFadeGroup({ 
  children, 
  playerPos, 
  position = [0,0,0],
  minDistance = 10, 
  maxDistance = 45,
  fadeScale = true 
}: DistanceFadeGroupProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
          }
        }
      });
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    const distance = groupRef.current.position.distanceTo(playerPos);

    let progress = 1;
    if (distance > minDistance) {
      progress = 1 - (distance - minDistance) / (maxDistance - minDistance);
    }
    progress = Math.max(0, Math.min(1, progress));

    // 核心修复：物理级隐藏
    // 当物体完全超出 maxDistance 时，直接将其从渲染管线中剔除，彻底消除视觉残留
    groupRef.current.visible = progress > 0;

    if (progress <= 0) return; // 如果不可见，无需执行后续的透明度和缩放计算

    // 1. 颜色渐进：线性从 0 到 1
    groupRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = progress;
        }
      }
    });

    // 2. 大小渐进
    if (fadeScale) {
      const minScale = 0.2;
      const currentScale = minScale + (1 - minScale) * progress;
      groupRef.current.scale.setScalar(currentScale);
    } else {
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}
