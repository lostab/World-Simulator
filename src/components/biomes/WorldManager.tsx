import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TILE_SIZE, RENDER_DISTANCE, BIOME_WEIGHTS } from './types'
import type { BiomeType } from './types'
import { getBiomeComponent } from './BiomeRegistry'

function getRandomBiome(): BiomeType {
  const total = Object.values(BIOME_WEIGHTS).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (const [k, v] of Object.entries(BIOME_WEIGHTS)) {
    if (r < v) return k as BiomeType
    r -= v
  }
  return 'grassland'
}

function createInitialTiles(): Map<string, BiomeType> {
  const tiles = new Map<string, BiomeType>()
  for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
    for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
      tiles.set(`${x},${z}`, getRandomBiome())
    }
  }
  return tiles
}

export default function WorldManager({ playerPosition }: { playerPosition: THREE.Vector3 | { current: THREE.Vector3 } }) {
  const [tiles] = useState<Map<string, BiomeType>>(createInitialTiles())
  const lastTile = useRef({ x: 0, z: 0 })

  useFrame(() => {
    const pos = (playerPosition as any).current || playerPosition
    const tileX = Math.floor(pos.x / TILE_SIZE)
    const tileZ = Math.floor(pos.z / TILE_SIZE)

    if (tileX !== lastTile.current.x || tileZ !== lastTile.current.z) {
      lastTile.current = { x: tileX, z: tileZ }
    }
  })

  return (
    <group name="terrain">
      {Array.from(tiles.entries()).map(([key, type]) => {
        const [x, z] = key.split(',').map(Number)
        const BiomeComp = getBiomeComponent(type)
        return (
          <BiomeComp 
            key={key} 
            position={[x * TILE_SIZE, 0, z * TILE_SIZE]} 
            type={type} 
          />
        )
      })}
    </group>
  )
}