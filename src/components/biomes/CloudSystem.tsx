import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CloudMesh() {
  const groupRef = useRef<THREE.Group>(null);
  
  const cloudParts = useMemo(() => {
    const parts = [];
    const numSpheres = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numSpheres; i++) {
      parts.push({
        pos: [
          (Math.random() - 0.5) * 2, 
          (Math.random() - 0.5) * 1, 
          (Math.random() - 0.5) * 2
        ] as [number, number, number],
        scale: 0.5 + Math.random() * 1.5,
      });
    }
    return parts;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x -= delta * 0.1;
      if (groupRef.current.position.x < -2) groupRef.current.position.x = 2;
    }
  });

  return (
    <group ref={groupRef}>
      {cloudParts.map((p, i) => (
        <mesh key={i} position={p.pos} scale={[p.scale, p.scale * 0.6, p.scale]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="white" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function RelativeCloud({ playerPos, offset }: { playerPos: THREE.Vector3, offset: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        playerPos.x + offset[0],
        offset[1],
        playerPos.z + offset[2]
      );
    }
  });

  return (
    <group ref={groupRef}>
      <CloudMesh />
    </group>
  );
}

export default function CloudSystem({ playerPos }: { playerPos: THREE.Vector3 }) {
  const cloudConfigs = useMemo(() => {
    const configs: { offset: [number, number, number] }[] = [];
    
    // 优化可见区：绝对正前方 (X: -5~5, Z: -30~-70)
    for (let i = 0; i < 10; i++) {
      configs.push({
        offset: [
          (Math.random() - 0.5) * 10,        // X: -5 ~ 5 (极窄范围，确保在中心)
          15 + Math.random() * 10,          // Y: 15 ~ 25
          -30 - Math.random() * 40          // Z: -30 ~ -70
        ]
      });
    }

    for (let i = 0; i < 10; i++) {
      configs.push({
        offset: [
          (Math.random() - 0.5) * 200,
          15 + Math.random() * 10,
          (Math.random() - 0.5) * 200,
        ]
      });
    }
    return configs;
  }, []);

  return (
    <group>
      {cloudConfigs.map((config, i) => (
        <RelativeCloud 
          key={`rel-cloud-${i}`} 
          playerPos={playerPos} 
          offset={config.offset} 
        />
      ))}
    </group>
  );
}
