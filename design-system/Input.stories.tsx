import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Input, InputProps } from './Input';

export default {
  title: 'Design System/Input',
  component: Input,
} as Meta;

const Template: StoryFn<InputProps> = (args: InputProps) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = { label: 'Name', placeholder: 'Enter your name' };
