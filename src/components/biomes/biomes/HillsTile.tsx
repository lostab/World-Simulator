import { memo } from 'react';
import { BaseBiomeTile } from '../BaseBiomeTile';

const HillsTile = memo(function HillsTile({ position }: { position: [number, number, number] }) {
  return <BaseBiomeTile position={position} color="#7aa35f" />;
});

export default HillsTile;