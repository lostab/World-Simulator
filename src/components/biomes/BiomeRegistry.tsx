import React from 'react';
import type { BiomeType } from './types';
import GrasslandTile from './Tile';
import ForestTile from './biomes/ForestTile';
import RockyTile from './biomes/RockyTile';
import StreamTile from './biomes/StreamTile';
import MeadowTile from './biomes/MeadowTile';
import SandTile from './biomes/SandTile';

const BIOME_COMPONENTS: Record<BiomeType, React.ComponentType<any>> = {
  grassland: GrasslandTile,
  meadow: MeadowTile,
  forest: ForestTile,
  rocky: RockyTile,
  stream: StreamTile,
  sand: SandTile,
};

export function getBiomeComponent(type: BiomeType) {
  return BIOME_COMPONENTS[type] || SandTile;
}