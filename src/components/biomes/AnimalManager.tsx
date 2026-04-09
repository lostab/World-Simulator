import { useState, useEffect } from 'react';
import { Animal } from './Animal';
import type { AnimalType } from './Animal';

export function AnimalManager() {
  const [animals, setAnimals] = useState<{id: number, pos: [number, number, number], type: AnimalType}[]>([]);

  useEffect(() => {
    const initialAnimals: any[] = [];
    for (let i = 0; i < 20; i++) {
      initialAnimals.push({
        id: i,
        pos: [Math.random() * 100 - 50, 0, Math.random() * 100 - 50],
        type: Math.random() > 0.5 ? 'crab' : 'deer'
      });
    }
    setAnimals(initialAnimals);
  }, []);

  return (
    <group>
      {animals.map(a => (
        <Animal key={a.id} position={a.pos} type={a.type} />
      ))}
    </group>
  );
}
