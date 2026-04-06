import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BaseBiomeTileProps {
  position: [number, number, number];
  color: string;
  roughness?: number;
  shape?: 'square' | 'circle' | 'ellipse';
  fadeIn?: boolean;
}

const squareGeometry = new THREE.PlaneGeometry(10, 10);
const circleGeometry = new THREE.CircleGeometry(6, 32);

export const BaseBiomeTile = memo(function BaseBiomeTile({ 
  position, 
  color, 
  roughness = 0.85,
  shape = 'square',
  fadeIn = false
}: BaseBiomeTileProps) {
  const geometry = shape === 'square' ? squareGeometry : circleGeometry;
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // 渐显动画
  useFrame((_state, delta) => {
    if (fadeIn && materialRef.current && materialRef.current.opacity < 1) {
      materialRef.current.opacity = Math.min(1, materialRef.current.opacity + delta * 1.5);
    }
  });
  
  const initialOpacity = fadeIn ? 0 : 1;
  
  return (
    <mesh 
      ref={materialRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position} 
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        transparent 
        opacity={initialOpacity}
      />
    </mesh>
  );
});