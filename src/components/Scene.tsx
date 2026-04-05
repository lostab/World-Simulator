import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Sky as DreiSky } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import * as THREE from 'three'
import Mountains from './Mountains'
import Ground from './Ground'
import Path from './Path'
import Trees from './Trees'
import Stream from './Stream'
import RiceField from './RiceField'
import Player from './Player'

function CustomSky() {
  const skyRef = useRef<THREE.Mesh>(null)

  return (
    <>
      <DreiSky 
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={0.5}
        turbidity={10}
      />
    </>
  )
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2.2, 25], fov: 50 }}
      gl={{ 
        antialias: true,
      }}
      style={{ background: '#87CEEB' }}
    >
      <Suspense fallback={null}>
        <Environment preset="park" background={false} />
        
        <fog attach="fog" args={['#87CEEB', 20, 80]} />
        
        <directionalLight 
          position={[50, 30, 10]} 
          intensity={2.0}
          color="#FFF5E0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
          shadow-regular-size={false}
        />
        
        <hemisphereLight 
          color="#87CEEB" 
          groundColor="#5C8A3D" 
          intensity={0.4} 
        />

        <CustomSky />

        <Mountains />
        <Ground />
        <Path />
        <Trees />
        <Stream />
        <RiceField />

        {/* 玩家角色 - 第三人称视角 */}
        <Player position={[0, 0, 20]} />

        <EffectComposer enableNormalPass>
          <Bloom 
            intensity={0.3}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.95}
            mipmapBlur
          />
          <SSAO 
            samples={31}
            radius={5}
            intensity={20}
            luminanceInfluence={0.5}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}