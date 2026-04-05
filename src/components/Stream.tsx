import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 创建水面纹理
function createWaterTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 水面基础色
  ctx.fillStyle = '#4FC3F7'
  ctx.fillRect(0, 0, 512, 512)
  
  // 添加水波纹理
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = 2 + Math.random() * 5
    const alpha = 0.1 + Math.random() * 0.2
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 添加渐变模拟深浅
  const gradient = ctx.createLinearGradient(0, 0, 512, 512)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 8)
  return texture
}

export default function Stream() {
  const waterRef = useRef<THREE.Mesh>(null)
  const waterTexture = useRef<THREE.Texture | null>(null)
  const timeRef = useRef(0)
  
  if (!waterTexture.current) {
    waterTexture.current = createWaterTexture()
  }
  
  // 水流动画
  useFrame((_, delta) => {
    timeRef.current += delta
    if (waterRef.current) {
      const material = waterRef.current.material as THREE.MeshStandardMaterial
      // 动态改变透明度和纹理偏移模拟水流
      material.opacity = 0.6 + Math.sin(timeRef.current * 0.5) * 0.08
      material.emissive = new THREE.Color(0x0066aa)
      material.emissiveIntensity = 0.05
      material.map = waterTexture.current
      material.map!.offset.x = -timeRef.current * 0.1 // 水流方向
    }
  })

  return (
    <group>
      {/* 小溪流 - 蜿蜒穿过场景 */}
      {/* 溪流主体 - 使用更真实的水面材质 */}
      <mesh 
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0.15]} 
        position={[6, 0.02, 3]} 
        receiveShadow
      >
        <planeGeometry args={[2.5, 12, 64, 64]} />
        <meshStandardMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.7}
          roughness={0.1}
          metalness={0.6}
          envMapIntensity={1.5}
          emissive="#004466"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 溪流边缘石头 - 添加更多细节 */}
      <mesh position={[4.8, 0.05, 0.5]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color="#757575" 
          roughness={0.85} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[5.2, 0.03, 2]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial 
          color="#616161" 
          roughness={0.88} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[7.0, 0.04, 1]} castShadow>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial 
          color="#78909C" 
          roughness={0.82} 
          metalness={0.15}
        />
      </mesh>
      <mesh position={[7.5, 0.02, 4]} castShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial 
          color="#757575" 
          roughness={0.84} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[5.0, 0.03, 5]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial 
          color="#616161" 
          roughness={0.87} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[7.3, 0.04, 6]} castShadow>
        <sphereGeometry args={[0.30, 14, 14]} />
        <meshStandardMaterial 
          color="#78909C" 
          roughness={0.83} 
          metalness={0.12}
        />
      </mesh>
      <mesh position={[8.2, 0.035, 8]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial 
          color="#757575" 
          roughness={0.86} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[5.8, 0.025, 9]} castShadow>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial 
          color="#616161" 
          roughness={0.89} 
          metalness={0.08}
        />
      </mesh>

      {/* 溪流边的潮湿泥土 - 更自然的边缘 */}
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[6, 0.01, 3]} receiveShadow>
        <planeGeometry args={[3.5, 13, 32, 32]} />
        <meshStandardMaterial 
          color="#5D4037" 
          roughness={0.92} 
          metalness={0}
          normalScale={new THREE.Vector2(0.3, 0.3)}
        />
      </mesh>
    </group>
  )
}