import { memo } from 'react';
import { DistanceFadeGroup } from './biomes/DistanceFadeGroup';

const MountainRange = memo(function MountainRange({ position }: { position: [number, number, number] }) {
  return (
    <DistanceFadeGroup 
      position={position} 
      minDistance={100} 
      maxDistance={300}
    >
      <mesh position={[0, 20, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#8b7355" />
      </mesh>
    </DistanceFadeGroup>
  );
});

export default function Mountains() {
  const ranges = [
    [-200, 0, -200], [200, 0, -200], [-200, 0, 200], [200, 0, 200],
  ];
  
  return (
    <group>
      {ranges.map((pos, i) => (
        <MountainRange key={i} position={pos as [number, number, number]} />
      ))}
    </group>
  );
}
