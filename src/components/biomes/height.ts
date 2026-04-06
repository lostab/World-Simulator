import type { BiomeType } from './types';

function hash(x: number, z: number) {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

export function getBiomeAt(x: number, z: number): BiomeType {
  // 出生点安全区：10 格内
  if (Math.abs(x) < 10 && Math.abs(z) < 10) {
    return 'sand';
  }
  
  // 深绿色森林 (3x3) - 3%
  const h1 = hash(Math.floor(x / 10), Math.floor(z / 10));
  if (h1 < 0.03) return 'forest';
  
  // 蓝色湖泊 (3x3) - 3%
  if (h1 > 0.97) return 'stream';
  
  // 浅绿色草地 (2x2) - 3%
  const h2 = hash(Math.floor(x / 10) + 100, Math.floor(z / 10) + 100);
  if (h2 < 0.03) return 'grassland';
  
  // 褐色石头 (1x1) - 3%
  const h3 = hash(Math.floor(x / 10) + 200, Math.floor(z / 10) + 200);
  if (h3 < 0.03) return 'rocky';
  
  return 'sand';
}

export function getTerrainHeight(_x: number, _z: number): number {
  return 0;
}