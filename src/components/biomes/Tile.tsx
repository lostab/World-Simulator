import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from './height'

export default function Tile({ type, position }: { 
  type: string, 
  position: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.Texture | null>(null)

  // 创建带有高度起伏的几何体
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 20, 20)
    const pos = geo.attributes.position
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + position[0]
      const z = pos.getY(i) + position[2]
      const h = getTerrainHeight(x, z, type)
      pos.setZ(i, h)
    }
    
    geo.computeVertexNormals()
    return geo
  }, [position, type])

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    let baseColor = '#4a7c2e'
    let detailColor = '#3d6b26'
    switch (type) {
      case 'grassland': case 'meadow': 
        baseColor = '#4a7c2e'; detailColor = '#3d6b26'; break
      case 'forest': 
        baseColor = '#3d6b26'; detailColor = '#2d5a1d'; break
      case 'sand': 
        baseColor = '#c2b280'; detailColor = '#a89a6a'; break
      case 'rocky': 
        baseColor = '#5a5a5a'; detailColor = '#4a4a4a'; break
      case 'hills': 
        baseColor = '#6b8e4f'; detailColor = '#5a7a3d'; break
      case 'path': 
        baseColor = '#8b7355'; detailColor = '#7a6333'; break
      case 'stream': 
        baseColor = '#4a90d9'; detailColor = '#3a80c9'; break
    }

    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 3)
    }
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      ctx.fillStyle = detailColor
      ctx.beginPath()
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    textureRef.current = texture
  }

  // const overlap = 0.5

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position} 
      receiveShadow
      userData={{ biomeType: type }}
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial map={textureRef.current} roughness={0.85} />
    </mesh>
  )
}