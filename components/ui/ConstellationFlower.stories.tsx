import * as React from 'react';
import ConstellationFlower from './ConstellationFlower';

export default {
  title: 'UI/ConstellationFlower',
  component: ConstellationFlower
};

export const Empty = () => <ConstellationFlower />;

export const Sample = () => (
  <ConstellationFlower pillars={{ anchor: 10, bridge: 5, symbol: 8, dialog: 3, transpersonal: 6 }} size={200} />
);
