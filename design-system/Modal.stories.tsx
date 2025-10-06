import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Modal } from './Modal';

export default {
  title: 'Design System/Modal',
  component: Modal,
} as Meta;

const Template: Story<any> = (args) => <Modal {...args} />;

export const Default = Template.bind({});
Default.args = { isOpen: true, title: 'Example Modal', children: <div>Modal contents here</div> };
