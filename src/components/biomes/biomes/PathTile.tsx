export default function PathTile({ position }: { position: [number, number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow userData={{ biomeType: 'path' }}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#8b7355" roughness={0.9} />
    </mesh>
  )
}