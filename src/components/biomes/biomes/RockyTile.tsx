import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const RockyTile = memo(function RockyTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#6b6b6b" roughness={0.95} />;
});

export default RockyTile;