/**
 * 根据世界坐标计算地形高度
 * 采用多层正弦波叠加模拟自然地形
 */
export function getTerrainHeight(x: number, z: number, biomeType: string): number {
  // 基础随机起伏 (所有地形共有)
  const baseNoise = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.1;

  switch (biomeType) {
    case 'hills':
      // 丘陵：大波浪，起伏明显
      const hillWave = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 1.2;
      const smallBump = Math.sin(x * 0.8) * Math.sin(z * 0.8) * 0.2;
      return Math.max(0, hillWave + smallBump + baseNoise);

    case 'rocky':
      // 岩石地：高频小起伏，坑洼感
      const rockyNoise = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.3;
      return Math.max(0, rockyNoise + baseNoise);

    case 'forest':
      // 森林：轻微起伏
      return Math.max(0, Math.sin(x * 0.3) * 0.2 + baseNoise);

    default:
      // 平原/沙地：基本平坦，仅有极小随机波动
      return Math.max(0, baseNoise * 0.5);
  }
}