import * as React from 'react';
import { Meta } from '@storybook/react';
import Button from './Button';

const meta: Meta = {
  title: 'UI/Button',
  component: Button as any,
};

export default meta;

export const Primary = () => <Button variant="primary">Primary</Button>;
export const Ghost = () => <Button variant="ghost">Ghost</Button>;
