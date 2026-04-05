function RiceStalk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 稻秆 */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.4, 4]} />
        <meshStandardMaterial color="#7CB342" />
      </mesh>
      {/* 稻穗 */}
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshStandardMaterial color="#FDD835" />
      </mesh>
    </group>
  )
}

function RiceFieldBlock({ position, rows = 5, cols = 8 }: { 
  position: [number, number, number]
  rows?: number
  cols?: number 
}) {
  const stalks = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      stalks.push(
        <RiceStalk 
          key={`${i}-${j}`} 
          position={[j * 0.25 - cols * 0.125, 0, i * 0.25]} 
        />
      )
    }
  }
  
  return (
    <group position={position}>
      {/* 稻田水面/泥土 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[cols * 0.25 + 0.3, rows * 0.25 + 0.3]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* 水面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[cols * 0.25 + 0.2, rows * 0.25 + 0.2]} />
        <meshStandardMaterial color="#3E2723" roughness={0.7} />
      </mesh>
      <group>{stalks}</group>
    </group>
  )
}

export default function RiceField() {
  return (
    <group>
      {/* 左侧稻田 */}
      <RiceFieldBlock position={[-8, 0, 2]} rows={6} cols={10} />
      <RiceFieldBlock position={[-8, 0, 6]} rows={6} cols={10} />
      <RiceFieldBlock position={[-8, 0, 10]} rows={6} cols={10} />
      
      {/* 右侧稻田 */}
      <RiceFieldBlock position={[8, 0, 0]} rows={6} cols={10} />
      <RiceFieldBlock position={[8, 0, 4]} rows={6} cols={10} />
      <RiceFieldBlock position={[8, 0, 8]} rows={6} cols={10} />
    </group>
  )
}