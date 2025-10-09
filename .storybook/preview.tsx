import * as React from 'react';
import { Preview } from '@storybook/react';
import '../styles/theme.css';
import ThemeProvider from '../components/theme/ThemeProvider';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
  },
  decorators: [Story => <ThemeProvider><Story /></ThemeProvider>],
};

export default preview;
