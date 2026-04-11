import React, { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { positionStore } from './positionStore';

interface DistanceFadeGroupProps {
  children: React.ReactNode;
  position?: [number, number, number];
  staticWorldPos?: THREE.Vector3;
  minDistance?: number;
  maxDistance?: number;
}

export function DistanceFadeGroup({
  children,
  position = [0,0,0],
  staticWorldPos,
  minDistance = 30,
  maxDistance = 150,
}: DistanceFadeGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const worldPos = useRef(new THREE.Vector3());
  const cachedMaterials = useRef<THREE.Material[]>([]);
  const frameCount = useRef(0);
  const currentOpacity = useRef(0);

  // 核心修复：使用 useLayoutEffect 同步计算初始透明度
  // 这样在浏览器绘制之前，组件就已经处于正确的透明度，不会出现闪现
  useLayoutEffect(() => {
    if (groupRef.current) {
      const mats: THREE.Material[] = [];
      groupRef.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => { (m as any).transparent = true; mats.push(m); });
            } else {
              (mesh.material as any).transparent = true;
              mats.push(mesh.material);
            }
          }
        }
      });
      cachedMaterials.current = mats;

      // 计算初始透明度
      const initialPos = staticWorldPos || new THREE.Vector3(...position);
      const distance = initialPos.distanceTo(positionStore.playerPos);
      let initialOpacity = 1 - (distance - minDistance) / (maxDistance - minDistance);
      initialOpacity = Math.max(0, Math.min(1, initialOpacity));
      currentOpacity.current = initialOpacity;

      // 立即显示组件
      if (groupRef.current) {
        groupRef.current.visible = true;
      }
    }
  }, [position, staticWorldPos, minDistance, maxDistance]);

  useFrame(() => {
    if (!groupRef.current || cachedMaterials.current.length === 0) return;

    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    try {
      const playerPos = positionStore.playerPos;
      if (staticWorldPos) {
        worldPos.current.copy(staticWorldPos);
      } else {
        groupRef.current.getWorldPosition(worldPos.current);
      }

      const distance = worldPos.current.distanceTo(playerPos);
      let targetOpacity = 1 - (distance - minDistance) / (maxDistance - minDistance);
      targetOpacity = Math.max(0, Math.min(1, targetOpacity));

      const lerpFactor = 0.05;
      currentOpacity.current += (targetOpacity - currentOpacity.current) * lerpFactor;

      if (currentOpacity.current > 0.01) {
        groupRef.current.visible = true;
        const materials = cachedMaterials.current;
        for (let i = 0; i < materials.length; i++) {
          (materials[i] as any).opacity = currentOpacity.current;
        }
      } else {
        groupRef.current.visible = false;
      }
    } catch (e) {}
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}
