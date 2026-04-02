export default function Ground() {
  // MVP阶段使用简单材质，后续可替换为真实照片纹理
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color="#556B2F"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}