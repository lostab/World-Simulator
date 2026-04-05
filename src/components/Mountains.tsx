export default function Mountains() {
  return (
    <>
      {/* 远处的山 - 第一层 */}
      <mesh position={[0, 3, -30]} receiveShadow>
        <coneGeometry args={[15, 12, 6]} />
        <meshStandardMaterial color="#4A6741" flatShading />
      </mesh>
      <mesh position={[-12, 2, -28]} receiveShadow>
        <coneGeometry args={[10, 8, 5]} />
        <meshStandardMaterial color="#3D5A35" flatShading />
      </mesh>
      <mesh position={[14, 2.5, -29]} receiveShadow>
        <coneGeometry args={[12, 9, 5]} />
        <meshStandardMaterial color="#4A6741" flatShading />
      </mesh>

      {/* 远处的山 - 第二层（更淡） */}
      <mesh position={[-20, 4, -35]} receiveShadow>
        <coneGeometry args={[18, 14, 6]} />
        <meshStandardMaterial color="#5C7A52" flatShading />
      </mesh>
      <mesh position={[25, 3.5, -33]} receiveShadow>
        <coneGeometry args={[20, 12, 5]} />
        <meshStandardMaterial color="#5C7A52" flatShading />
      </mesh>
      <mesh position={[0, 5, -38]} receiveShadow>
        <coneGeometry args={[25, 18, 7]} />
        <meshStandardMaterial color="#6B8B63" flatShading />
      </mesh>

      {/* 更远的背景山（淡蓝色） */}
      <mesh position={[-30, 6, -45]} receiveShadow>
        <coneGeometry args={[30, 20, 6]} />
        <meshStandardMaterial color="#7A9B75" flatShading />
      </mesh>
      <mesh position={[35, 7, -48]} receiveShadow>
        <coneGeometry args={[35, 22, 7]} />
        <meshStandardMaterial color="#7A9B75" flatShading />
      </mesh>
    </>
  )
}