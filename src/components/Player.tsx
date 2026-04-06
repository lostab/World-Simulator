import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from './biomes/height'

const MOVE_SPEED = 5
const JUMP_FORCE = 5
const GRAVITY = 15
const TOUCH_LONG_PRESS_THRESHOLD = 200 // ms

interface PlayerProps {
  position?: [number, number, number]
  onPositionChange?: (pos: THREE.Vector3) => void
}

export default function Player({ position = [0, 0, 0], onPositionChange }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // Use ref for keys to avoid closure issues
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetCameraPos = useRef(new THREE.Vector3()); // 持久化目标位置，避免每帧创建新对象
  const canJump = useRef(true);

  // Animation state
  const walkCycle = useRef(0)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)

  // 初始化角色位置到地面高度
  const initialY = getTerrainHeight(position[0], position[2]) + 0.2;

  // Camera orbit state
  const cameraRotation = useRef({ theta: Math.PI, phi: 1.4 })

  // Touch handling refs
  const touchStartPos = useRef<{ x: number, y: number } | null>(null)
  const lastTouchPos = useRef<{ x: number, y: number } | null>(null)
  const touchStartTime = useRef<number>(0)
  const isLongPress = useRef(false)
  const isSwiping = useRef(false)
  const isTouching = useRef(false) // Track if user is currently touching screen
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
        // A/D 和 ←/→ 不需要 keyup 处理（相机旋转是即时的）
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

        // 滑动时调整相机水平角度(这样可以在移动时调整方向)
        cameraRotation.current.theta -= dx * 0.03
        // 垂直滑动调整相机高度，反转方向
        const newPhi = cameraRotation.current.phi - dy * 0.05; // 大幅提高灵敏度
        cameraRotation.current.phi = Math.max(-1.0, Math.min(2.0, newPhi)); // 极大范围
      }
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (_e: TouchEvent) => {
      isTouching.current = false

      // Clear long press timer if it exists
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      // Always stop moving when touch ends
      keys.current.forward = false

      // Reset states
      const duration = Date.now() - touchStartTime.current
      isLongPress.current = false
      isSwiping.current = false

      // Only jump if it was a short tap (not a swipe or long press)
      if (duration < TOUCH_LONG_PRESS_THRESHOLD) {
        // Short tap -> Jump
        if (canJump.current) {
          velocity.current.y = JUMP_FORCE
          canJump.current = false
        }
      }
      touchStartPos.current = null
      lastTouchPos.current = null
      isSwiping.current = false
    }

    // Mouse/Trackpad drag handling
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
        // 拖拽时调整相机角度
        cameraRotation.current.theta -= dx * 0.01
        const newPhi = cameraRotation.current.phi - dy * 0.03;
        cameraRotation.current.phi = Math.max(-1.0, Math.min(2.0, newPhi));
      }
      lastTouchPos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isMouseDown = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
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

    // Calculate move direction based on camera rotation
    const moveDir = new THREE.Vector3()
    const forward = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3(1, 0, 0)
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.theta)
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0))

    // Only move if user is touching the screen
    const isMovingForward = keys.current.forward
    const isMovingBackward = keys.current.backward
    
    if (isMovingForward) moveDir.add(forward)
    if (isMovingBackward) moveDir.add(forward.clone().negate().multiplyScalar(0.5))

    if (moveDir.length() > 0) {
      // Move character
      moveDir.normalize()
      velocity.current.x = moveDir.x * MOVE_SPEED
      velocity.current.z = moveDir.z * MOVE_SPEED

      // Update walk cycle
      walkCycle.current += delta * 10

      // Animate limbs - arms swing opposite to legs
      const swingAngle = Math.sin(walkCycle.current) * 0.6
      if (leftArmRef.current) leftArmRef.current.rotation.x = swingAngle
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swingAngle

      if (leftLegRef.current) leftLegRef.current.rotation.x = -swingAngle
      if (rightLegRef.current) rightLegRef.current.rotation.x = swingAngle

      // Character always faces movement direction (backward keeps current facing)
      if (isMovingForward) {
        meshRef.current!.rotation.y = Math.atan2(moveDir.x, moveDir.z)
      }
    } else {
      // IMPORTANT: Reset velocity to 0 when not moving
      velocity.current.x = 0
      velocity.current.z = 0
      // Reset walking cycle when not moving
      walkCycle.current = 0
      // Reset limb positions
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
    }

    // Apply gravity and movement
    velocity.current.y -= GRAVITY * delta
    mesh.position.x += velocity.current.x * delta
    mesh.position.y += velocity.current.y * delta
    mesh.position.z += velocity.current.z * delta

    // 每帧都更新位置（用于相机平滑跟随）
    if (onPositionChange) {
      onPositionChange(mesh.position);
    }

    // 直接用原始高度，不采样周围（防止被山丘干扰）
    // Offset 1.5 保证绝不穿模（轻微悬浮可接受）
    const groundY = getTerrainHeight(mesh.position.x, mesh.position.z);
    // 地面现在是平的(Height=0)，精确计算脚底位置
    // 脚在组中心下方 0.125 处(缩放后)，要贴地需要 +0.125
    const playerHeightOffset = 0.13;
    
    if (velocity.current.y <= 0.01) { 
      mesh.position.y = groundY + playerHeightOffset;
      velocity.current.y = 0;
      canJump.current = true;
    }

    // Camera - 球形轨道视角 (Spherical Coordinates)
    const theta = cameraRotation.current.theta;
    const phi = cameraRotation.current.phi;
    const radius = 6; // 相机距离

    // 限制 phi 范围防止相机翻转 (0.1 ~ 1.5 弧度)
    const clampedPhi = Math.max(0.1, Math.min(2.0, phi));
    
    // 球坐标 -> 笛卡尔坐标
    const cameraX = mesh.position.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
    const cameraY = mesh.position.y + radius * Math.cos(clampedPhi);
    const cameraZ = mesh.position.z + radius * Math.sin(clampedPhi) * Math.cos(theta);
    
    // 使用 set 而不是 new Vector3，消除 GC 压力
    targetCameraPos.current.set(cameraX, cameraY, cameraZ);
    camera.position.lerp(targetCameraPos.current, 0.08);
    camera.lookAt(mesh.position.x, mesh.position.y + 1.2, mesh.position.z);
  })

  return (
    <group 
      ref={meshRef} 
      position={[position[0], initialY, position[2]]} 
      scale={0.5} 
      rotation={[0, 0, 0]} // 角色朝前
    >
      {/*头部*/}
      <group>
        {/* 头发 - 从头顶向后延伸 */}
        <mesh position={[0, 1.95, -0.05]} rotation={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#3d2314" />
        </mesh>
        <mesh position={[0.12, 1.92, -0.1]} rotation={[0.2, 0.3, 0.2]} castShadow>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#3d2314" />
        </mesh>
        <mesh position={[-0.12, 1.92, -0.1]} rotation={[0.2, -0.3, -0.2]} castShadow>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#3d2314" />
        </mesh>
        
        {/* 脸部 */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>

        {/* 眼睛 - 调整位置到脸部表面 */}
        <mesh position={[0.08, 1.85, 0.22]} castShadow>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.08, 1.85, 0.22]} castShadow>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* 眼镜框 */}
        <mesh position={[0.08, 1.85, 0.23]}>
          <boxGeometry args={[0.12, 0.03, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.08, 1.85, 0.23]}>
          <boxGeometry args={[0.12, 0.03, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 1.85, 0.23]}>
          <boxGeometry args={[0.04, 0.015, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* 鼻子 - 调整到脸部前方 */}
        <mesh position={[0, 1.78, 0.25]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#eebb99" />
        </mesh>

        {/* 嘴巴 - 调整位置 */}
        <mesh position={[0, 1.68, 0.22]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>

        {/* 耳朵 - 调整位置 */}
        <mesh position={[0.32, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
        <mesh position={[-0.32, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*脖子 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>

      {/*躯干 */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.25]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>

      {/*左臂（以肩膀为中心） */}
      <group ref={leftArmRef} position={[0.38, 1.35, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.8, 0.14]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.14]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*右臂（以肩膀为中心） */}
      <group ref={rightArmRef} position={[-0.38, 1.35, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.8, 0.14]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.14]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </group>

      {/*左腿(以髋部为中心) */}
      <group ref={leftLegRef} position={[0.1, 0.55, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
        <mesh position={[0, -0.8, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.15]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      </group>

      {/*右腿(以髋部为中心) */}
      <group ref={rightLegRef} position={[-0.1, 0.55, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
        <mesh position={[0, -0.8, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.15]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      </group>
    </group>
  )
}
