import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from './biomes/height'

const MOVE_SPEED = 5
const JUMP_FORCE = 4.5
const GRAVITY = 12
const TOUCH_LONG_PRESS_THRESHOLD = 200 // ms

interface PlayerProps {
  position?: [number, number, number]
  onPositionChange?: (pos: THREE.Vector3) => void
}

export default function Player({ position = [0, 0, 0], onPositionChange }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isAutoWalking = useRef(false);
  const targetCameraPos = useRef(new THREE.Vector3());
  const currentLookAtPos = useRef(new THREE.Vector3());
  const canJump = useRef(true);
  const hasInitializedCamera = useRef(false);

  const walkCycle = useRef(0)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)

  const initialY = getTerrainHeight(position[0], position[2]) + 0.2;
  const cameraRotation = useRef({ theta: Math.PI, phi: 1.4 })

  const touchStartPos = useRef<{ x: number, y: number } | null>(null)
  const lastTouchPos = useRef<{ x: number, y: number } | null>(null)
  const touchStartTime = useRef<number>(0)
  const isLongPress = useRef(false)
  const isSwiping = useRef(false)
  const isTouching = useRef(false)
  const longPressTimer = useRef<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp': keys.current.forward = true; break
        case 'KeyS':
        case 'ArrowDown': keys.current.backward = true; break
        case 'KeyA':
        case 'ArrowLeft': cameraRotation.current.theta += 0.12; break
        case 'KeyD':
        case 'ArrowRight': cameraRotation.current.theta -= 0.12; break
        case 'Space':
          if (canJump.current) {
            velocity.current.y = JUMP_FORCE
            canJump.current = false
          }
          break
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp': keys.current.forward = false; break
        case 'KeyS':
        case 'ArrowDown': keys.current.backward = false; break
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true
      const touch = e.touches[0]
      touchStartPos.current = { x: touch.clientX, y: touch.clientY }
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY }
      touchStartTime.current = Date.now()
      isLongPress.current = false
      isSwiping.current = false

      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true
        if (!isSwiping.current) {
          keys.current.forward = true
        }
      }, TOUCH_LONG_PRESS_THRESHOLD)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPos.current || !lastTouchPos.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - lastTouchPos.current.x
      const dy = touch.clientY - lastTouchPos.current.y

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isSwiping.current = true
        cameraRotation.current.theta -= dx * 0.03
        const newPhi = cameraRotation.current.phi - dy * 0.05;
        cameraRotation.current.phi = Math.max(-1.0, Math.min(2.0, newPhi));
      }
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (_e: TouchEvent) => {
      isTouching.current = false
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      keys.current.forward = false
      const duration = Date.now() - touchStartTime.current
      isLongPress.current = false
      isSwiping.current = false
      if (duration < TOUCH_LONG_PRESS_THRESHOLD) {
        if (canJump.current) {
          velocity.current.y = JUMP_FORCE
          canJump.current = false
        }
      }
      touchStartPos.current = null
      lastTouchPos.current = null
      isSwiping.current = false
    }

    let isMouseDown = false
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true
      lastTouchPos.current = { x: e.clientX, y: e.clientY }
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !lastTouchPos.current) return
      const dx = e.clientX - lastTouchPos.current.x
      const dy = e.clientY - lastTouchPos.current.y
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        cameraRotation.current.theta -= dx * 0.01
        const newPhi = cameraRotation.current.phi - dy * 0.03;
        cameraRotation.current.phi = Math.max(-1.0, Math.min(2.0, newPhi));
      }
      lastTouchPos.current = { x: e.clientX, y: e.clientY }
    }
    const handleMouseUp = () => {
      isMouseDown = false
    }

    const handleDoubleClick = () => {
      isAutoWalking.current = !isAutoWalking.current;
      console.log(`[Player] Auto-walk: ${isAutoWalking.current}`);
    };

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('dblclick', handleDoubleClick)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('dblclick', handleDoubleClick)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const mesh = meshRef.current

    const moveDir = new THREE.Vector3()
    const forward = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3(1, 0, 0)
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.theta)
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0))

    const isMovingForward = keys.current.forward || isAutoWalking.current;
    const isMovingBackward = keys.current.backward;
    
    if (isMovingForward) moveDir.add(forward)
    if (isMovingBackward) moveDir.add(forward.clone().negate().multiplyScalar(0.5))

    if (moveDir.length() > 0) {
      moveDir.normalize()
      velocity.current.x = moveDir.x * MOVE_SPEED
      velocity.current.z = moveDir.z * MOVE_SPEED
      walkCycle.current += delta * 10
      const swingAngle = Math.sin(walkCycle.current) * 0.6
      if (leftArmRef.current) leftArmRef.current.rotation.x = swingAngle
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swingAngle
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swingAngle
      if (rightLegRef.current) rightLegRef.current.rotation.x = swingAngle
      if (isMovingForward) {
        meshRef.current!.rotation.y = Math.atan2(moveDir.x, moveDir.z)
      }
    } else {
      velocity.current.x = 0
      velocity.current.z = 0
      walkCycle.current = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
    }

    velocity.current.y -= GRAVITY * delta
    mesh.position.x += velocity.current.x * delta
    mesh.position.y += velocity.current.y * delta
    mesh.position.z += velocity.current.z * delta

    if (onPositionChange) {
      onPositionChange(mesh.position);
    }

    const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
    const playerHeightOffset = 0.13;
    if (mesh.position.y <= groundY + playerHeightOffset + 0.05 && velocity.current.y <= 0) { 
      mesh.position.y = groundY + playerHeightOffset;
      velocity.current.y = 0;
      canJump.current = true;
    }

    const theta = cameraRotation.current.theta;
    const phi = cameraRotation.current.phi;
    const radius = 6;
    const clampedPhi = Math.max(0.1, Math.min(2.0, phi));
    
    const cameraX = mesh.position.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
    const cameraY = mesh.position.y + radius * Math.cos(clampedPhi);
    const cameraZ = mesh.position.z + radius * Math.sin(clampedPhi) * Math.cos(theta);
    
    targetCameraPos.current.set(cameraX, cameraY, cameraZ);

    const idealLookAtPos = new THREE.Vector3(mesh.position.x, mesh.position.y + 1.2, mesh.position.z);

    // 核心修复：首帧强制同步位置和注视点，消除进入时的视角晃动
    if (!hasInitializedCamera.current) {
      camera.position.copy(targetCameraPos.current);
      currentLookAtPos.current.copy(idealLookAtPos);
      camera.lookAt(currentLookAtPos.current);
      hasInitializedCamera.current = true;
    } else {
      camera.position.lerp(targetCameraPos.current, 0.08);
      currentLookAtPos.current.lerp(idealLookAtPos, 0.1);
      camera.lookAt(currentLookAtPos.current);
    }
  })

  return (
    <group 
      ref={meshRef} 
      position={[position[0], initialY, position[2]]} 
      scale={0.5} 
      rotation={[0, 0, 0]} 
    >
      {/*头部*/}
      <group>
        {/* 基础头发 - 覆盖后脑勺 */}
        <mesh position={[0, 1.7, -0.05]} rotation={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#3d2314" />
        </mesh>
        
        {/* 脸部 - 稍微增大比例 */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>

        {/* 眼睛 */}
        <mesh position={[0.09, 1.7, 0.25]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.09, 1.7, 0.25]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* 眼镜框 */}
        <mesh position={[0.09, 1.7, 0.26]}>
          <boxGeometry args={[0.14, 0.03, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.09, 1.7, 0.26]}>
          <boxGeometry args={[0.14, 0.03, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 1.7, 0.26]}>
          <boxGeometry args={[0.05, 0.015, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* 鼻子 */}
        <mesh position={[0, 1.63, 0.27]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#eebb99" />
        </mesh>

        {/* 嘴巴 */}
        <mesh position={[0, 1.53, 0.25]} castShadow>
          <boxGeometry args={[0.14, 0.03, 0.04]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>

        {/* 耳朵 */}
        <mesh position={[0.35, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
        <mesh position={[-0.35, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*脖子 */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>

      {/*躯干 */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.25]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>

      {/*左臂 - 修正 Z-Fighting: 手部宽度 0.13 < 袖子 0.14 */}
      <group ref={leftArmRef} position={[0.38, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>
        <mesh position={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.13, 0.3, 0.13]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*右臂 - 修复：将手部颜色从蓝色 #4a90d9 改回皮肤色 #ffccaa */}
      <group ref={rightArmRef} position={[-0.38, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>
        <mesh position={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.13, 0.3, 0.13]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*左腿 */}
      <group ref={leftLegRef} position={[0.1, 0.5, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.65, 0.12]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
        <mesh position={[0, -0.75, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.15]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      </group>

      {/*右腿 */}
      <group ref={rightLegRef} position={[-0.1, 0.5, 0]} castShadow>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.65, 0.12]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
        <mesh position={[0, -0.75, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.15]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      </group>
    </group>
  )
}
