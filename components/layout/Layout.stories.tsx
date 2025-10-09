import * as React from 'react';
import Layout from './Layout';

export default {
  title: 'Layout/Layout',
  component: Layout
};

export const Default = () => (
  <div style={{ height: '600px' }}>
    <Layout />
  </div>
);

export const WithFAB = () => (
  <div style={{ height: '600px' }}>
    <Layout />
  </div>
);
