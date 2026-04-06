import { useMemo } from 'react';
import { TILE_SIZE } from './types';
import { Tree } from '../Trees';
import { memo } from 'react';

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const Flower = memo(function Flower({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
});

const Grass = memo(function Grass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.01, 0.015, 0.3]} />
        <meshStandardMaterial color="#66BB6A" />
      </mesh>
      <mesh position={[0.05, 0.12, 0.02]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.01, 0.015, 0.25]} />
        <meshStandardMaterial color="#81C784" />
      </mesh>
    </group>
  );
});

const Rock = memo(function Rock({ position, scale }: { position: [number, number, number], scale: number }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#757575" roughness={0.9} />
    </mesh>
  );
});

export default function WorldDecorations({ tiles }: { tiles: Map<string, any> }) {
  const decorations = useMemo(() => {
    const items: any[] = [];
    const entries = Array.from(tiles.entries());
    
    for (const [key, type] of entries) {
      const [tx, tz] = key.split(',').map(Number);
      const worldX = tx * TILE_SIZE;
      const worldZ = tz * TILE_SIZE;
      const seed = tx * 12.34 + tz * 56.78;

      const treeCount = type === 'forest' ? Math.floor(pseudoRandom(seed + 1) * 5) + 1 : 0;
      const flowerCount = type === 'meadow' || type === 'grassland' ? Math.floor(pseudoRandom(seed + 2) * 4) + 1 : 0;
      const grassCount = type === 'meadow' || type === 'grassland' ? Math.floor(pseudoRandom(seed + 3) * 4) + 1 : 0;
      const rockCount = type === 'rocky' ? 1 : 0;
      
      for (let i = 0; i < treeCount; i++) {
        const rx = (pseudoRandom(seed + i * 1.1) - 0.5) * 15;
        const rz = (pseudoRandom(seed + i * 2.2) - 0.5) * 15;
        const scale = 0.8 + pseudoRandom(seed + i * 3.3) * 0.5;
        items.push(<Tree key={`tree-${key}-${i}`} position={[worldX + rx, 0, worldZ + rz]} scale={scale} />);
      }

      for (let i = 0; i < flowerCount; i++) {
        const rx = (pseudoRandom(seed + i * 4.4) - 0.5) * 15;
        const rz = (pseudoRandom(seed + i * 5.5) - 0.5) * 15;
        const colors = ['#FFC0CB', '#FFFF00', '#FFFFFF', '#E6E6FA', '#FFB6C1'];
        const color = colors[Math.floor(pseudoRandom(seed + i * 6.6) * colors.length)];
        items.push(<Flower key={`flower-${key}-${i}`} position={[worldX + rx, 0, worldZ + rz]} color={color} />);
      }

      for (let i = 0; i < grassCount; i++) {
        const rx = (pseudoRandom(seed + i * 7.7) - 0.5) * 15;
        const rz = (pseudoRandom(seed + i * 8.8) - 0.5) * 15;
        items.push(<Grass key={`grass-${key}-${i}`} position={[worldX + rx, 0, worldZ + rz]} />);
      }

      for (let i = 0; i < rockCount; i++) {
        const rx = (pseudoRandom(seed + i * 9.9) - 0.5) * 15;
        const rz = (pseudoRandom(seed + i * 10.1) - 0.5) * 15;
        const scale = 0.5 + pseudoRandom(seed + i * 11.1) * 1.0;
        items.push(<Rock key={`rock-${key}-${i}`} position={[worldX + rx, 0.2, worldZ + rz]} scale={scale} />);
      }
    }
    return items;
  }, [tiles]);

  return <group>{decorations}</group>;
}