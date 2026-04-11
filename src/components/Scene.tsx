import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Mountains from './Mountains'
import Trees from './Trees'
import WorldManager from './biomes/WorldManager'
import Player from './Player'
import { Bird } from './biomes/Bird'
import { AnimalManager } from './biomes/AnimalManager'
import CloudSystem from './biomes/CloudSystem'

console.log('[Scene] Scene component loaded');

function FadeIn() {
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => {
      setOpacity(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.05;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#b8d4e8',
      opacity: opacity,
      pointerEvents: 'none',
      zIndex: 100,
      transition: 'opacity 0.1s ease'
    }} />
  );
}

function ShadowLight({ playerPos }: { playerPos: THREE.Vector3 }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.set(playerPos.x, 50, playerPos.z);
      lightRef.current.target.position.set(playerPos.x, 0, playerPos.z);
      lightRef.current.target.updateMatrixWorld();
    }
  });
  return (
    <directionalLight
      ref={lightRef}
      position={[0, 50, 0]}
      intensity={1.5}
      castShadow
      color="#fff8e7"
      shadow-mapSize={[2048, 2048]}
      shadow-camera-far={200}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-bias={-0.0001}
    />
  );
}

export default function Scene() {
  console.log('[Scene] Scene function called');
  const playerPos = useRef(new THREE.Vector3(0, 0, 20));

  return (
    <>
      <FadeIn />
      <Canvas
        shadows
        camera={{ position: [0, 10, 30], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#b8d4e8');
          gl.autoClearColor = true;
        }}
      >
        <ambientLight intensity={1.0} />
        <ShadowLight playerPos={playerPos.current} />
        <hemisphereLight color="#87CEEB" groundColor="#5C8A3D" intensity={0.6} />
        <fog args={['#b8d4e8', 10, 150]} />

        {/* 关键修复：增加一个巨型沙地底盘，彻底终结所有蓝色地块漏洞 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[5000, 5000]} />
          <meshLambertMaterial color="#eeddbb" />
        </mesh>

        <Mountains />
        <CloudSystem playerPos={playerPos.current} />
        <Trees />
        <WorldManager playerPosition={playerPos} />
        <AnimalManager />

        {[...Array(3)].map((_, i) => (
          <Bird key={`bird-${i}`} playerPos={playerPos.current} />
        ))}

        <Player 
          position={[0, 0, 20]} 
          onPositionChange={(pos) => {
            playerPos.current.copy(pos);
          }}
        />
      </Canvas>
    </>
  );
}
