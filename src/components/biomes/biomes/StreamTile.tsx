export default function StreamTile({ position }: { position: [number, number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow userData={{ biomeType: 'stream' }}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4a90d9" roughness={0.3} metalness={0.1} />
    </mesh>
  )
}