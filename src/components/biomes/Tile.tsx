import { memo } from 'react';
import { BaseBiomeTile } from './BaseBiomeTile';

const GrasslandTile = memo(function GrasslandTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#5cb85c" />;
});

export default GrasslandTile;