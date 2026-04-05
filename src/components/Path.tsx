export default function Path() {
  return (
    <group>
      {/* 主道路 - 林荫小道 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]} receiveShadow>
        <planeGeometry args={[3, 15]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* 道路两侧的草地 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.005, 2]} receiveShadow>
        <planeGeometry args={[4, 15]} />
        <meshStandardMaterial color="#5C8A3D" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.005, 2]} receiveShadow>
        <planeGeometry args={[4, 15]} />
        <meshStandardMaterial color="#5C8A3D" roughness={0.95} />
      </mesh>
    </group>
  )
}