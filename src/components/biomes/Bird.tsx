import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Bird({ playerPos }: { playerPos: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const wingLRef = useRef<THREE.Mesh>(null);
  const wingRRef = useRef<THREE.Mesh>(null);
  
  const birdState = useRef({
    angle: Math.random() * Math.PI * 2,
    radius: 4 + Math.random() * 6,
    speed: 0.6 + Math.random() * 0.4,
    heightOffset: Math.random() * 2,
    phase: Math.random() * Math.PI * 2
  });

  useFrame((_state, delta) => {
    if (!meshRef.current || !bodyRef.current) return;

    // 1. 飞行轨道更新
    birdState.current.angle += delta * birdState.current.speed * 0.2;
    const centerX = playerPos ? playerPos.x : 0;
    const centerZ = playerPos ? playerPos.z : 0;
    const x = centerX + Math.cos(birdState.current.angle) * birdState.current.radius;
    const z = centerZ + Math.sin(birdState.current.angle) * birdState.current.radius;
    const y = 3 + Math.sin(birdState.current.angle * 2) * 0.5 + birdState.current.heightOffset;

    meshRef.current.position.set(x, y, z);
    meshRef.current.lookAt(
      centerX + Math.cos(birdState.current.angle + 0.1) * birdState.current.radius,
      y,
      centerZ + Math.sin(birdState.current.angle + 0.1) * birdState.current.radius
    );

    // 2. 联动动画
    birdState.current.phase += delta * 10; 
    const flap = Math.sin(birdState.current.phase);
    
    // 翅膀旋转 - 模拟 Twitter Logo 那种圆润的扇动感
    if (wingLRef.current) {
      wingLRef.current.rotation.z = flap * 0.5;
      wingLRef.current.rotation.x = flap * 0.2;
    }
    if (wingRRef.current) {
      wingRRef.current.rotation.z = -flap * 0.5;
      wingRRef.current.rotation.x = -flap * 0.2;
    }

    // 身体随飞行波浪轻微起伏
    bodyRef.current.rotation.x = flap * 0.05;
    bodyRef.current.rotation.z = Math.sin(birdState.current.angle) * 0.1;
  });

  return (
    <group ref={meshRef}>
      <group ref={bodyRef}>
        {/* 身体 - 极简圆润流线体 (Twitter Blue) */}
        <mesh castShadow position={[0, 0, 0]} scale={[0.6, 0.5, 1.4]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#1DA1F2" />
        </mesh>
        
        {/* 头部 - 平滑过渡 */}
        <mesh castShadow position={[0, 0.1, 0.25]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#1DA1F2" />
        </mesh>

        {/* 喙 - 小巧圆润 */}
        <mesh position={[0, 0.12, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 4]} />
          <meshStandardMaterial color="#FFB300" />
        </mesh>

        {/* 翅膀 - 修复旋转中心，使其紧贴身体 */}
        {/* 左翼 - 旋转中心在 [0.1, 0, 0]，模型向右延伸 */}
        <group position={[0.1, 0, 0]}>
          <mesh ref={wingLRef} castShadow scale={[1, 0.05, 0.5]} position={[0.1, 0, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#1DA1F2" />
          </mesh>
        </group>

        {/* 右翼 - 旋转中心在 [-0.1, 0, 0]，模型向左延伸 */}
        <group position={[-0.1, 0, 0]}>
          <mesh ref={wingRRef} castShadow scale={[1, 0.05, 0.5]} position={[-0.1, 0, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#1DA1F2" />
          </mesh>
        </group>

        {/* 尾巴 - 极简扁平圆弧 */}
        <mesh position={[0, -0.02, -0.2]} castShadow scale={[0.8, 0.05, 0.4]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#1DA1F2" />
        </mesh>
      </group>
    </group>
  );
}
