import { useRef, useMemo } from 'react'
import * as THREE from 'three'

export default function ForestTile({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 10
  
  const treeData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 16,
      z: (Math.random() - 0.5) * 16,
      s: 0.7 + Math.random() * 0.5,
      h: 2 + Math.random() * 1
    }))
  }, [])

  useMemo(() => {
    if (meshRef.current) {
      treeData.forEach((tree, i) => {
        const matrix = new THREE.Matrix4()
        matrix.makeTranslation(tree.x, tree.h / 2, tree.z)
        matrix.scale(new THREE.Vector3(tree.s, tree.s, tree.s))
        meshRef.current!.setMatrixAt(i, matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [treeData])

  return (
    <group position={position} userData={{ biomeType: 'forest' }}>
      <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2.5, 6]} />
        <meshStandardMaterial color="#5c4033" />
      </instancedMesh>
      <instancedMesh args={[null as any, null as any, count]} castShadow position={[0, 1.5, 0]}>
        <coneGeometry args={[1.2, 3, 6]} />
        <meshStandardMaterial color="#2d5a1d" />
      </instancedMesh>
    </group>
  )
}