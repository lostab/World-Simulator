import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const MeadowTile = memo(function MeadowTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#8bc34a" />;
});

export default MeadowTile;