import { memo } from 'react';
import * as THREE from 'three';

interface BaseBiomeTileProps {
  position: [number, number, number];
  color: string;
  roughness?: number;
  shape?: 'square' | 'circle' | 'ellipse';
}

const squareGeometry = new THREE.PlaneGeometry(10, 10);
const circleGeometry = new THREE.CircleGeometry(6, 32);

export const BaseBiomeTile = memo(function BaseBiomeTile({ 
  position, 
  color, 
  shape = 'square',
}: BaseBiomeTileProps) {
  const geometry = shape === 'square' ? squareGeometry : circleGeometry;
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position} 
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      {/* 使用 MeshLambertMaterial：无镜面反射，极度稳定，完美配合 Fog */}
      <meshLambertMaterial 
        color={color} 
        transparent={false} 
        opacity={1}
      />
    </mesh>
  );
});