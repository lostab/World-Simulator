import { useRef, useMemo } from 'react'
import * as THREE from 'three'

export default function RockyTile({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 8
  
  const rockData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 16,
      z: (Math.random() - 0.5) * 16,
      s: 0.4 + Math.random() * 0.6,
      ry: Math.random() * Math.PI
    }))
  }, [])

  useMemo(() => {
    if (meshRef.current) {
      rockData.forEach((rock, i) => {
        const matrix = new THREE.Matrix4()
        matrix.makeTranslation(rock.x, rock.s * 0.5, rock.z)
        matrix.multiply(new THREE.Matrix4().makeRotationY(rock.ry))
        matrix.scale(new THREE.Vector3(rock.s, rock.s, rock.s))
        meshRef.current!.setMatrixAt(i, matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [rockData])

  return (
    <group position={position} userData={{ biomeType: 'rocky' }}>
      <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#666666" roughness={0.9} />
      </instancedMesh>
    </group>
  )
}