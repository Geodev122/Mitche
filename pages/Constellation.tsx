import React, { FC } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

// This component's functionality has been moved to the ProfilePanel.
// It now simply redirects to the home page.
const Constellation: FC = () => {
  return <ReactRouterDOM.Navigate to="/" replace />;
};

export default Constellation;
