// 原子化场景类型定义
export type BiomeType = 
  | 'grassland'
  | 'forest'
  | 'stream'
  | 'sand'
  | 'meadow'
  | 'rocky'
  | 'hills'
  | 'path'

export const TILE_SIZE = 20

// 渲染距离：周围 2 圈
export const RENDER_DISTANCE = 1

// 权重：增加草地、沙地、丘陵
export const BIOME_WEIGHTS: Record<BiomeType, number> = {
  grassland: 25,
  sand: 20,
  hills: 20,
  forest: 15,
  meadow: 10,
  stream: 5,
  rocky: 3,
  path: 2,
}