import * as React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Modal } from './Modal';

export default {
  title: 'Design System/Modal',
  component: Modal,
} as Meta;

type ModalArgs = {
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
};

const Template: StoryFn<ModalArgs> = (args: ModalArgs) => <Modal {...args} />;

export const Default = Template.bind({});
Default.args = { isOpen: true, title: 'Example Modal', children: <div>Modal contents here</div>, onClose: () => {} };
