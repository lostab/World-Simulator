import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 创建一个程序化草地纹理
function createGrassTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 基础草地颜色
  ctx.fillStyle = '#4a7c2e'
  ctx.fillRect(0, 0, 512, 512)
  
  // 添加随机草叶纹理
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const length = 10 + Math.random() * 20
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
    
    const r = 60 + Math.random() * 40
    const g = 120 + Math.random() * 60
    const b = 30 + Math.random() * 30
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
    ctx.lineWidth = 1 + Math.random() * 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }
  
  // 添加一些暗斑模拟阴影
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = 20 + Math.random() * 40
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(30, 50, 15, 0.3)')
    gradient.addColorStop(1, 'rgba(30, 50, 15, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)
  return texture
}

export default function Ground() {
  const meshRef = useRef<THREE.Mesh>(null)
  const grassTexture = useRef<THREE.Texture | null>(null)
  
  if (!grassTexture.current) {
    grassTexture.current = createGrassTexture()
  }
  
  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.01, 0]} 
      receiveShadow
    >
      <planeGeometry args={[60, 60, 32, 32]} />
      <meshStandardMaterial 
        map={grassTexture.current}
        color="#5C8A3D"
        roughness={0.9}
        metalness={0}
        normalScale={new THREE.Vector2(0.5, 0.5)}
      />
    </mesh>
  )
}