import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const ForestTile = memo(function ForestTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#4a8a3a" />;
});

export default ForestTile;