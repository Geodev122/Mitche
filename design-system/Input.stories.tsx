import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Input, InputProps } from './Input';

export default {
  title: 'Design System/Input',
  component: Input,
} as Meta;

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = { label: 'Name', placeholder: 'Enter your name' };
