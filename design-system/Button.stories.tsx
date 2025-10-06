import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, ButtonProps } from './Button';

export default {
  title: 'Design System/Button',
  component: Button,
} as Meta;

const Template: StoryFn<ButtonProps> = (args: ButtonProps) => <Button {...args}>Example</Button>;

export const Primary = Template.bind({});
Primary.args = { variant: 'primary' };

export const Secondary = Template.bind({});
Secondary.args = { variant: 'secondary' };
