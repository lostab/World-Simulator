import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from './height';

export type AnimalType = 'crab' | 'deer';

export function Animal({ position, type = 'crab' }: { position: [number, number, number], type?: AnimalType }) {
  const meshRef = useRef<THREE.Group>(null);
  
  const legRefs = useRef<THREE.Group[]>([]);
  const walkCycle = useRef(0);

  const animalState = useRef({
    pos: new THREE.Vector3(...position),
    target: new THREE.Vector3(...position),
    timer: 0
  });

  const color = useMemo(() => {
    return type === 'crab' ? '#E64A19' : '#A1887F';
  }, [type]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    animalState.current.timer -= delta;
    if (animalState.current.timer <= 0) {
      animalState.current.target.set(
        animalState.current.pos.x + (Math.random() - 0.5) * 15,
        0,
        animalState.current.pos.z + (Math.random() - 0.5) * 15
      );
      animalState.current.timer = 3 + Math.random() * 4;
    }

    const dist = animalState.current.pos.distanceTo(animalState.current.target);
    const isMoving = dist > 0.5;

    if (isMoving) {
      const dir = new THREE.Vector3().subVectors(animalState.current.target, animalState.current.pos).normalize();
      animalState.current.pos.add(dir.multiplyScalar(delta * (type === 'crab' ? 0.8 : 1.5)));
      
      const targetRotation = new THREE.Quaternion();
      const m = new THREE.Matrix4();
      m.lookAt(animalState.current.pos, animalState.current.target, new THREE.Vector3(0, 1, 0));
      targetRotation.setFromRotationMatrix(m);
      meshRef.current.quaternion.slerp(targetRotation, delta * 3);

      walkCycle.current += delta * (type === 'crab' ? 6 : 4);
    } else {
      walkCycle.current = 0;
    }
    
    if (type === 'deer' && legRefs.current.length === 4) {
      const swing = Math.sin(walkCycle.current) * 0.5;
      legRefs.current[0].rotation.x = swing; 
      legRefs.current[3].rotation.x = swing; 
      legRefs.current[1].rotation.x = -swing;
      legRefs.current[2].rotation.x = -swing;
    }

    const targetHeight = getTerrainHeight(animalState.current.pos.x, animalState.current.pos.z);
    animalState.current.pos.y = THREE.MathUtils.lerp(animalState.current.pos.y, targetHeight, delta * 5);

    meshRef.current.position.copy(animalState.current.pos);
  });

  return (
    <group ref={meshRef}>
      {type === 'crab' ? (
        <group>
          <mesh castShadow position={[0, 0.1, 0]} scale={[1, 0.4, 1.3]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.1, 0.25, 0.2]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="black" /></mesh>
          <mesh position={[-0.1, 0.25, 0.2]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="black" /></mesh>
          <mesh position={[0.3, 0.1, 0.4]} rotation={[0, 0, -0.2]}><capsuleGeometry args={[0.08, 0.2, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[-0.3, 0.1, 0.4]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.08, 0.2, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
          {[[-0.2, 0.05, 0.2], [0.2, 0.05, 0.2], [-0.2, 0.05, -0.2], [0.2, 0.05, -0.2]].map((p, i) => (
            <mesh key={i} position={p as any}><boxGeometry args={[0.04, 0.1, 0.04]} /><meshStandardMaterial color={color} /></mesh>
          ))}
        </group>
      ) : (
        <group>
          {/* 身体 - 纯方块 */}
          <mesh castShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          
          {/* 颈部 - 移至负 Z (前方) */}
          <mesh castShadow position={[0, 0.8, -0.3]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
          
          {/* 头部 - 移至负 Z (前方) */}
          <mesh castShadow position={[0, 1.0, -0.45]}>
            <boxGeometry args={[0.2, 0.2, 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          
          {/* 鹿角 - 移至负 Z (前方) */}
          <group position={[0, 1.1, -0.4]}>
            <mesh position={[0.1, 0.1, 0]} castShadow>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
            <mesh position={[-0.1, 0.1, 0]} castShadow>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
          </group>

          {/* 腿部 - 保持相对位置 */}
          {/* 前左 */}
          <group ref={(el) => { if(el) legRefs.current[0] = el }} position={[-0.15, 0.3, 0.3]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
          {/* 前右 */}
          <group ref={(el) => { if(el) legRefs.current[1] = el }} position={[0.15, 0.3, 0.3]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
          {/* 后左 */}
          <group ref={(el) => { if(el) legRefs.current[2] = el }} position={[-0.15, 0.3, -0.3]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
          {/* 后右 */}
          <group ref={(el) => { if(el) legRefs.current[3] = el }} position={[0.15, 0.3, -0.3]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>

          {/* 尾巴 - 移至正 Z (后方) */}
          <mesh position={[0, 0.5, 0.45]} rotation={[Math.PI / 4, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}
