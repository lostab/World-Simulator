import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const PathTile = memo(function PathTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#a08060" roughness={0.9} />;
});

export default PathTile;