import ForestTile from './biomes/ForestTile'
import StreamTile from './biomes/StreamTile'
import RockyTile from './biomes/RockyTile'
import HillsTile from './biomes/HillsTile'
import PathTile from './biomes/PathTile'
import Tile from './Tile'
import type { BiomeType } from './types'

export const BIOME_COMPONENTS: Record<BiomeType, any> = {
  grassland: Tile,
  meadow: Tile,
  forest: ForestTile,
  stream: StreamTile,
  sand: Tile,
  rocky: RockyTile,
  hills: HillsTile,
  path: PathTile,
}

export function getBiomeComponent(type: BiomeType) {
  return BIOME_COMPONENTS[type] || Tile
}