import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 创建树冠纹理
function createFoliageTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 树冠基础色
  ctx.fillStyle = '#2E7D32'
  ctx.fillRect(0, 0, 512, 512)
  
  // 添加深浅变化模拟阴影和光照
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = 3 + Math.random() * 8
    const r = 30 + Math.random() * 50
    const g = 100 + Math.random() * 80
    const b = 20 + Math.random() * 40
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const foliageTexture = useRef<THREE.Texture | null>(null)
  if (!foliageTexture.current) {
    foliageTexture.current = createFoliageTexture()
  }
  
  return (
    <group position={position} scale={scale}>
      {/* 树干 - 更自然的形状 */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 2.5, 12]} />
        <meshStandardMaterial 
          color="#5D4037" 
          roughness={0.88} 
          metalness={0.05}
        />
      </mesh>
      
      {/* 树冠 - 更自然的多层圆锥 */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1.3, 2.2, 12]} />
        <meshStandardMaterial 
          color='#3E8E41' 
          map={foliageTexture.current}
          roughness={0.85}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <coneGeometry args={[1.0, 1.8, 12]} />
        <meshStandardMaterial 
          color='#4CAF50' 
          map={foliageTexture.current}
          roughness={0.82}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 4.2, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 12]} />
        <meshStandardMaterial 
          color='#66BB6A' 
          map={foliageTexture.current}
          roughness={0.8}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <coneGeometry args={[0.4, 0.8, 12]} />
        <meshStandardMaterial 
          color='#81C784' 
          map={foliageTexture.current}
          roughness={0.78}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function Bush({ position }: { position: [number, number, number] }) {
  const foliageTexture = useRef<THREE.Texture | null>(null)
  if (!foliageTexture.current) {
    foliageTexture.current = createFoliageTexture()
  }
  
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial 
          color='#4CAF50' 
          map={foliageTexture.current}
          roughness={0.8}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshStandardMaterial 
          color='#66BB6A' 
          map={foliageTexture.current}
          roughness={0.78}
          metalness={0}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export default function Trees() {
  return (
    <group>
      {/* 道路左侧的树木 - 林荫小道效果 */}
      <Tree position={[-3, 0, -3]} scale={1.2} />
      <Tree position={[-4, 0, 0]} scale={1} />
      <Tree position={[-3.5, 0, 3]} scale={1.1} />
      <Tree position={[-4, 0, 6]} scale={0.9} />
      <Tree position={[-3, 0, 9]} scale={1.15} />
      
      {/* 道路右侧的树木 */}
      <Tree position={[3.5, 0, -2]} scale={1.1} />
      <Tree position={[4, 0, 1.5]} scale={1} />
      <Tree position={[3, 0, 5]} scale={1.2} />
      <Tree position={[4, 0, 8]} scale={0.95} />
      <Tree position={[3.5, 0, 11]} scale={1.05} />

      {/* 远处背景的树木 */}
      <Tree position={[-8, 0, -5]} scale={0.8} />
      <Tree position={[8, 0, -3]} scale={0.85} />
      <Tree position={[-10, 0, 5]} scale={0.75} />
      <Tree position={[10, 0, 7]} scale={0.8} />

      {/* 灌木丛装饰 */}
      <Bush position={[-2, 0, 1]} />
      <Bush position={[2.5, 0, 4]} />
      <Bush position={[-2.2, 0, 7]} />
      <Bush position={[2.3, 0, 10]} />
    </group>
  )
}