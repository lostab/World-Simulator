import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky as DreiSky } from '@react-three/drei'
import * as THREE from 'three'
import Mountains from './Mountains'
import WorldManager from './biomes/WorldManager'
import Player from './Player'

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[4, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
      </mesh>
      <mesh position={[3, 0.5, 0]}>
        <sphereGeometry args={[2.5, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-2.5, 0.3, 0.5]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function SkyClouds({ playerRef }: { playerRef: React.RefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef({ x: 0, z: 20 });
  
  useFrame(() => {
    if (playerRef.current && groupRef.current) {
      targetPos.current.x += (playerRef.current.x - targetPos.current.x) * 0.05;
      targetPos.current.z += (playerRef.current.z - targetPos.current.z) * 0.05;
      groupRef.current.position.set(targetPos.current.x, 0, targetPos.current.z);
    }
  });
  
  return (
    <group ref={groupRef}>
      <Cloud position={[0, 20, 50]} />
      <Cloud position={[15, 25, 70]} />
    </group>
  );
}

function CustomSky() {
  return (
    <DreiSky 
      distance={450000}
      sunPosition={[100, 20, 100]}
      inclination={0.6}
      azimuth={0.25}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      rayleigh={0.5}
    />
  )
}

export default function Scene() {
  const playerPos = useRef(new THREE.Vector3(0, 0, 20));

  return (
    <>
      <Canvas 
        shadows 
        camera={{ position: [0, 3, 25], fov: 60 }}
      >
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#b8d4e8', 5, 35]} />
        
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[50, 80, 25]} 
          intensity={1.5} 
          castShadow 
          color="#fff8e7"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0001}
        />
        
        <hemisphereLight color="#87CEEB" groundColor="#5C8A3D" intensity={0.6} />

        <CustomSky />
        <SkyClouds playerRef={playerPos} />
        <Mountains />
        <WorldManager playerPosition={playerPos} />

        <Player 
          position={[0, 0, 20]} 
          onPositionChange={(pos) => {
            playerPos.current.copy(pos);
          }}
        />
      </Canvas>
    </>
  )
}