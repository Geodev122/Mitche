import * as React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConstellationFlower from '../components/ui/ConstellationFlower';

export default {
  title: 'Showcase/Components',
};

export const All = () => (
  <div style={{ display: 'flex', gap: 20, padding: 24, alignItems: 'center' }}>
    <Card style={{ width: 300 }}>
      <h3>User Card</h3>
      <p>Example card content for showcase.</p>
      <div style={{ marginTop: 12 }}>
        <Button variant="primary">Action</Button>
        <span style={{ width: 8 }} />
        <Button variant="ghost">More</Button>
      </div>
    </Card>

    <div>
      <ConstellationFlower pillars={{ anchor: 12, bridge: 6, symbol: 8, dialog: 3, transpersonal: 9 }} size={220} />
    </div>
  </div>
);
