import type { BiomeType } from './types';

function hash(x: number, z: number) {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

export function getBiomeAt(x: number, z: number): BiomeType {
  // 出生点：设为草地，让玩家刚进入就有美景
  if (Math.abs(x) < 20 && Math.abs(z) < 20) {
    return 'grassland';
  }
  
  const h1 = hash(Math.floor(x / 10), Math.floor(z / 10));
  // 森林 (20%)
  if (h1 < 0.2) return 'forest';
  // 湖泊 (10%)
  if (h1 > 0.9) return 'stream';
  
  const h2 = hash(Math.floor(x / 10) + 100, Math.floor(z / 10) + 100);
  // 草地 (30%)
  if (h2 < 0.3) return 'grassland';
  
  const h3 = hash(Math.floor(x / 10) + 200, Math.floor(z / 10) + 200);
  // 石地 (20%)
  if (h3 < 0.2) return 'rocky';
  
  return 'sand';
}

export function getTerrainHeight(_x: number, _z: number): number {
  return 0;
}