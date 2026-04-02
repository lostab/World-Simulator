import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

interface PhotoFrameProps {
  position: [number, number, number]
  photoUrl: string
  width?: number
  height?: number
}

export default function PhotoFrame({ 
  position, 
  photoUrl, 
  width = 2, 
  height = 1.5 
}: PhotoFrameProps) {
  // 尝试加载照片纹理，如果失败则使用占位符
  let texture = null
  try {
    texture = useLoader(THREE.TextureLoader, photoUrl)
    texture.colorSpace = THREE.SRGBColorSpace
  } catch (e) {
    // 加载失败，使用占位符
  }
  
  return (
    <group position={position}>
      {/* 相框 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* 照片画面 */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width - 0.1, height - 0.1]} />
        <meshStandardMaterial 
          map={texture}
          color={texture ? '#ffffff' : '#4a4a4a'}
          roughness={0.5} 
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}