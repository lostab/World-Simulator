import { DistanceFadeGroup } from './DistanceFadeGroup';

export function AnimalManager() {
  return (
    <group>
      <DistanceFadeGroup 
        position={[10, 0, 10]} 
        minDistance={0} 
        maxDistance={150}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="brown" />
        </mesh>
      </DistanceFadeGroup>
    </group>
  );
}
