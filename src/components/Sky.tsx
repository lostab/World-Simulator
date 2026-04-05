import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sky() {
  const cloudsRef = useRef<THREE.Group>(null)

  // 简单的云朵缓慢飘动
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x += delta * 0.5
      if (cloudsRef.current.position.x > 50) {
        cloudsRef.current.position.x = -50
      }
    }
  })

  return (
    <>
      {/* 渐变天空背景 */}
      <mesh position={[0, 0, -40]} scale={[200, 100, 1]}>
        <planeGeometry />
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              vec3 topColor = vec3(0.4, 0.7, 1.0);    // 蓝天
              vec3 bottomColor = vec3(0.85, 0.9, 1.0); // 接近地平线泛白
              vec3 color = mix(bottomColor, topColor, vUv.y);
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      {/* 太阳 */}
      <mesh position={[30, 25, -35]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#FFF5E0" />
      </mesh>
      
      {/* 太阳光晕 */}
      <mesh position={[30, 25, -35.1]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.3} />
      </mesh>

      {/* 云朵组 */}
      <group ref={cloudsRef} position={[0, 15, -25]}>
        {/* 云朵1 */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.5, 0.3, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-1.5, 0.2, 0]}>
            <sphereGeometry args={[1.3, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* 云朵2 */}
        <group position={[15, 2, -5]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.2, 0.2, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-1, 0.1, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* 云朵3 */}
        <group position={[-12, -1, -3]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1, 0.2, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
    </>
  )
}