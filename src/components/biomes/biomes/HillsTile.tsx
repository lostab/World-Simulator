import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../height'

export default function HillsTile({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.Texture | null>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 24, 24)
    const pos = geo.attributes.position
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + position[0]
      const y = pos.getY(i) + position[2]
      const height = getTerrainHeight(x, y, 'hills')
      pos.setZ(i, height)
    }
    
    geo.computeVertexNormals()
    return geo
  }, [position])

  if (!textureRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 360)
    gradient.addColorStop(0, '#7cb342')
    gradient.addColorStop(0.5, '#8bc34a')
    gradient.addColorStop(1, '#9ccc65')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
    }
    
    textureRef.current = new THREE.CanvasTexture(canvas)
    textureRef.current.wrapS = THREE.RepeatWrapping
    textureRef.current.wrapT = THREE.RepeatWrapping
    textureRef.current.repeat.set(4, 4)
  }

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
      name="hills_terrain"
      userData={{ biomeType: 'hills' }}
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        map={textureRef.current}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  )
}