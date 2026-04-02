import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import Ground from './Ground'
import PhotoFrame from './PhotoFrame'

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ background: '#1a1a1a' }}
    >
      <Suspense fallback={null}>
        {/* 环境光照 */}
        <Environment preset="sunset" />
        
        {/* 环境光 */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />

        {/* 地面 */}
        <Ground />

        {/* 示例照片框 - 可以替换为任意照片 */}
        <PhotoFrame 
          position={[0, 1.5, -2]} 
          photoUrl="/photos/sample.jpg"
        />

        {/* 相机控制 */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />

        {/* 地面阴影 */}
        <ContactShadows 
          position={[0, 0.01, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2} 
        />
      </Suspense>
    </Canvas>
  )
}