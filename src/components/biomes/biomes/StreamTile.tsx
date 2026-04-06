import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const StreamTile = memo(function StreamTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#4fc3f7" />;
});

export default StreamTile;