import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const SandTile = memo(function SandTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#e6c98c" roughness={0.9} />;
});

export default SandTile;