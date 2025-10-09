import * as React from 'react';
import Card from './Card';

export default {
  title: 'UI/Card',
  component: Card
};

export const Default = () => (
  <Card style={{ width: 300 }}>
    <h3>Card title</h3>
    <p>Card body content goes here.</p>
  </Card>
);
